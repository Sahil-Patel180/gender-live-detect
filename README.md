# Gender Classification Web Application

A modern, professional web application for gender classification using AI/ML powered by TensorFlow and MobileNetV2.

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Vercel-Ready Structure** - Deploy in one click!

## 📁 Project Structure (Vercel-Optimized)

```
gender-classifier/
├── api/                          # Backend serverless functions
│   ├── index.py                  # Main Flask API
│   └── requirements.txt          # Python dependencies
├── public/                       # Static files
│   └── index.html
├── src/                          # React source code
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── gender_classification_model.h5  # Trained ML model
├── model_stats.json               # Anonymous statistics
├── package.json                   # Node dependencies (root)
├── vercel.json                    # Vercel configuration
└── README.md

Legacy folders (for local dev only):
├── backend/                       # Original Flask app
└── frontend/                      # Original React app
```

## Features

- 🎨 Modern, gradient-based UI design
- 📤 Drag & drop image upload
- 🤖 AI-powered gender classification
- 📊 Confidence score visualization
- 🧠 **Self-Learning Model** - Improves from user feedback
- 🔒 **Privacy-First Design** - NO image storage, instant learning
- ✓ User feedback mechanism for correct/incorrect predictions
- ⚡ Online learning - Model updates in real-time
- 📈 Real-time statistics dashboard
- 📱 Fully responsive design
- ⚡ Fast predictions with TensorFlow
- 🎯 Professional and clean interface

## 🌐 Vercel Deployment

### Automatic Deploy (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel auto-detects the configuration
5. Deploy! ✨

### Manual Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel
```

### Important Notes

⚠️ **Model Size**: The `.h5` file (~332MB) may exceed Vercel's limits
- Consider using Vercel Blob Storage
- Or deploy backend separately on Railway/Render

## 🛠️ Local Development

### Option 1: Development Server (Recommended)

```bash
# Install dependencies at root
npm install

# Start development server
npm start
```

Runs React on `http://localhost:3000` with API proxy to `/api`

### Option 2: Separate Servers (Traditional)

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python app.py
```
Runs on `http://localhost:5000`

**Frontend:**
```bash
cd frontend
npm install
npm start
```
Runs on `http://localhost:3000`

## Usage

1. Make sure both backend and frontend servers are running
2. Open your browser to `http://localhost:3000`
3. Upload an image by:
   - Clicking the upload area and selecting a file
   - Dragging and dropping an image
4. Click "Analyze Image" to get the prediction
5. View the result with confidence score
6. **Provide Feedback**: 
   - Click "Yes, Correct" if prediction is accurate
   - Click "No, It's [Gender]" if prediction is wrong
7. Your feedback is automatically saved to improve the model
8. Click "Try Another Image" to analyze more photos

## Privacy-First Learning System

The application uses **online learning** (federated learning approach) - the model learns from feedback WITHOUT storing any user images, ensuring complete privacy.

### How It Works (No Data Storage!)

1. **Instant Learning**: When you provide feedback:
   - Image is processed in memory only
   - Model trains on the single example immediately
   - Image is discarded after training (never saved)
   - Only statistics metadata is kept (no personal data)

2. **Privacy Guarantees**:
   - ✅ NO image storage on server
   - ✅ NO data collection
   - ✅ NO privacy concerns
   - ✅ Instant learning, instant forgetting
   - ✅ Only model weights are updated

3. **Statistics Tracking** (Anonymous):
   - Total feedback count
   - Accuracy metrics
   - Training iterations
   - Last update timestamp

4. **Model Persistence**:
   - Auto-saves every 10 feedback sessions
   - Manual save option available
   - Backup created before each save

### Why This Approach?

Traditional ML: Upload → Store → Train Later → Privacy Risk ❌  
**Our Approach**: Upload → Learn → Delete → Privacy Safe ✅

### API Endpoints

- `POST /api/predict` - Get gender prediction
- `POST /api/feedback` - Submit feedback (online learning, no storage)
- `POST /api/save-model` - Manually save model state
- `GET /api/stats` - Get anonymous statistics
- `GET /api/health` - Health check

## Technologies Used

### Backend
- Flask - Web framework
- TensorFlow - ML framework
- Pillow - Image processing
- Flask-CORS - Cross-origin requests

### Frontend
- React - UI library
- Axios - HTTP client
- Modern CSS with animations

## Model Information

- **Architecture**: MobileNetV2 (Transfer Learning)
- **Input Size**: 224x224 pixels
- **Output**: Binary classification (Male/Female)
- **Training**: Pre-trained on custom dataset

## API Endpoints

- `POST /api/predict` - Upload image and get gender prediction
- `GET /api/health` - Check API health status

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Notes

- Maximum image size: 10MB
- Supported formats: PNG, JPG, JPEG
- Best results with clear, front-facing photos
- Ensure good lighting in photos for better accuracy
