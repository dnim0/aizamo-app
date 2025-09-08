# File: backend/main.py

from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.responses import PlainTextResponse
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
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import List, Optional, Dict, Any

from pydantic import BaseModel, Field, EmailStr, validator
import httpx
import smtplib
from email.mime.text import MIMEText
from email.utils import formataddr
from starlette.concurrency import run_in_threadpool

# ────────────────────────────────────────────────────────────────────────────────
# Environment
# ────────────────────────────────────────────────────────────────────────────────
load_dotenv()

# Email transport selector
EMAIL_TRANSPORT = os.getenv("EMAIL_TRANSPORT", "auto").lower()  # smtp | emailjs | auto | off
EMAIL_DEBUG_SYNC = os.getenv("EMAIL_DEBUG_SYNC", "false").lower() in {"1", "true", "yes"}

# EmailJS
EMAILJS_SERVICE_ID = os.getenv("EMAILJS_SERVICE_ID", "")
EMAILJS_TEMPLATE_ID = os.getenv("EMAILJS_TEMPLATE_ID", "")
EMAILJS_PUBLIC_KEY = os.getenv("EMAILJS_PUBLIC_KEY", "")      # required by EmailJS
EMAILJS_PRIVATE_KEY = os.getenv("EMAILJS_PRIVATE_KEY", "")    # optional
EMAILJS_ORIGIN = os.getenv("EMAILJS_ORIGIN", "")              # optional

# SMTP
SMTP_SERVER = os.getenv("SMTP_SERVER", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "0") or 0)
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_SECURITY = (os.getenv("SMTP_SECURITY", "").lower() or "").strip()  # "ssl" | "tls" | ""
FROM_EMAIL = os.getenv("FROM_EMAIL", "")
TO_EMAIL = os.getenv("TO_EMAIL", "")

LOCAL_TZ = os.getenv("LOCAL_TZ", "Europe/Moscow")
BUILD_DIR = os.getenv("BUILD_DIR", "build")  # static site dir

# ────────────────────────────────────────────────────────────────────────────────
# App
# ────────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AIzamo AI Solutions",
    description="Full-Stack Website - AIzamo AI Solutions",
    version="2.0.0",
)
api_router = APIRouter(prefix="/api")

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

