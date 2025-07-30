from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
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

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'aizamo_db')]

# Create the main app
app = FastAPI(
    title="AIzamo Website API",
    description="Full-stack website for AIzamo AI",
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

# Define Models
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
            # Basic phone validation - remove spaces and check length
            phone_clean = ''.join(filter(str.isdigit, v))
            if len(phone_clean) < 7:
                raise ValueError('Phone number is too short')
            return v
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

# Email templates
def get_contact_email_template():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission - AIzamo</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #402E2A; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #402E2A; }
            .value { padding: 5px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Contact Form Submission</h1>
                <p>AIzamo - AI Agency</p>
            </div>
            <div class="content">
                <div class="field">
                    <div class="label">Name:</div>
                    <div class="value">{{ firstName }} {{ lastName }}</div>
                </div>
                <div class="field">
                    <div class="label">Email:</div>
                    <div class="value">{{ email }}</div>
                </div>
                {% if company %}
                <div class="field">
                    <div class="label">Company:</div>
                    <div class="value">{{ company }}</div>
                </div>
                {% endif %}
                {% if phone %}
                <div class="field">
                    <div class="label">Phone:</div>
                    <div class="value">{{ phone }}</div>
                </div>
                {% endif %}
                <div class="field">
                    <div class="label">Service Interest:</div>
                    <div class="value">{{ service }}</div>
                </div>
                <div class="field">
                    <div class="label">Message:</div>
                    <div class="value">{{ message }}</div>
                </div>
                <div class="field">
                    <div class="label">Submitted:</div>
                    <div class="value">{{ timestamp.strftime('%Y-%m-%d %H:%M:%S UTC') }}</div>
                </div>
            </div>
            <div class="footer">
                <p>This email was sent from the AIzamo website contact form.</p>
            </div>
        </div>
    </body>
    </html>
    """

async def send_email_notification(contact_data: dict):
    """Send email notification for new contact form submission"""
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        logger.warning("Email credentials not configured, skipping email notification")
        return False
    
    try:
        template = jinja2.Template(get_contact_email_template())
        html_content = template.render(**contact_data)
        
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = f"New Contact Form Submission from {contact_data['firstName']} {contact_data['lastName']}"
        message["From"] = FROM_EMAIL
        message["To"] = TO_EMAIL
        
        # Create HTML part
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        # Send email
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

async def process_contact_integrations(contact_data: dict):
    """Process GoHighLevel integration for new contact"""
    try:
        # Create contact in GoHighLevel
        ghl_response = await create_ghl_contact(contact_data)
        
        if ghl_response and ghl_response.get('contact'):
            contact_id = ghl_response['contact']['id']
            
            # Create a follow-up task (3 days from now)
            follow_up_date = (datetime.utcnow() + timedelta(days=3)).strftime('%Y-%m-%d')
            
            task_data = {
                "title": f"Follow up with {contact_data.get('firstName', '')} {contact_data.get('lastName', '')}",
                "description": f"Follow up on AI automation inquiry. Service interest: {contact_data.get('service', 'N/A')}",
                "dueDate": follow_up_date,
                "completed": False
            }
            
            await create_ghl_task(contact_id, task_data)
            
            logger.info(f"Successfully processed GoHighLevel integration for contact: {contact_id}")
            return {"ghl_contact_id": contact_id}
            
    except GoHighLevelError as e:
        logger.error(f"GoHighLevel integration failed: {str(e)}")
        # Don't fail the entire request if GHL integration fails
        return {"ghl_error": str(e)}
    except Exception as e:
        logger.error(f"Unexpected error in GoHighLevel integration: {str(e)}")
        return {"ghl_error": "Integration failed"}

@api_router.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Test database connection
        await db.command("ismaster")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unavailable")

@api_router.post("/contact", response_model=ContactFormResponse)
async def submit_contact_form(
    contact_data: ContactFormCreate,
    background_tasks: BackgroundTasks
):
    """Handle contact form submissions with GoHighLevel integration"""
    try:
        # Create contact submission object
        contact_submission = ContactFormSubmission(**contact_data.dict())
        
        # Store in database
        result = await db.contact_submissions.insert_one(contact_submission.dict())
        
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to save contact submission")
        
        # Process GoHighLevel integration in background
        background_tasks.add_task(
            process_contact_integrations, 
            contact_submission.dict()
        )
        
        # Send email notification in background
        background_tasks.add_task(
            send_email_notification, 
            contact_submission.dict()
        )
        
        logger.info(f"Contact form submitted successfully: {contact_submission.email}")
        
        return ContactFormResponse(
            success=True,
            message="Thank you for your message! We'll get back to you within 12 hours.",
            contact_id=contact_submission.id
        )
        
    except Exception as e:
        logger.error(f"Contact form submission error: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/contact-submissions", response_model=List[ContactFormSubmission])
async def get_contact_submissions(limit: int = 50, skip: int = 0):
    """Get contact form submissions (for admin use)"""
    try:
        submissions = await db.contact_submissions.find() \
            .sort("timestamp", -1) \
            .skip(skip) \
            .limit(limit) \
            .to_list(limit)
        
        return [ContactFormSubmission(**submission) for submission in submissions]
        
    except Exception as e:
        logger.error(f"Error fetching contact submissions: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Legacy status check endpoints (keeping for compatibility)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the API router
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    return response
app.include_router(api_router)

# CORS middleware (must be before static files)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # In production, specify exact origins
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files from build directory
try:
    if os.path.exists("build") and os.path.exists("build/static"):
        app.mount("/static", StaticFiles(directory="build/static"), name="static")
        print("✅ Static files mounted successfully")
    else:
        print("⚠️  Build directory not found")
except Exception as e:
    print(f"❌ Error mounting static files: {e}")

# Root route
@app.get("/")
async def root():
    """Serve React app or API info"""
    try:
        if os.path.exists("build/index.html"):
            return FileResponse("build/index.html")
        else:
            return {
                "message": "AIzamo API is running",
                "version": "1.0.0",
                "status": "healthy",
                "note": "Frontend build not available - run build process"
            }
    except Exception as e:
        logger.error(f"Error serving root: {str(e)}")
        return {"message": "AIzamo API is running", "error": str(e)}

# Health check route (before catch-all)
@app.get("/health")
async def direct_health():
    """Direct health check (not under /api)"""
    try:
        await db.command("ismaster")
        return {
            "status": "healthy",
            "database": "connected",
            "frontend_build": "available" if os.path.exists("build/index.html") else "missing",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# Catch-all route for React SPA
@app.get("/{path:path}")
async def catch_all(path: str):
    """Catch-all route to serve React app for client-side routing"""
    # Skip API routes
    if path.startswith("api/") or path == "api":
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    # Skip static routes 
    if path.startswith("static/"):
        raise HTTPException(status_code=404, detail="Static file not found")
        
    # Serve React app for all other routes
    try:
        if os.path.exists("build/index.html"):
            return FileResponse("build/index.html")
        else:
            return {
                "error": "Frontend not available",
                "path": path,
                "message": "Please run the build process"
            }
    except Exception as e:
        logger.error(f"Error serving path {path}: {str(e)}")
        return {"error": "Server error", "path": path}

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("AIzamo API starting up...")
    
    # Create database indexes for better performance
    try:
        await db.contact_submissions.create_index("email")
        await db.contact_submissions.create_index("timestamp")
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.warning(f"Failed to create indexes: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down AIzamo API...")
    client.close()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
