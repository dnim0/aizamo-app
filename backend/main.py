# File: backend/main.py

from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, Request, Depends
from fastapi.responses import JSONResponse, FileResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

try:
    from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
except Exception:
    from starlette.middleware.proxy_headers import ProxyHeadersMiddleware  # type: ignore

from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from dotenv import load_dotenv
import os
import logging
import uuid
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from typing import List, Optional, Dict, Any

from pydantic import BaseModel, Field, EmailStr, validator
import httpx
import smtplib
from email.mime.text import MIMEText
from email.utils import formataddr
from starlette.concurrency import run_in_threadpool

# ────────────────────────────────────────────────────────────────────────────────
# Env
# ────────────────────────────────────────────────────────────────────────────────
load_dotenv()

# EmailJS (server-side REST)
EMAILJS_SERVICE_ID = os.getenv("EMAILJS_SERVICE_ID", "")
EMAILJS_TEMPLATE_ID = os.getenv("EMAILJS_TEMPLATE_ID", "")
EMAILJS_PUBLIC_KEY = os.getenv("EMAILJS_PUBLIC_KEY", "")  # must start with "public_"
EMAILJS_ORIGIN = os.getenv("EMAILJS_ORIGIN", "")          # optional; should match EmailJS Allowed Origins
EMAIL_DEBUG_SYNC = os.getenv("EMAIL_DEBUG_SYNC", "false").lower() in {"1", "true", "yes"}

# SMTP (fallback if EmailJS misconfigured)
SMTP_SERVER = os.getenv("SMTP_SERVER", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "0") or 0)
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_SECURITY = (os.getenv("SMTP_SECURITY", "").lower() or "").strip()  # "ssl" | "tls" | ""
FROM_EMAIL = os.getenv("FROM_EMAIL", "")
TO_EMAIL = os.getenv("TO_EMAIL", "")

LOCAL_TZ = os.getenv("LOCAL_TZ", "Europe/Moscow")

# GoHighLevel (LeadConnector)
GHL_API_KEY = os.getenv("GHL_API_KEY", "")
GHL_LOCATION_ID = os.getenv("GHL_LOCATION_ID", "")
GHL_BASE_URL = "https://services.leadconnectorhq.com"

# Build dir (SPA assets)
BUILD_DIR = os.getenv("BUILD_DIR", "build")

# ────────────────────────────────────────────────────────────────────────────────
# App
# ────────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AIzamo AI Solutions",
    description="Full-Stack Website - AIzamo AI Solutions",
    version="1.1.0",
)
api_router = APIRouter(prefix="/api")

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# ────────────────────────────────────────────────────────────────────────────────
# Models
# ────────────────────────────────────────────────────────────────────────────────
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
        if v and str(v).strip():
            digits = "".join(filter(str.isdigit, str(v)))
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

# ────────────────────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────────────────────

def _now_local_str() -> str:
    now_utc = datetime.now(ZoneInfo("UTC"))
    try:
        tz = ZoneInfo(LOCAL_TZ)
    except Exception:
        tz = ZoneInfo("UTC")
    return now_utc.astimezone(tz).strftime("%Y-%m-%d %H:%M:%S %Z")

# Normalize incoming request (accept JSON or form-encoded)
async def parse_contact_request(request: Request) -> ContactFormCreate:
    ct = request.headers.get("content-type", "").lower()
    data: Dict[str, Any]
    if "application/json" in ct:
        data = await request.json()
    else:
        form = await request.form()
        data = {k: form.get(k) for k in ("firstName","lastName","email","company","phone","service","message")}
    try:
        return ContactFormCreate(**data)
    except Exception as e:
        # Be explicit to help frontend integration
        raise HTTPException(status_code=422, detail=f"Invalid contact payload: {e}")

# ────────────────────────────────────────────────────────────────────────────────
# Email sending (EmailJS → SMTP fallback)
# ────────────────────────────────────────────────────────────────────────────────

def _emailjs_config_ok() -> bool:
    # Avoid common pitfall: missing "public_" prefix
    if not (EMAILJS_SERVICE_ID and EMAILJS_TEMPLATE_ID and EMAILJS_PUBLIC_KEY):
        return False
    if not EMAILJS_PUBLIC_KEY.startswith("public_"):
        logger.error("EmailJS public key must start with 'public_' (misconfigured)")
        return False
    return True

