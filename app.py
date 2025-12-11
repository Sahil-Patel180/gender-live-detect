import gradio as gr
import tensorflow as tf
import numpy as np
from PIL import Image

# Load model
model = tf.keras.models.load_model('gender_classification_model.h5')

# Prepare model for online learning
for layer in model.layers[-10:]:
    layer.trainable = True
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.00001),
    loss='binary_crossentropy',
    metrics=['accuracy']
)

IMG_WIDTH, IMG_HEIGHT = 224, 224

def predict_gender(image):
    """Predict gender from image"""
    if image is None:
        return "Please upload an image", None
    
    # Preprocess
    img = Image.fromarray(image)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img = img.resize((IMG_WIDTH, IMG_HEIGHT))
    
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0
    
    # Predict
    prediction = model.predict(img_array)
    confidence = float(prediction[0][0])
    gender = "Male" if confidence > 0.5 else "Female"
    confidence_percentage = confidence * 100 if confidence > 0.5 else (1 - confidence) * 100
    
    result = f"**Prediction:** {gender}\n**Confidence:** {confidence_percentage:.2f}%"
    return result, confidence_percentage

def provide_feedback(image, correct_gender):
    """Learn from user feedback (privacy-safe - no storage)"""
    if image is None or correct_gender is None:
        return "Please provide both image and correct gender"
    
    # Preprocess
    img = Image.fromarray(image)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img = img.resize((IMG_WIDTH, IMG_HEIGHT))
    
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0
    
    # Prepare label
    correct_label = 1.0 if correct_gender == "Male" else 0.0
    y_true = np.array([[correct_label]])
    
    # Online learning
    history = model.fit(img_array, y_true, epochs=1, verbose=0, batch_size=1)
    
    return f"✅ Model learned from your feedback! Training loss: {history.history['loss'][0]:.4f}\n\n🔒 Privacy-safe: Image processed but not stored."

# Create Gradio interface
with gr.Blocks(title="Gender Classifier - AI Demo", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # 🎭 Gender Classifier
    ### AI-Powered Photo Analysis with Privacy-First Learning
    
    Upload a photo to classify gender. The model learns from your feedback without storing images!
    """)
    
    with gr.Tab("Predict"):
        with gr.Row():
            with gr.Column():
                image_input = gr.Image(label="Upload Photo")
                predict_btn = gr.Button("🔍 Analyze Image", variant="primary")
            with gr.Column():
                prediction_output = gr.Textbox(label="Result", lines=3)
                confidence_output = gr.Number(label="Confidence %", precision=2)
        
        predict_btn.click(
            fn=predict_gender,
            inputs=image_input,
            outputs=[prediction_output, confidence_output]
        )
    
    with gr.Tab("Feedback & Learning"):
        gr.Markdown("### Help Improve the Model")
        with gr.Row():
            with gr.Column():
                feedback_image = gr.Image(label="Upload Photo")
                correct_gender = gr.Radio(["Male", "Female"], label="Correct Gender")
                feedback_btn = gr.Button("✅ Submit Feedback", variant="primary")
            with gr.Column():
                feedback_output = gr.Textbox(label="Learning Status", lines=5)
        
        feedback_btn.click(
            fn=provide_feedback,
            inputs=[feedback_image, correct_gender],
            outputs=feedback_output
        )
    
    gr.Markdown("""
    ---
    ### 🔒 Privacy Notice
    - **No images are stored** - All processing happens in memory
    - **Instant learning** - Model updates in real-time from your feedback
    - **Anonymous** - No personal data collected
    
    ### 🤖 Technology
    - MobileNetV2 Transfer Learning
    - TensorFlow 2.20.0
    - Online Learning (Federated Approach)
    """)

if __name__ == "__main__":
    demo.launch()
