from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
import json
from datetime import datetime
import shutil

app = Flask(__name__)
CORS(app)

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'gender_classification_model.h5')
model = tf.keras.models.load_model(MODEL_PATH)

IMG_WIDTH, IMG_HEIGHT = 224, 224

# Statistics tracking (no images stored, only metadata)
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
STATS_FILE = os.path.join(BASE_DIR, 'model_stats.json')

# Initialize stats
if not os.path.exists(STATS_FILE):
    with open(STATS_FILE, 'w') as f:
        json.dump({
            'total_feedback': 0,
            'correct_predictions': 0,
            'incorrect_predictions': 0,
            'online_training_count': 0,
            'last_updated': None
        }, f)

# Prepare model for online learning
for layer in model.layers[-10:]:
    layer.trainable = True

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.00001),
    loss='binary_crossentropy',
    metrics=['accuracy']
)

def preprocess_image(image_file):
    """Preprocess the uploaded image for model prediction"""
    # Open image using PIL
    img = Image.open(io.BytesIO(image_file.read()))
    
    # Convert to RGB if necessary
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Resize image
    img = img.resize((IMG_WIDTH, IMG_HEIGHT))
    
    # Convert to array
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0  # Normalize
    
    return img_array

@app.route('/api/predict', methods=['POST'])
def predict():
    """Endpoint to predict gender from uploaded image"""
    try:
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        
        # Check if file is empty
        if image_file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Preprocess and predict
        img_array = preprocess_image(image_file)
        prediction = model.predict(img_array)
        
        # Get prediction result
        confidence = float(prediction[0][0])
        gender = "Male" if confidence > 0.5 else "Female"
        confidence_percentage = confidence * 100 if confidence > 0.5 else (1 - confidence) * 100
        
        return jsonify({
            'gender': gender,
            'confidence': round(confidence_percentage, 2),
            'success': True
        })
    
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """
    Endpoint for online learning - NO IMAGE STORAGE for privacy
    Model learns immediately from the feedback without saving user data
    """
    try:
        # Get data from request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        correct_gender = request.form.get('correctGender')
        prediction = request.form.get('prediction')
        
        if not correct_gender or correct_gender not in ['Male', 'Female']:
            return jsonify({'error': 'Invalid gender label'}), 400
        
        # Process image for training (NO SAVING)
        img_array = preprocess_image(image_file)
        
        # Prepare label (0 for Female, 1 for Male)
        correct_label = 1.0 if correct_gender == 'Male' else 0.0
        y_true = np.array([[correct_label]])
        
        # Online learning: Train on this single sample immediately
        global model
        history = model.fit(
            img_array,
            y_true,
            epochs=1,
            verbose=0,
            batch_size=1
        )
        
        # Update statistics (only metadata, no images)
        with open(STATS_FILE, 'r') as f:
            stats = json.load(f)
        
        stats['total_feedback'] += 1
        stats['online_training_count'] += 1
        stats['last_updated'] = datetime.now().isoformat()
        
        if prediction == correct_gender:
            stats['correct_predictions'] += 1
        else:
            stats['incorrect_predictions'] += 1
        
        with open(STATS_FILE, 'w') as f:
            json.dump(stats, f, indent=2)
        
        # Auto-save model periodically (every 10 feedbacks)
        if stats['online_training_count'] % 10 == 0:
            backup_path = MODEL_PATH.replace('.h5', f'_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.h5')
            shutil.copy2(MODEL_PATH, backup_path)
            model.save(MODEL_PATH)
        
        return jsonify({
            'success': True,
            'message': 'Model learned from your feedback instantly! (No data saved)',
            'total_feedback': stats['total_feedback'],
            'training_loss': float(history.history['loss'][0]),
            'privacy_safe': True
        })
    
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/save-model', methods=['POST'])
def save_model():
    """Manually save the current model state"""
    try:
        global model
        
        # Create timestamped backup
        backup_path = MODEL_PATH.replace('.h5', f'_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.h5')
        
        # Save current model
        model.save(MODEL_PATH)
        
        # Also create backup
        shutil.copy2(MODEL_PATH, backup_path)
        
        return jsonify({
            'success': True,
            'message': 'Model saved successfully!',
            'backup_created': os.path.basename(backup_path)
        })
    
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get learning statistics (no private data)"""
    try:
        with open(STATS_FILE, 'r') as f:
            stats = json.load(f)
        
        total = stats['total_feedback']
        correct = stats['correct_predictions']
        accuracy = (correct / total * 100) if total > 0 else 0
        
        return jsonify({
            'total_feedback': total,
            'correct_predictions': correct,
            'incorrect_predictions': stats['incorrect_predictions'],
            'accuracy': round(accuracy, 2),
            'online_training_count': stats['online_training_count'],
            'last_updated': stats['last_updated'],
            'privacy_safe': True,
            'data_stored': False
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