async def _emailjs_send(template_params: Dict[str, Any]) -> bool:
    if not _emailjs_config_ok():
        return False

    payload = {
        "service_id": EMAILJS_SERVICE_ID,
        "template_id": EMAILJS_TEMPLATE_ID,
        "user_id": EMAILJS_PUBLIC_KEY,
        "template_params": template_params,
    }

    headers = {"Content-Type": "application/json"}
    if EMAILJS_ORIGIN:
        headers["Origin"] = EMAILJS_ORIGIN

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.post(
                "https://api.emailjs.com/api/v1.0/email/send",
                json=payload,
                headers=headers,
            )
        if r.status_code in (200, 202):
            logger.info("EmailJS: email accepted")
            return True
        logger.error(f"EmailJS failed [{r.status_code}]: {r.text}")
        return False
    except Exception as e:
        logger.error(f"EmailJS exception: {e}")
        return False

def _smtp_send_sync(subject: str, body: str) -> bool:
    if not (SMTP_SERVER and SMTP_PORT and SMTP_USERNAME and SMTP_PASSWORD and FROM_EMAIL and TO_EMAIL):
        return False
    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = formataddr(("AIzamo", FROM_EMAIL))
    msg["To"] = TO_EMAIL

    try:
        if SMTP_SECURITY == "ssl":
            with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, timeout=20) as s:
                s.login(SMTP_USERNAME, SMTP_PASSWORD)
                s.sendmail(FROM_EMAIL, [TO_EMAIL], msg.as_string())
        else:
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=20) as s:
                s.ehlo()
                if SMTP_SECURITY == "tls":
                    s.starttls()
                s.login(SMTP_USERNAME, SMTP_PASSWORD)
                s.sendmail(FROM_EMAIL, [TO_EMAIL], msg.as_string())
        logger.info("SMTP: email sent")
        return True
    except Exception as e:
        logger.error(f"SMTP exception: {e}")
        return False

async def _smtp_send(subject: str, body: str) -> bool:
    # Run blocking SMTP in thread pool
    return await run_in_threadpool(_smtp_send_sync, subject, body)

async def send_email(contact: ContactFormSubmission) -> bool:
    subject = f"New Contact — {contact.firstName} {contact.lastName} ({contact.service})"
    body = (
        f"Time: {_now_local_str()}\n"
        f"Name: {contact.firstName} {contact.lastName}\n"
        f"Email: {contact.email}\n"
        f"Phone: {contact.phone or ''}\n"
        f"Company: {contact.company or ''}\n"
        f"Service: {contact.service}\n\n"
        f"Message:\n{contact.message}\n"
    )

    # Prefer EmailJS if configured properly
    if await _emailjs_send({
        "name": f"{contact.firstName} {contact.lastName}".strip(),
        "company": contact.company or "",
        "service": contact.service,
        "email": contact.email,
        "phone": contact.phone or "",
        "time": _now_local_str(),
        "message": contact.message,
    }):
        return True

    # Fallback to SMTP if available
    if await _smtp_send(subject, body):
        return True

    logger.error("All email transports failed (EmailJS + SMTP)")
    return False

# ────────────────────────────────────────────────────────────────────────────────
# GoHighLevel
# ────────────────────────────────────────────────────────────────────────────────

