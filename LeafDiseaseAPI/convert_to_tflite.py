import tensorflow as tf

print('Loading model...')
model = tf.keras.models.load_model('model/leaf_disease_model.keras')
print('Converting model...')
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()
print('Saving model...')
with open('model/leaf_disease_model.tflite', 'wb') as f:
    f.write(tflite_model)
print('Done!')