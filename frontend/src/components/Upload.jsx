import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload as UploadIcon, Camera, X, Check, AlertCircle } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Loading from './ui/Loading';
import { toast } from 'react-toastify';

function Upload() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      toast.error('File size must be less than 5MB');
      return;
    }

    setImage(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
      setError(null);
    } catch (err) {
      setError('Camera access denied. Please use file upload instead.');
      toast.error('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'captured.jpg', { type: 'image/jpeg' });
      setImage(file);
      setPreview(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }, 'image/jpeg');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await fetch('/predict', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await res.json();
      toast.success('Analysis complete!');
      navigate('/result', { state: data });
    } catch (err) {
      setError(err.message || 'Failed to analyze image');
      toast.error(err.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="section-title">🔍 Detect Plant Disease</h1>
          <p className="section-subtitle">
            Upload a clear photo of your plant leaf to get instant AI diagnosis
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full">
              {!preview ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Drag & Drop Area */}
                  <motion.div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    animate={{
                      borderColor: dragActive ? '#2E7D32' : '#E0E0E0',
                      backgroundColor: dragActive ? '#F1F8F5' : '#FAFAFA',
                    }}
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer transition-all"
                  >
                    <motion.div
                      animate={{ y: dragActive ? -5 : 0 }}
                      className="space-y-4"
                    >
                      <motion.div
                        animate={{ scale: dragActive ? 1.1 : 1 }}
                        className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto"
                      >
                        <UploadIcon className="text-primary-600" size={32} />
                      </motion.div>
                      <div>
                        <p className="text-lg font-semibold text-gray-800 mb-1">
                          Drag and drop your image
                        </p>
                        <p className="text-sm text-gray-500">or click to browse</p>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    onClick={() => fileInputRef.current?.click()}
                    className="hidden"
                  />

                  {/* File Input Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full btn-primary"
                  >
                    <UploadIcon size={20} />
                    Choose File
                  </motion.button>

                  {/* Camera Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={startCamera}
                    className="w-full btn-secondary"
                  >
                    <Camera size={20} />
                    Open Camera
                  </motion.button>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                      >
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-red-800 text-sm">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-3">Preview</p>
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square"
                    >
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={20} />
                      </motion.button>
                    </motion.div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    loading={loading}
                    className="w-full"
                  >
                    Analyze Image
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={clearImage}
                    disabled={loading}
                    className="w-full"
                  >
                    Choose Different Image
                  </Button>
                </motion.div>
              )}
            </Card>
          </motion.div>

          {/* Info & Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Tips for Best Results</h3>
              <ul className="space-y-3">
                {[
                  'Take a clear, well-lit photo of the affected leaf',
                  'Ensure the leaf fills most of the frame',
                  'Avoid shadows and reflections',
                  'Use a steady hand or tripod',
                  'Include only the leaf in the photo',
                ].map((tip, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary-600" />
                    </div>
                    <span className="text-gray-700">{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </Card>

            <Card>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Supported Diseases</h3>
              <div className="grid grid-cols-2 gap-2">
                {['Apple Scab', 'Tomato Blight', 'Powdery Mildew', 'Leaf Spot', 'Rust', 'Healthy'].map(
                  (disease, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="badge badge-success text-center"
                    >
                      {disease}
                    </motion.div>
                  )
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Camera Modal */}
        <AnimatePresence>
          {cameraActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl"
              >
                <div className="bg-gradient-primary p-4 flex justify-between items-center text-white">
                  <h3 className="text-xl font-bold">Capture Photo</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={stopCamera}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </motion.button>
                </div>

                <div className="p-6 space-y-4">
                  <motion.video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-xl bg-black"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  <div className="flex gap-4">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={capturePhoto}
                      className="flex-1"
                    >
                      <Camera size={20} />
                      Capture Photo
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={stopCamera}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Modal */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl p-8 shadow-2xl"
              >
                <Loading text="Analyzing your plant..." />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Upload;