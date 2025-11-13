# ODOP Platform - Render Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Completed Setup
- [x] Created `requirements.txt` for Python dependencies
- [x] Created `build.sh` script for build process
- [x] Updated Django settings to use environment variables
- [x] Configured PostgreSQL database support
- [x] Added WhiteNoise for static file serving
- [x] Updated CORS settings for production
- [x] Created `.env.example` files for both frontend and backend
- [x] Updated frontend API URL to use environment variables

### 🔴 Before You Deploy - Action Required

1. **Generate a new SECRET_KEY for production**
   ```python
   # Run this in Python to generate a secure key:
   from django.core.management.utils import get_random_secret_key
   print(get_random_secret_key())
   ```

2. **Prepare Git Repository** (if not already done)
   ```bash
   cd /Users/vinamragupta/odop-platform
   git init
   git add .
   git commit -m "Initial commit - ready for Render deployment"
   git branch -M main
   # Push to GitHub/GitLab/Bitbucket
   ```

---

## 🚀 Deployment Steps on Render

### Part 1: Deploy Backend (Django API)

1. **Create PostgreSQL Database**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "PostgreSQL"
   - Name: `odop-backend-db`
   - Region: Choose closest to your users
   - Plan: Free (or paid for better performance)
   - Click "Create Database"
   - **Save the Internal Database URL** (you'll need this)

2. **Create Web Service for Backend**
   - Click "New +" → "Web Service"
   - Connect your Git repository
   - Configure settings:
     - **Name**: `odop-backend` (or your choice)
     - **Region**: Same as database
     - **Branch**: `main`
     - **Root Directory**: `odop-backend`
     - **Runtime**: `Python 3`
     - **Build Command**: `./build.sh`
     - **Start Command**: `gunicorn config.wsgi:application`
     - **Plan**: Free (or paid for better performance)

3. **Set Environment Variables for Backend**
   Go to "Environment" tab and add:

   ```
   SECRET_KEY=<your-generated-secret-key-from-step-1>
   DEBUG=False
   ALLOWED_HOSTS=odop-backend.onrender.com
   DATABASE_URL=<internal-database-url-from-postgresql>
   CORS_ALLOWED_ORIGINS=https://odop-frontend.onrender.com
   PYTHON_VERSION=3.11.0
   ```

   **Note**:
   - Replace `odop-backend` with your actual backend service name
   - Replace `odop-frontend` with your actual frontend service name
   - Render automatically provides `DATABASE_URL` if you link the database

4. **Link Database to Web Service**
   - In your web service, go to "Environment"
   - Scroll to "Environment Groups"
   - Click "Link" next to your PostgreSQL database
   - This automatically adds `DATABASE_URL`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete (5-10 minutes)
   - Check logs for any errors
   - Your backend will be at: `https://odop-backend.onrender.com`

### Part 2: Deploy Frontend (React)

1. **Create Static Site for Frontend**
   - Click "New +" → "Static Site"
   - Connect your Git repository
   - Configure settings:
     - **Name**: `odop-frontend` (or your choice)
     - **Branch**: `main`
     - **Root Directory**: `odop-frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `build`

2. **Set Environment Variables for Frontend**
   Go to "Environment" tab and add:

   ```
   REACT_APP_API_URL=https://odop-backend.onrender.com/api
   ```

   **Note**: Replace `odop-backend` with your actual backend service URL

3. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete (3-5 minutes)
   - Your frontend will be at: `https://odop-frontend.onrender.com`

### Part 3: Update CORS Settings

After both services are deployed:

1. Go to your **Backend Web Service** on Render
2. Update the `CORS_ALLOWED_ORIGINS` environment variable with your actual frontend URL:
   ```
   CORS_ALLOWED_ORIGINS=https://your-actual-frontend-url.onrender.com
   ```
3. Also update `ALLOWED_HOSTS`:
   ```
   ALLOWED_HOSTS=your-actual-backend-url.onrender.com
   ```
4. Save and wait for auto-redeploy

---

## 🔧 Post-Deployment

### Verify Deployment

1. **Test Backend API**
   - Visit: `https://your-backend-url.onrender.com/api/products/`
   - Should see JSON response with products

2. **Test Frontend**
   - Visit: `https://your-frontend-url.onrender.com`
   - Should load the application
   - Check browser console for any errors

### Run Database Migrations (if needed)

If you need to run migrations or create a superuser:

1. Go to your Backend Web Service on Render
2. Click "Shell" tab
3. Run commands:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

---

## 🌐 Custom Domain (Optional)

### For Backend:
1. Go to your backend web service
2. Click "Settings" → "Custom Domain"
3. Add your domain (e.g., `api.yourdomain.com`)
4. Update DNS records as instructed
5. Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` environment variables

### For Frontend:
1. Go to your frontend static site
2. Click "Settings" → "Custom Domain"
3. Add your domain (e.g., `yourdomain.com`)
4. Update DNS records as instructed
5. Update `REACT_APP_API_URL` if backend URL changed

---

## 🐛 Troubleshooting

### Backend Issues

**500 Error / Application Error:**
- Check logs in Render dashboard
- Verify all environment variables are set correctly
- Ensure `DATABASE_URL` is connected
- Check `ALLOWED_HOSTS` includes your Render URL

**Database Connection Error:**
- Verify database is running
- Check `DATABASE_URL` is correct
- Ensure database and web service are in same region

**Static Files Not Loading:**
- Run `python manage.py collectstatic` (included in build.sh)
- Check WhiteNoise is properly configured

### Frontend Issues

**Blank Page:**
- Check browser console for errors
- Verify `REACT_APP_API_URL` is set correctly
- Ensure build completed successfully

**API Errors / CORS Issues:**
- Verify backend `CORS_ALLOWED_ORIGINS` includes frontend URL
- Check backend is running and accessible
- Test backend API URL directly in browser

**Build Failures:**
- Check build logs in Render
- Verify `package.json` is correct
- Try building locally first: `npm run build`

---

## 📊 Monitoring

### Free Tier Limitations
- Render's free tier services spin down after 15 minutes of inactivity
- First request after spin-down will be slow (30-60 seconds)
- Consider upgrading to paid plan for production use

### Keeping Service Active (Free Tier Workaround)
- Use external monitoring service (e.g., UptimeRobot, Freshping)
- Ping your backend every 10 minutes to keep it active

---

## 🔐 Security Checklist

- [ ] Changed `SECRET_KEY` to production value
- [ ] Set `DEBUG=False`
- [ ] Configured `ALLOWED_HOSTS` properly
- [ ] Restricted CORS to specific origins
- [ ] Database credentials secured (managed by Render)
- [ ] Added `.env` to `.gitignore` (already done)
- [ ] Review and update dependencies regularly

---

## 🔄 Continuous Deployment

Both services are configured for automatic deployment:
- Push to `main` branch → Automatic deployment
- Check "Events" tab in Render to see deployment history
- Can disable auto-deploy in Settings if needed

---

## 📝 Important URLs After Deployment

- **Backend API**: `https://[your-backend-name].onrender.com/api/`
- **Backend Admin**: `https://[your-backend-name].onrender.com/admin/`
- **Frontend**: `https://[your-frontend-name].onrender.com`
- **Database**: Managed internally by Render

---

## 💡 Tips

1. **Database Backups**: Render free tier doesn't include automatic backups. Consider:
   - Manual exports via Render dashboard
   - Upgrade to paid plan for automatic backups

2. **Environment Variables**: Never commit `.env` files to Git
   - Use `.env.example` as template
   - Set actual values in Render dashboard

3. **Performance**:
   - Free tier spins down after inactivity
   - Consider paid plan for production
   - Use Redis for caching in production (currently using in-memory)

4. **Logs**:
   - Check Render logs regularly
   - Set up error tracking (Sentry, etc.)

---

## 📞 Support

- **Render Documentation**: https://render.com/docs
- **Django on Render**: https://render.com/docs/deploy-django
- **React on Render**: https://render.com/docs/deploy-create-react-app

---

## ✅ Final Checklist Before Going Live

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database connected and migrations run
- [ ] Environment variables configured correctly
- [ ] CORS working properly (frontend can call backend)
- [ ] Test all main features
- [ ] Check browser console for errors
- [ ] Review security settings
- [ ] Set up monitoring
- [ ] Document any custom configurations

---

**Good luck with your deployment! 🚀**