async def parse_contact_request(request: Request) -> ContactFormCreate:
    ct = (request.headers.get("content-type") or "").lower()
    try:
        if "application/json" in ct:
            data = await request.json()
        else:
            form = await request.form()  # requires python-multipart for multipart/form-data
            data = {k: form.get(k) for k in ("firstName","lastName","email","company","phone","service","message")}
        return ContactFormCreate(**data)
    except AssertionError as e:
        # missing python-multipart → clearer client error
        raise HTTPException(status_code=415, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid contact payload: {e}")

# ────────────────────────────────────────────────────────────────────────────────
# Email Transports
# ────────────────────────────────────────────────────────────────────────────────
def _emailjs_config_ok() -> bool:
    return bool(EMAILJS_SERVICE_ID and EMAILJS_TEMPLATE_ID and EMAILJS_PUBLIC_KEY)

async def _emailjs_send(template_params: Dict[str, Any]) -> bool:
    if not _emailjs_config_ok():
        logger.error("EmailJS not configured (need SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY).")
        return False

    payload: Dict[str, Any] = {
        "service_id": EMAILJS_SERVICE_ID,
        "template_id": EMAILJS_TEMPLATE_ID,
        "user_id": EMAILJS_PUBLIC_KEY,
        "template_params": template_params,
    }
    if EMAILJS_PRIVATE_KEY:
        payload["accessToken"] = EMAILJS_PRIVATE_KEY

    headers = {"Content-Type": "application/json"}
    if EMAILJS_ORIGIN:
        headers["Origin"] = EMAILJS_ORIGIN

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.post("https://api.emailjs.com/api/v1.0/email/send", json=payload, headers=headers)
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
    return await run_in_threadpool(_smtp_send_sync, subject, body)

async def send_email(contact: ContactFormSubmission) -> bool:
    """Send via EmailJS; if it fails, fall back to SMTP."""
    subject = f"New Contact — {contact.firstName} {contact.lastName} ({contact.service})"
    lines = [
        f"Time: {_now_local_str()}",
        f"Name: {contact.firstName} {contact.lastName}",
        f"Email: {contact.email}",
        f"Phone: {contact.phone or ''}",
        f"Company: {contact.company or ''}",
        f"Service: {contact.service}",
        "",
        "Message:",
        contact.message,
    ]
    body = "\n".join(lines)

    # Transport selection
    t = EMAIL_TRANSPORT
    if t == "off":
        logger.error("Email transport disabled (EMAIL_TRANSPORT=off)")
        return False

    if t == "emailjs":
        return await _emailjs_send({
            "name": f"{contact.firstName} {contact.lastName}".strip(),
            "company": contact.company or "",
            "service": contact.service,
            "email": contact.email,
            "phone": contact.phone or "",
            "time": _now_local_str(),
            "message": contact.message,
        })

    if t == "smtp":
        return await _smtp_send(subject, body)

    # auto: try EmailJS then SMTP
    ok = await _emailjs_send({
        "name": f"{contact.firstName} {contact.lastName}".strip(),
        "company": contact.company or "",
        "service": contact.service,
        "email": contact.email,
        "phone": contact.phone or "",
        "time": _now_local_str(),
        "message": contact.message,
    })
    if ok:
        return True
    return await _smtp_send(subject, body)

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
    try:
        contact_data = await parse_contact_request(request)
        contact_submission = ContactFormSubmission(**contact_data.dict())
    except Exception as e:
        logger.exception("Contact parse/validation error")
        raise HTTPException(status_code=400, detail=f"Bad payload: {e}")

    email_available = (
        (EMAIL_TRANSPORT in {"emailjs","auto"} and _emailjs_config_ok())
        or (EMAIL_TRANSPORT in {"smtp","auto"} and SMTP_SERVER and SMTP_PORT and SMTP_USERNAME and SMTP_PASSWORD and FROM_EMAIL and TO_EMAIL)
    )
    if not email_available:
        logger.error("No email transport configured")
        raise HTTPException(status_code=500, detail="Email service unavailable")

    try:
        if EMAIL_DEBUG_SYNC:
            ok = await send_email(contact_submission)
            if not ok:
                raise RuntimeError("Email send failed")
        else:
            background_tasks.add_task(send_email, contact_submission)
    except Exception as e:
        logger.exception("Contact handler error")
        raise HTTPException(status_code=500, detail=f"Server error: {e}")

    logger.info(f"Contact form submitted: {contact_submission.email}")
    return ContactFormResponse(success=True, message="Thanks! We'll get back to you soon.", contact_id=contact_submission.id)

# EmailJS diagnostics
@api_router.get("/test-emailjs")
async def test_emailjs_get():
    sample = {
        "name": "Test User (GET)",
        "company": "AIzamo",
        "service": "Testing",
        "email": "test@aizamo.com",
        "phone": "+1 (403) 800-3135",
        "time": _now_local_str(),
        "message": "Server test from GET /api/test-emailjs."
    }
    ok = await _emailjs_send(sample)
    if not ok:
        raise HTTPException(status_code=500, detail="EmailJS send failed (check logs)")
    return {"status": 200, "body": "OK"}

@api_router.post("/test-emailjs")
async def test_emailjs_post():
    sample = {
        "name": "Test User (POST)",
        "company": "AIzamo",
        "service": "Testing",
        "email": "test@aizamo.com",
        "phone": "+1 (403) 800-3135",
        "time": _now_local_str(),
        "message": "Server test from POST /api/test-emailjs."
    }
    ok = await _emailjs_send(sample)
    if not ok:
        raise HTTPException(status_code=500, detail="EmailJS send failed (check logs)")
    return {"status": 200, "body": "OK"}

# SMTP diagnostics
@api_router.get("/test-smtp")
async def test_smtp():
    subject = "SMTP Test — AIzamo"
    body = f"Time: {_now_local_str()}\nThis is a test email from /api/test-smtp."
    ok = await _smtp_send(subject, body)
    if not ok:
        raise HTTPException(status_code=500, detail="SMTP send failed (check logs)")
    return {"status": 200, "body": "OK"}

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

# CORS
_allowed = os.getenv("ALLOWED_ORIGINS", "*")
origins = ["*"] if _allowed == "*" else [o.strip() for o in _allowed.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Proxy/HTTPS/Hosts
app.add_middleware(ProxyHeadersMiddleware)        # trust X-Forwarded-* from Heroku router
app.add_middleware(HTTPSRedirectMiddleware)       # force https
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["aizamo.com", "www.aizamo.com", "*.herokuapp.com"],
)

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

    if request.headers.get("x-forwarded-proto", request.url.scheme) == "https":
        resp.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Referrer-Policy"] = "no-referrer-when-downgrade"

    p = request.url.path
    if p.startswith("/static/") or p.startswith("/favicon") or p.endswith((".css", ".js", ".png", ".jpg", ".jpeg", ".svg", ".ico", ".webmanifest")):
        resp.headers.setdefault("Cache-Control", "public, max-age=31536000, immutable")

    return resp

# Lightweight health for infra
@app.get("/healthz")
async def healthz():
    return {"ok": True}

# Serve static site at root
if os.path.exists(BUILD_DIR):
    app.mount("/", StaticFiles(directory=BUILD_DIR, html=True), name="client")
    logger.info(f"✅ Mounted static site at / (dir={BUILD_DIR})")
else:
    logger.warning("⚠️ Static directory not found; API-only mode")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
