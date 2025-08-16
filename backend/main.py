# backend/main.py
from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.responses import JSONResponse, FileResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

# Proxy headers (prefer uvicorn’s middleware; fall back to starlette if missing)
try:
    from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
except Exception:  # pragma: no cover
    from starlette.middleware.proxy_headers import ProxyHeadersMiddleware  # type: ignore

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
import asyncio

# ── Env
load_dotenv()

# ── App
app = FastAPI(
    title="AIzamo AI Solutions",
    description="Full-Stack Website - AIzamo AI Solutions",
    version="1.0.0",
)
api_router = APIRouter(prefix="/api")

# ── Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("backend.main")

# ── Email (Gmail SMTP)
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
# one of: "ssl" (implicit TLS, port 465), "starttls" (port 587), "off"
SMTP_SECURITY = os.getenv("SMTP_SECURITY", "starttls").strip().lower()
SMTP_TIMEOUT = float(os.getenv("SMTP_TIMEOUT", "20"))  # seconds

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
        # Only minimal sanity check; accept empty
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

async def _smtp_send(message) -> None:
    """Connects and sends using configured TLS mode; raises on failure."""
    # Choose security mode automatically from env/port
    mode = SMTP_SECURITY
    if SMTP_PORT == 465 and mode == "starttls":
        mode = "ssl"
    logger.info(f"SMTP: connect {SMTP_SERVER}:{SMTP_PORT} (mode={mode})")

    if mode == "ssl":
        smtp = aiosmtplib.SMTP(hostname=SMTP_SERVER, port=SMTP_PORT, use_tls=True, timeout=SMTP_TIMEOUT)
        await smtp.connect()
        await smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
        await smtp.send_message(message)
        await smtp.quit()
        return

    smtp = aiosmtplib.SMTP(hostname=SMTP_SERVER, port=SMTP_PORT, timeout=SMTP_TIMEOUT)
    await smtp.connect()
    if mode == "starttls":
        await smtp.starttls()
    await smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
    await smtp.send_message(message)
    await smtp.quit()

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

        # Bound total send time to avoid Heroku H12s
        await asyncio.wait_for(_smtp_send(message), timeout=min(25.0, SMTP_TIMEOUT + 5.0))
        logger.info("Email notification sent")
        return True
    except asyncio.TimeoutError:
        logger.error("SMTP send timed out")
        return False
    except aiosmtplib.errors.SMTPException as e:
        logger.error(f"SMTPException while sending email: {e}")
        return False
    except Exception as e:
        logger.error(f"Failed to send email notification: {e}")
        return False

# ── GoHighLevel
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

# ── API Routes
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "database": "not-used", "timestamp": datetime.utcnow().isoformat()}

@api_router.get("/version")
async def version():
    return {
        "release": os.getenv("HEROKU_RELEASE_VERSION"),
        "commit": os.getenv("HEROKU_SLUG_COMMIT"),
        "time": datetime.utcnow().isoformat() + "Z",
    }

@api_router.post("/test-email")
async def test_email(to: Optional[EmailStr] = None):
    """Synchronous test to verify SMTP end-to-end."""
    dummy = ContactFormSubmission(
        firstName="SMTP",
        lastName="Test",
        email=to or TO_EMAIL,
        company=None,
        phone=None,
        service="Test",
        message="This is a test email from AIzamo.",
    )
    ok = await send_email_notification(dummy.dict())
    if not ok:
        raise HTTPException(status_code=502, detail="SMTP send failed")
    return {"ok": True, "to": to or TO_EMAIL, "mode": SMTP_SECURITY, "port": SMTP_PORT}

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
        message="Thank you for your message! We'll get back to you soon.",
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

# ── Mount API
app.include_router(api_router)

# ── CORS
_allowed = os.getenv("ALLOWED_ORIGINS", "*")
origins = ["*"] if _allowed == "*" else [o.strip() for o in _allowed.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Proxy/HTTPS/Hosts
app.add_middleware(ProxyHeadersMiddleware)
app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["aizamo.com", "www.aizamo.com", "*.herokuapp.com"],
)

# ── Security + static cache headers
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
async def hardening_middleware(request: Request, call_next):
    if _is_suspicious_path(request):
        return PlainTextResponse("Not found", status_code=404)

    resp = await call_next(request)

    # Security headers
    if request.headers.get("x-forwarded-proto", request.url.scheme) == "https":
        resp.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Referrer-Policy"] = "no-referrer-when-downgrade"

    # Cache static aggressively
    p = request.url.path
    if p.startswith("/static/") or p.startswith("/favicon") or p.endswith((".css", ".js", ".png", ".jpg", ".jpeg", ".svg", ".ico", ".webmanifest")):
        resp.headers.setdefault("Cache-Control", "public, max-age=31536000, immutable")

    return resp

# ── Serve CRA build at root
BUILD_DIR = os.getenv("BUILD_DIR", "build")
if os.path.exists(BUILD_DIR):
    app.mount("/", StaticFiles(directory=BUILD_DIR, html=True), name="client")
    logger.info("✅ Mounted CRA build at / (html=True)")
else:
    logger.warning("⚠️ Build directory not found; API-only mode")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
