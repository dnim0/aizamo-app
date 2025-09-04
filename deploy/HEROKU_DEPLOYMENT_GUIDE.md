# 🚀 **Heroku Deployment Guide for AIzamo Website**

## **What's Changed for Heroku**

Your repository has been restructured for Heroku deployment:

```
aizamo-website/
├── main.py              # Combined FastAPI server (serves API + React app)
├── gohighlevel.py       # GoHighLevel integration
├── requirements.txt     # Python dependencies
├── package.json         # Node.js dependencies + build scripts
├── Procfile            # Tells Heroku how to run your app
├── runtime.txt         # Python version specification
├── .env.example        # Environment variables template
├── frontend/           # React app source code
│   ├── src/
│   ├── public/
│   └── package.json
└── build/              # React build output (created during deployment)
```

## **Step-by-Step Deployment**

### **Step 1: Update Your GitHub Repository**

1. **Commit all changes:**
```bash
git add .
git commit -m "Restructured for Heroku deployment with GoHighLevel integration"
git push origin main
```

### **Step 2: Create Heroku Account & App**

1. **Sign up at [heroku.com](https://heroku.com)**
2. **Click "New" → "Create new app"**
3. **App name:** Type `aizamo-website` (or any name)
4. **Region:** Choose closest to you
5. **Click "Create app"**

### **Step 3: Connect GitHub Repository**

1. **In Heroku Dashboard → "Deploy" tab**
2. **Deployment method:** Click "GitHub"
3. **Connect to GitHub:** Click "Connect to GitHub"
4. **Search:** Type `aizamo-website`
5. **Click "Connect"** next to your repository

### **Step 4: Set Environment Variables**

1. **Click "Settings" tab**
2. **Click "Reveal Config Vars"**
3. **Add these variables ONE BY ONE:**

```
DB_NAME = aizamo_production
SMTP_SERVER = smtp.gmail.com
SMTP_PORT = 587
SMTP_USERNAME = your-email@gmail.com
SMTP_PASSWORD = your-gmail-app-password
FROM_EMAIL = hello@aizamo.com
TO_EMAIL = your-notification-email@gmail.com
SECRET_KEY = your-super-secret-random-string
ENVIRONMENT = production
```

### **Step 5: Database Setup (MongoDB Atlas - FREE)**

1. **Go to [mongodb.com/atlas](https://mongodb.com/atlas)**
2. **Sign up → "Build a Database" → "FREE"**
3. **Choose AWS and closest region**
4. **Username/Password:** Create strong credentials
5. **Click "Create User" → "Choose a connection method"**
6. **Click "Drivers" → Copy connection string**
7. **Replace `<password>` with your actual password**
8. **In Heroku Config Vars, add:**
```
MONGO_URL = mongodb+srv://username:password@cluster.mongodb.net/aizamo_production
```

### **Step 6: GoHighLevel Setup**

1. **Login to GoHighLevel**
2. **Settings → Locations → [Your Location]**
3. **Scroll to "API" section → Generate API Key**
4. **Copy the API Key**
5. **In Heroku Config Vars, add:**
```
GHL_API_KEY = your-copied-api-key
GHL_LOCATION_ID = your-location-id
```

**To find Location ID:**
- Look at your GoHighLevel URL: `/location/abc123def456`
- Copy the `abc123def456` part

### **Step 7: Deploy**

1. **Back to "Deploy" tab**
2. **Scroll to "Manual deploy"**
3. **Choose "main" branch**
4. **Click "Deploy Branch"**
5. **Wait 5-10 minutes for build to complete**
6. **Click "View" when done**

### **Step 8: Custom Domain (Optional)**

1. **In Heroku → Settings → Domains**
2. **Click "Add domain"**
3. **Enter `aizamo.com`**
4. **Update your domain's DNS:**
   - **Type:** CNAME
   - **Name:** @
   - **Value:** your-app-name.herokuapp.com

## **Testing Your Deployment**

### **Check Everything Works:**

1. **Visit:** `https://your-app-name.herokuapp.com`
2. **Test contact form:** Submit a test message
3. **Check API:** Visit `https://your-app-name.herokuapp.com/api/health`
4. **Verify GoHighLevel:** Check if test contact appears in GHL
5. **Test email:** Confirm you receive notification email

## **Environment Variables Explained**

| Variable | What It Does | Where to Get It |
|----------|--------------|-----------------|
| `MONGO_URL` | Database connection | MongoDB Atlas dashboard |
| `SMTP_USERNAME` | Email sending account | Your Gmail address |
| `SMTP_PASSWORD` | Email password | Gmail → Security → App Passwords |
| `GHL_API_KEY` | GoHighLevel integration | GHL Settings → API |
| `GHL_LOCATION_ID` | Your GHL location | GHL URL location part |

## **Troubleshooting**

### **Build Fails:**
1. Check "Activity" tab for error logs
2. Common issue: Missing environment variables
3. Fix: Add all required Config Vars

### **App Crashes:**
1. Click "More" → "View logs"
2. Common issue: Database connection failed
3. Fix: Check MONGO_URL is correct

### **Contact Form Not Working:**
1. Check browser console for errors
2. Test `/api/health` endpoint
3. Verify all Config Vars are set

### **GoHighLevel Integration Fails:**
1. Check GHL API key is valid
2. Verify Location ID is correct
3. Test with simple contact first

## **Success Checklist**

- [ ] App deploys without errors
- [ ] Website loads at Heroku URL
- [ ] Contact form submits successfully
- [ ] Health check returns "healthy"
- [ ] Test contact appears in GoHighLevel
- [ ] Email notification received
- [ ] Custom domain working (if set up)

## **Next Steps After Deployment**

1. **Test thoroughly** with real contact submissions
2. **Set up monitoring** in Heroku dashboard
3. **Configure GoHighLevel workflows** for automated responses
4. **Add custom domain** for professional appearance
5. **Set up regular backups** for MongoDB data

## **Monthly Costs**

- **Heroku:** Free tier available, $7/month for Hobby Dyno
- **MongoDB Atlas:** Free tier (512MB storage)
- **Total:** Free to start, $7/month for production

Your website is now production-ready with full GoHighLevel integration! 🎉
