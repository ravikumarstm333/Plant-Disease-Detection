import tensorflow as tf
import os
import matplotlib.pyplot as plt
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model

# =========================
# GPU CHECK
# =========================
print("GPU Available:", tf.config.list_physical_devices('GPU'))

# =========================
# DATASET PATHS
# =========================
train_path = r"C:\WORK\CROP-D\DataSet\New Plant Diseases Dataset(Augmented)\train"
valid_path = r"C:\WORK\CROP-D\DataSet\New Plant Diseases Dataset(Augmented)\valid"

# =========================
# DATA AUGMENTATION
# =========================
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=25,
    zoom_range=0.3,
    horizontal_flip=True,
    width_shift_range=0.2,
    height_shift_range=0.2
)

valid_datagen = ImageDataGenerator(rescale=1./255)

train_data = train_datagen.flow_from_directory(
    train_path,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical'
)

valid_data = valid_datagen.flow_from_directory(
    valid_path,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical'
)

# =========================
# MODEL (MobileNetV2)
# =========================
base_model = MobileNetV2(
    weights='imagenet',
    include_top=False,
    input_shape=(224, 224, 3)
)

x = base_model.output
x = GlobalAveragePooling2D()(x)
predictions = Dense(train_data.num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)

# Freeze base model
for layer in base_model.layers:
    layer.trainable = False

# =========================
# COMPILE
# =========================
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# =========================
# TRAINING
# =========================
history = model.fit(
    train_data,
    validation_data=valid_data,
    epochs=10
)

# =========================
# SAVE MODEL
# =========================
model.save("plant_disease_model.h5")

# =========================
# SAVE CLASS LABELS
# =========================
import json
with open("class_names.json", "w") as f:
    json.dump(train_data.class_indices, f)

# =========================
# PLOT TRAINING GRAPH
# =========================
plt.figure()

plt.plot(history.history['accuracy'], label='Train Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')

plt.title('Model Accuracy')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend()

plt.savefig("training_accuracy.png")
plt.show()

# Loss graph
plt.figure()

plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')

plt.title('Model Loss')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.legend()

plt.savefig("training_loss.png")
plt.show()