def _ghl_headers() -> dict:
    return {
        "Authorization": f"Bearer {GHL_API_KEY}",
        "Version": "2021-07-28",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

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

# ────────────────────────────────────────────────────────────────────────────────
# API Routes
# ────────────────────────────────────────────────────────────────────────────────
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@api_router.get("/version")
async def version():
    return {
        "release": os.getenv("HEROKU_RELEASE_VERSION"),
        "commit": os.getenv("HEROKU_SLUG_COMMIT"),
        "time": datetime.utcnow().isoformat() + "Z",
    }

@api_router.post("/contact", response_model=ContactFormResponse)
async def submit_contact_form(request: Request, background_tasks: BackgroundTasks):
    contact_data = await parse_contact_request(request)
    contact_submission = ContactFormSubmission(**contact_data.dict())

    # Fail fast if both email transports are unavailable
    if not _emailjs_config_ok() and not (SMTP_SERVER and SMTP_PORT and SMTP_USERNAME and SMTP_PASSWORD and FROM_EMAIL and TO_EMAIL):
        logger.error("No email transport configured (EmailJS misconfigured and SMTP missing)")
        raise HTTPException(status_code=500, detail="Email service unavailable")

    async def _ghl_workflow(contact_dict: dict):
        try:
            res = await create_ghl_contact(contact_dict)
            contact_id = ((res or {}).get("contact") or {}).get("id") or (res or {}).get("id")
            if contact_id:
                await create_ghl_task(
                    contact_id,
                    title=f"Follow up: {contact_dict.get('firstName','')} {contact_dict.get('lastName','')}",
                    description=f"Service interest: {contact_dict.get('service','')}",
                    due_days=3,
                )
        except Exception as e:
            logger.error(f"GHL workflow error: {e}")

    # Allow sync email in prod debugging if EMAIL_DEBUG_SYNC=true
    if EMAIL_DEBUG_SYNC:
        ok = await send_email(contact_submission)
        if not ok:
            raise HTTPException(status_code=500, detail="Email send failed (see logs)")
        background_tasks.add_task(_ghl_workflow, contact_submission.dict())
    else:
        background_tasks.add_task(send_email, contact_submission)
        background_tasks.add_task(_ghl_workflow, contact_submission.dict())

    logger.info(f"Contact form submitted: {contact_submission.email}")
    return ContactFormResponse(
        success=True,
        message="Thank you for your message! We'll get back to you soon.",
        contact_id=contact_submission.id,
    )

# EmailJS tests
@api_router.get("/test-emailjs")
async def test_emailjs_get():
    sample = {
        "name": "Test User (GET)",
        "company": "AIzamo",
        "service": "Testing",
        "email": "test@aizamo.com",
        "phone": "+1 (403) 800-3135",
        "time": _now_local_str(),
        "message": "Server test from GET /api/test-emailjs.",
    }
    ok = await _emailjs_send(sample)
    if not ok:
        raise HTTPException(status_code=500, detail="EmailJS send failed (check logs)")
    return {"ok": True}

# SMTP test
@api_router.get("/test-smtp")
async def test_smtp():
    ok = await _smtp_send("SMTP Test", f"SMTP test at {_now_local_str()}")
    if not ok:
        raise HTTPException(status_code=500, detail="SMTP send failed (check logs)")
    return {"ok": True}

# GHL test
@api_router.get("/test-ghl")
async def test_ghl():
    if not (GHL_API_KEY and GHL_LOCATION_ID):
        raise HTTPException(status_code=500, detail="GHL not configured")
    sample = {
        "firstName": "Test",
        "lastName": "User",
        "email": "test@aizamo.com",
        "service": "Testing",
    }
    res = await create_ghl_contact(sample)
    if not res:
        raise HTTPException(status_code=500, detail="GHL contact creation failed (check logs)")
    return res

# Simple status memory
_status_checks: List[StatusCheck] = []

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    obj = StatusCheck(client_name=input.client_name)
    _status_checks.append(obj)
    return obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    return _status_checks

# Mount API
app.include_router(api_router)

# CORS (avoid '*' with credentials)
_allowed = os.getenv("ALLOWED_ORIGINS", "*")
origins = ["*"] if _allowed == "*" else [o.strip() for o in _allowed.split(",") if o.strip()]
allow_creds = False if origins == ["*"] else True
app.add_middleware(
    CORSMiddleware,
    allow_credentials=allow_creds,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Proxy/HTTPS/Hosts
app.add_middleware(ProxyHeadersMiddleware)        # trust X-Forwarded-* from Heroku router
app.add_middleware(HTTPSRedirectMiddleware)       # force https

trusted_hosts = ["aizamo.com", "www.aizamo.com", "*.herokuapp.com"]
app.add_middleware(TrustedHostMiddleware, allowed_hosts=trusted_hosts)

# Security + scanner blocking + cache headers
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

# Lightweight health for infra
@app.get("/healthz")
async def healthz():
    return {"ok": True}

# Serve SPA at root
if os.path.exists(BUILD_DIR):
    app.mount("/", StaticFiles(directory=BUILD_DIR, html=True), name="client")
    logger.info(f"✅ Mounted static site at / (dir={BUILD_DIR})")
else:
    logger.warning(f"⚠️ Build directory not found ({BUILD_DIR}); API-only mode")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
