# backend/main.py — static build mount + HTTPS + hardening (Mongo-free)
from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.responses import JSONResponse, FileResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.proxy_headers import ProxyHeadersMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from dotenv import load_dotenv

import os
import logging
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from pydantic import BaseModel, Field, EmailStr, validator

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import jinja2
import httpx

# ── Env
load_dotenv()

# ── App
app = FastAPI(
    title="AIzamo Website API",
    description="Full-stack website for AIzamo AI (Mongo-free)",
    version="1.0.0",
)
api_router = APIRouter(prefix="/api")

# ── Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# ── Email (Gmail SMTP)
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
FROM_EMAIL = os.getenv("FROM_EMAIL", "automate@aizamo.com")
TO_EMAIL = os.getenv("TO_EMAIL", "automate@aizamo.com")
SMTP_USERNAME = os.getenv("SMTP_USERNAME", FROM_EMAIL)
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

# ── GoHighLevel (LeadConnector API)
GHL_API_KEY = os.getenv("GHL_API_KEY", "")
GHL_LOCATION_ID = os.getenv("GHL_LOCATION_ID", "")
GHL_BASE_URL = "https://services.leadconnectorhq.com"

def _ghl_headers() -> dict:
    return {
        "Authorization": f"Bearer {GHL_API_KEY}",
        "Version": "2021-07-28",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

# ── Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class ContactFormSubmission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    firstName: str = Field(..., min_length=1, max_length=100)
    lastName: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    company: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, max_length=20)
    service: str = Field(..., min_length=1)
    message: str = Field(..., min_length=10, max_length=2000)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="new")

    @validator("phone", pre=True)
    def validate_phone(cls, v):
        # Why: basic anti-garbage validation; allow empty
        if v and v.strip():
            digits = "".join(filter(str.isdigit, v))
            if len(digits) < 7:
                raise ValueError("Phone number is too short")
        return v

class ContactFormCreate(BaseModel):
    firstName: str = Field(..., min_length=1, max_length=100)
    lastName: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    company: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, max_length=20)
    service: str = Field(..., min_length=1)
    message: str = Field(..., min_length=10, max_length=2000)

class ContactFormResponse(BaseModel):
    success: bool
    message: str
    contact_id: Optional[str] = None

# ── Email
def _contact_email_template() -> str:
    return """
    <!DOCTYPE html>
    <html>
      <body>
        <h2>New Contact Form Submission</h2>
        <p><b>Name:</b> {{ firstName }} {{ lastName }}</p>
        <p><b>Email:</b> {{ email }}</p>
        {% if company %}<p><b>Company:</b> {{ company }}</p>{% endif %}
        {% if phone %}<p><b>Phone:</b> {{ phone }}</p>{% endif %}
        <p><b>Service:</b> {{ service }}</p>
        <p><b>Message:</b><br>{{ message }}</p>
        <p>Submitted: {{ timestamp.strftime('%Y-%m-%d %H:%M:%S UTC') }}</p>
      </body>
    </html>
    """

async def send_email_notification(contact_data: dict) -> bool:
    if not (SMTP_USERNAME and SMTP_PASSWORD):
        logger.warning("Email credentials not configured, skipping email notification")
        return False
    try:
        html_content = jinja2.Template(_contact_email_template()).render(**contact_data)
        message = MIMEMultipart("alternative")
        message["Subject"] = f"New Contact Form Submission from {contact_data['firstName']} {contact_data['lastName']}"
        message["From"] = FROM_EMAIL
        message["To"] = TO_EMAIL
        message["Reply-To"] = contact_data.get("email", FROM_EMAIL)
        message.attach(MIMEText(html_content, "html"))
        async with aiosmtplib.SMTP(hostname=SMTP_SERVER, port=SMTP_PORT) as smtp:
            await smtp.connect()
            await smtp.starttls()
            await smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
            await smtp.send_message(message)
        logger.info("Email notification sent")
        return True
    except Exception as e:
        logger.error(f"Failed to send email notification: {e}")
        return False

# ── GoHighLevel integration
async def create_ghl_contact(contact: dict) -> Optional[dict]:
    if not (GHL_API_KEY and GHL_LOCATION_ID):
        logger.info("GHL not configured; skipping contact creation")
        return None
    payload = {
        "locationId": GHL_LOCATION_ID,
        "firstName": contact.get("firstName"),
        "lastName": contact.get("lastName"),
        "email": contact.get("email"),
        "phone": contact.get("phone") or None,
        "companyName": contact.get("company") or None,
        "source": "Website",
        "tags": ["Website Contact"],
    }
    payload = {k: v for k, v in payload.items() if v is not None}
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.post(f"{GHL_BASE_URL}/contacts/", headers=_ghl_headers(), json=payload)
        if r.status_code in (200, 201):
            logger.info("GHL contact created")
            return r.json()
        logger.error(f"GHL contact create failed [{r.status_code}]: {r.text}")
        return None
    except Exception as e:
        logger.error(f"GHL contact error: {e}")
        return None

