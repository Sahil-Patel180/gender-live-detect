# Gender Classifier - Deployment Guide

## 🚀 Quick Deploy Options

### 1. Vercel (Frontend + Serverless Backend)

**Best for**: Static sites with lightweight backends

**Setup**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Limitations**:
- Model file size limit (50MB) - our model is ~332MB
- TensorFlow is heavy for serverless
- Consider using Vercel Blob for model storage

**Configuration**: Already set up in `vercel.json`

---

### 2. Railway (Recommended for ML apps)

**Best for**: ML/AI applications with large dependencies

**Setup**:
1. Visit [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repo
4. Railway auto-detects Python/Node and deploys!

**Benefits**:
- No file size limits
- Better for TensorFlow
- Persistent storage
- Reasonable free tier

---

### 3. Render

**Best for**: Full-stack apps with heavy backends

**Setup**:
1. Create account at [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Configure:
   - Build Command: `pip install -r api/requirements.txt && npm install && npm run build`
   - Start Command: `python api/index.py`

---

### 4. Netlify (Frontend) + External Backend

**Setup**:
- Deploy React app to Netlify
- Deploy Flask API to Railway/Heroku
- Update API URLs in frontend

---

## 📦 Recommended: Railway Deployment

Railway is the best choice for this app because:
- ✅ Handles large TensorFlow models
- ✅ No size restrictions
- ✅ Simple deployment
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Environment variables

### Railway Deploy Steps:

1. **Prepare your code**:
   ```bash
   # Make sure all changes are committed
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

2. **Deploy on Railway**:
   - Go to railway.app
   - Click "Start a New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Railway detects Python/Node automatically
   - Click "Deploy"

3. **Environment Variables** (if needed):
   - Go to Variables tab
   - Add any required environment variables
   - Railway provides a public URL automatically

4. **Update Frontend URLs**:
   - Replace `/api` URLs with your Railway backend URL
   - Or use Railway's automatic frontend deployment

---

## 🔧 Configuration Files

All configuration files are included:

- ✅ `vercel.json` - Vercel deployment config
- ✅ `package.json` - Root package file for frontend
- ✅ `api/requirements.txt` - Python dependencies
- ✅ `api/index.py` - Serverless-ready Flask app

---

## 🐛 Troubleshooting

### Model Too Large Error
**Solution**: Use external storage (S3, Vercel Blob) for the .h5 file

### TensorFlow Import Error
**Solution**: Deploy on Railway instead of Vercel

### CORS Issues
**Solution**: Already configured with `flask-cors`, check API URL

---

## 📝 Post-Deployment Checklist

- [ ] Test image upload
- [ ] Test predictions
- [ ] Test feedback submission
- [ ] Verify statistics display
- [ ] Check mobile responsiveness
- [ ] Test privacy features (no data storage)

---

## 💡 Tips

1. **Start with Railway** - Best for ML apps
2. **Use Git** - Automatic deployments on push
3. **Monitor** - Check logs for errors
4. **Scale** - Upgrade plan if needed for traffic
5. **Backup** - Keep model backups in cloud storage
