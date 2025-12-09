import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
import matplotlib.pyplot as plt
import numpy as np

# Set up paths
train_data_dir = 'C:/Users/naiti/Desktop/Projects/Python model/GENDER CLASSIFICATION/testing image'
test_data_dir = 'C:/Users/naiti/Desktop/Projects/Python model/GENDER CLASSIFICATION/training image'

# Set up parameters
img_width, img_height = 224, 224
batch_size = 32
epochs = 10

# Data augmentation and preprocessing for training
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    zoom_range=0.2,
    validation_split=0.2
)

# Preprocessing for testing (only rescaling)
test_datagen = ImageDataGenerator(rescale=1./255)

# Set up data generators
train_generator = train_datagen.flow_from_directory(
    train_data_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='binary',
    subset='training'
)

validation_generator = train_datagen.flow_from_directory(
    train_data_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='binary',
    subset='validation'
)

test_generator = test_datagen.flow_from_directory(
    test_data_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='binary'
)

# Create the base model (MobileNetV2)
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(img_width, img_height, 3))

# Add custom layers
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(1024, activation='relu')(x)
predictions = Dense(1, activation='sigmoid')(x)

# Create the final model
model = Model(inputs=base_model.input, outputs=predictions)

# Freeze the base model layers
for layer in base_model.layers:
    layer.trainable = False

# Compile the model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Train the model
history = model.fit(
    train_generator,
    steps_per_epoch=max(1, train_generator.samples // batch_size),
    epochs=epochs,
    validation_data=validation_generator,
    validation_steps=max(1, validation_generator.samples // batch_size)
)

# Evaluate the model
test_loss, test_acc = model.evaluate(test_generator, steps=max(1, test_generator.samples // batch_size))
print(f'Test accuracy: {test_acc:.4f}')

# Plot training history
# plt.figure(figsize=(12, 4))
# plt.subplot(1, 2, 1)
# plt.plot(history.history['accuracy'], label='Train Accuracy')
# plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
# plt.legend()
# plt.title('Model Accuracy')

# plt.subplot(1, 2, 2)
# plt.plot(history.history['loss'], label='Train Loss')
# plt.plot(history.history['val_loss'], label='Validation Loss')
# plt.legend()
# plt.title('Model Loss')

# plt.show()

# Save the model
#model.save('gender_classification_model.h5')

# Function to predict gender for any image
def predict_gender(image_path):
    img = tf.keras.preprocessing.image.load_img(image_path, target_size=(img_width, img_height))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0  # Normalize the image

    prediction = model.predict(img_array)
    if prediction[0][0] > 0.5:
        return "Male"
    else:
        return "Female"

# Example usage
test_image_path = 'C:/Users/naiti/Desktop/Projects/Python model/GENDER CLASSIFICATION/test image/kayadu lohar.jpg'
print(f"Predicted gender: {predict_gender(test_image_path)}")