async def create_ghl_task(contact_id: str, title: str, description: str = "", due_days: int = 3) -> Optional[dict]:
    if not (GHL_API_KEY and contact_id):
        return None
    due_date = (datetime.utcnow().date() + timedelta(days=due_days)).isoformat()
    payload = {"title": title, "description": description, "dueDate": due_date, "completed": False}
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.post(
                f"{GHL_BASE_URL}/contacts/{contact_id}/tasks",
                headers=_ghl_headers(),
                json=payload,
            )
        if r.status_code in (200, 201):
            logger.info("GHL task created")
            return r.json()
        logger.error(f"GHL task create failed [{r.status_code}]: {r.text}")
        return None
    except Exception as e:
        logger.error(f"GHL task error: {e}")
        return None

# ── API routes
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "database": "not-used", "timestamp": datetime.utcnow().isoformat()}

@api_router.post("/contact", response_model=ContactFormResponse)
async def submit_contact_form(contact_data: ContactFormCreate, background_tasks: BackgroundTasks):
    contact_submission = ContactFormSubmission(**contact_data.dict())
    ghl_contact_id: Optional[str] = None
    ghl_res = await create_ghl_contact(contact_submission.dict())
    if isinstance(ghl_res, dict):
        ghl_contact_id = ((ghl_res.get("contact") or {}).get("id") or ghl_res.get("id"))
    if ghl_contact_id:
        background_tasks.add_task(
            create_ghl_task,
            ghl_contact_id,
            title=f"Follow up: {contact_submission.firstName} {contact_submission.lastName}",
            description=f"Service interest: {contact_submission.service}",
            due_days=3,
        )
    background_tasks.add_task(send_email_notification, contact_submission.dict())
    logger.info(f"Contact form submitted: {contact_submission.email}")
    return ContactFormResponse(
        success=True,
        message="Thank you for your message! We'll get back to you within 12 hours.",
        contact_id=contact_submission.id,
    )

# In-memory status checks
_status_checks: List[StatusCheck] = []

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    obj = StatusCheck(client_name=input.client_name)
    _status_checks.append(obj)
    return obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    return _status_checks

# ── Mount API first (so it wins over the static mount)
app.include_router(api_router)

# ── CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],   # tighten for prod
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Proxy/HTTPS/Hosts (prevents HTTP leaks; trusts Heroku)
app.add_middleware(ProxyHeadersMiddleware)
app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["aizamo.com", "www.aizamo.com", "*.herokuapp.com"]
)

# ── Security headers + scanner blocking
@app.middleware("http")
async def security_headers_mw(request: Request, call_next):
    resp = await call_next(request)
    if request.headers.get("x-forwarded-proto", request.url.scheme) == "https":
        resp.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Referrer-Policy"] = "no-referrer-when-downgrade"
    return resp

SUSPECT_PREFIXES = ("/.", "/wp-", "/wp/", "/xmlrpc.php", "/telescope")
SUSPECT_EXACT = {"/.git", "/.git/config", "/.env", "/info.php", "/phpinfo.php"}
SUSPECT_EXTS = (".php", ".phps", ".bak", ".env", ".git", ".sql")

def _is_suspicious_path(request: Request) -> bool:
    p = request.url.path.lower()
    if any(p.startswith(pref) for pref in SUSPECT_PREFIXES): return True
    if p in SUSPECT_EXACT: return True
    if any(p.endswith(ext) for ext in SUSPECT_EXTS): return True
    if "rest_route=" in request.url.query.lower(): return True
    return False

@app.middleware("http")
async def block_scanners_mw(request: Request, call_next):
    if _is_suspicious_path(request):
        return PlainTextResponse("Not found", status_code=404)
    return await call_next(request)

# ── Lightweight health separate from SPA
@app.get("/healthz")
async def healthz():
    return {"ok": True}

# ── Serve CRA build (incl. /favicon.ico). Must be after API routes.
BUILD_DIR = "build"
if os.path.exists(BUILD_DIR):
    app.mount("/", StaticFiles(directory=BUILD_DIR, html=True), name="client")
    logger.info("✅ Mounted CRA build at / (html=True)")
else:
    logger.warning("⚠️ Build directory not found; API-only mode")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
