# backend/main.py
from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging
from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import jinja2

# Load environment variables
load_dotenv()

# Create the main app
app = FastAPI(
    title="AIzamo Website API",
    description="Full-stack website for AIzamo AI (Mongo-free)",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "hello@aizamo.com")
TO_EMAIL = os.getenv("TO_EMAIL", "hello@aizamo.com")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Optional GoHighLevel stubs (safe no-ops if unset)
GHL_API_KEY = os.getenv("GHL_API_KEY", "")
GHL_LOCATION_ID = os.getenv("GHL_LOCATION_ID", "")

class GoHighLevelError(Exception):
    pass

async def create_ghl_contact(contact_data: dict):
    if not (GHL_API_KEY and GHL_LOCATION_ID):
        return None
    return None

async def create_ghl_task(contact_id: str, task_data: dict):
    if not (GHL_API_KEY and GHL_LOCATION_ID):
        return None
    return None

# Models
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
    
    @validator('phone', pre=True)
    def validate_phone(cls, v):
        if v and v.strip():
            phone_clean = ''.join(filter(str.isdigit, v))
            if len(phone_clean) < 7:
                raise ValueError('Phone number is too short')
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

# Email template
def get_contact_email_template():
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

async def send_email_notification(contact_data: dict):
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        logger.warning("Email credentials not configured, skipping email notification")
        return False
    try:
        html_content = jinja2.Template(get_contact_email_template()).render(**contact_data)
        message = MIMEMultipart("alternative")
        message["Subject"] = f"New Contact Form Submission from {contact_data['firstName']} {contact_data['lastName']}"
        message["From"] = FROM_EMAIL
        message["To"] = TO_EMAIL
        message.attach(MIMEText(html_content, "html"))
        async with aiosmtplib.SMTP(hostname=SMTP_SERVER, port=SMTP_PORT) as smtp:
            await smtp.connect()
            await smtp.starttls()
            await smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
            await smtp.send_message(message)
        logger.info(f"Email notification sent for contact submission: {contact_data['email']}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email notification: {str(e)}")
        return False

# Endpoints
@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "not-used",
        "timestamp": datetime.utcnow().isoformat()
    }

@api_router.post("/contact", response_model=ContactFormResponse)
async def submit_contact_form(contact_data: ContactFormCreate, background_tasks: BackgroundTasks):
    contact_submission = ContactFormSubmission(**contact_data.dict())
    background_tasks.add_task(create_ghl_contact, contact_submission.dict())
    background_tasks.add_task(send_email_notification, contact_submission.dict())
    logger.info(f"Contact form submitted: {contact_submission.email}")
    return ContactFormResponse(
        success=True,
        message="Thank you for your message! We'll get back to you within 12 hours.",
        contact_id=contact_submission.id
    )

# In-memory status checks
_status_checks: List[StatusCheck] = []

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(client_name=input.client_name)
    _status_checks.append(status_obj)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    return _status_checks

app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files from build directory
if os.path.exists("build/static"):
    app.mount("/static", StaticFiles(directory="build/static"), name="static")
    logger.info("✅ Static files mounted successfully")
else:
    logger.warning("⚠️ Build directory not found")

# Root route
@app.get("/")
async def root():
    if os.path.exists("build/index.html"):
        return FileResponse("build/index.html")
    return {"message": "AIzamo API is running", "frontend_build": "missing"}

# Catch-all route for React SPA
@app.get("/{path:path}")
async def catch_all(path: str):
    if path.startswith("api/") or path.startswith("static/"):
        raise HTTPException(status_code=404, detail="Not found")
    if os.path.exists("build/index.html"):
        return FileResponse("build/index.html")
    return {"error": "Frontend not available", "path": path}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
