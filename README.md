# 🚀 AIzamo - AI Agency Website

**Professional website for AIzamo AI Agency with GoHighLevel CRM integration**

## 🌟 Features

- **Modern React Frontend** - Responsive design with Tailwind CSS
- **FastAPI Backend** - High-performance Python API
- **GoHighLevel Integration** - Automatic lead capture and task creation
- **Email Notifications** - Automated email alerts for new contacts
- **MongoDB Storage** - Persistent data storage
- **Production Ready** - Optimized for Heroku deployment

## 🏗️ Architecture

```
AIzamo Website
├── Frontend (React + Tailwind)
│   ├── Hero Section
│   ├── Services Showcase
│   ├── About Section
│   ├── Client Testimonials
│   ├── Process Overview
│   └── Contact Form
├── Backend (FastAPI + MongoDB)
│   ├── Contact Form API
│   ├── Email Notifications
│   ├── GoHighLevel Integration
│   └── Health Monitoring
└── Integrations
    ├── GoHighLevel CRM
    ├── Email SMTP
    └── MongoDB Atlas
```

## 🚀 Quick Start

### Local Development

1. **Clone repository:**
```bash
git clone https://github.com/yourusername/aizamo-website.git
cd aizamo-website
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
cd frontend && npm install && cd ..
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Build and run:**
```bash
npm run build  # Builds React app
python main.py # Starts server at http://localhost:8000
```

### Heroku Deployment

**Follow the complete guide:** [HEROKU_DEPLOYMENT_GUIDE.md](HEROKU_DEPLOYMENT_GUIDE.md)

**Quick deployment:**
1. Create Heroku app
2. Connect GitHub repository  
3. Set environment variables
4. Deploy from main branch

## 📋 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URL` | MongoDB connection string | ✅ |
| `DB_NAME` | Database name | ✅ |
| `SMTP_USERNAME` | Email account | ✅ |
| `SMTP_PASSWORD` | Email password | ✅ |
| `GHL_API_KEY` | GoHighLevel API key | ✅ |
| `GHL_LOCATION_ID` | GoHighLevel location ID | ✅ |
| `SECRET_KEY` | App security key | ✅ |

## 🔗 API Endpoints

- `GET /` - Serves React application
- `GET /api/health` - Health check
- `POST /api/contact` - Submit contact form
- `GET /api/contact-submissions` - Get submissions (admin)

## 🎯 GoHighLevel Integration

**Automatic workflow:**
1. Visitor submits contact form
2. Contact created in GoHighLevel
3. Follow-up task scheduled (3 days)
4. Email notification sent
5. Data stored in MongoDB

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Tailwind CSS
- Lucide React Icons
- Responsive Design

**Backend:**
- FastAPI
- Pydantic Validation
- Async/Await
- Background Tasks

**Database:**
- MongoDB
- Motor (Async MongoDB)

**Integrations:**
- GoHighLevel API
- SMTP Email
- Heroku Deployment

## 📊 Monitoring

- Health check endpoint: `/api/health`
- Application logs via Heroku dashboard
- MongoDB Atlas monitoring
- GoHighLevel activity tracking

## 🔒 Security Features

- Input validation with Pydantic
- Email format validation
- Rate limiting ready
- Environment variable protection
- CORS middleware
- Global exception handling

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop enhancement
- Cross-browser compatibility

## 🚀 Performance

- Async request handling
- Background task processing
- Static file serving
- Database indexing
- Production optimization

## 📞 Support

For deployment help or customization:
- **Email:** hello@aizamo.com
- **Phone:** +1 (403) 800-3135

## 📄 License

MIT License - feel free to use for your projects

---

**Built with ❤️ by AIzamo - Automate the Ordinary, Scale the Extraordinary**
