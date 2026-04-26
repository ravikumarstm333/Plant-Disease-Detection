import React, { useState, useRef } from "react";
import './chatbot.css';

const cropOptions = [
  "Tomato",
  "Apple",
  "Potato",
  "Corn",
  "Grape",
  "Cherry",
  "Blueberry",
  "Strawberry",
  "Pepper",
  "Orange",
  "Soybean",
  "Peach",
  "Raspberry",
  "Squash"
];

function Chatbot({ disease }) {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [predictedDisease, setPredictedDisease] = useState(null);
  const [predictionConfidence, setPredictionConfidence] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const sendMessage = async () => {
    const questionText = input.trim() || (selectedImage ? "Please analyze this plant image." : "");
    if (!questionText && !selectedImage) return;

    const userMessage = {
      sender: "user",
      text: input.trim() || (selectedImage ? "Image uploaded for analysis" : ""),
      image: imagePreview
    };

    setMessages(prev => [...prev, userMessage]);

    const formData = new FormData();
    formData.append("question", questionText);
    formData.append("disease", disease || "");
    formData.append("crop", selectedCrop || "");

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      const res = await fetch("/chat", {
        method: "POST",
        body: selectedImage ? formData : JSON.stringify({
          question: input,
          disease: disease
        }),
        headers: selectedImage ? {} : {
          "Content-Type": "application/json",
        }
      });

      const data = await res.json();

      if (data.predicted_disease) {
        setPredictedDisease(data.predicted_disease);
      }
      if (typeof data.confidence === 'number') {
        setPredictionConfidence(data.confidence);
      }

      const botMessage = {
        sender: "bot",
        text: data.answer
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "bot",
        text: "Sorry, I encountered an error. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setInput("");
    setSelectedImage(null);
    setImagePreview(null);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (err) {
      alert("Camera access denied or not available.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], "chat-captured-image.jpg", { type: "image/jpeg" });
      setSelectedImage(file);
      setImagePreview(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }, 'image/jpeg');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-header-content">
          <div className="chatbot-header-icon">🤖</div>
          <div>
            <h1>AI Plant Assistant</h1>
            <p>Ask anything about diseases, treatments & farming tips</p>
          </div>
        </div>
        <div className="chatbot-status">
          <div className="status-dot"></div>
          <span>Online</span>
        </div>
      </div>

      <div className="select-crop-section">
        <label htmlFor="crop-select" className="select-crop-label">Crop Type</label>
        <select
          id="crop-select"
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="crop-select"
        >
          <option value="">Auto detect or choose a crop</option>
          {cropOptions.map((crop) => (
            <option key={crop} value={crop}>{crop}</option>
          ))}
        </select>
      </div>

      {predictedDisease && (
        <div className="prediction-summary">
          <div className="prediction-tag">Detected</div>
          <div>
            <p className="prediction-title">{predictedDisease.replace(/___/g, ' ').replace(/_/g, ' ')}</p>
            {predictionConfidence !== null && (
              <p className="prediction-subtitle">Confidence: {(predictionConfidence * 100).toFixed(1)}%</p>
            )}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-state-icon">🌱</div>
            <p>Start a conversation by asking a question about plant diseases or farming!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-bubble">
                {msg.image && (
                  <img src={msg.image} alt="Uploaded" className="message-image" />
                )}
                <p className="message-text">{msg.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Camera/Image Preview */}
      {cameraActive && (
        <div className="camera-container">
          <video ref={videoRef} autoPlay playsInline />
          <div className="camera-controls">
            <button onClick={capturePhoto} className="camera-btn">
              📸 Capture Photo
            </button>
            <button onClick={stopCamera} className="camera-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      {imagePreview && !cameraActive && (
        <div className="image-preview-container">
          <img src={imagePreview} alt="Preview" className="camera-preview" />
          <button
            onClick={removeImage}
            className="remove-image-btn"
            type="button"
          >
            Remove Image
          </button>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Input Section */}
      <div className="chat-input-section">
        <div className="chat-input-wrapper">
          <div className="chat-input-main">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="input-field"
              rows={1}
            />
          </div>

          <div className="chat-buttons">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            <button
              onClick={() => fileInputRef.current.click()}
              className="chat-btn action-btn"
              title="Upload image"
              type="button"
            >
              <span className="chat-button-icon">📎</span>
              <span>Upload</span>
            </button>

            <button
              onClick={cameraActive ? stopCamera : startCamera}
              className="chat-btn action-btn"
              title={cameraActive ? "Stop camera" : "Take photo"}
              type="button"
            >
              <span className="chat-button-icon">📷</span>
              <span>{cameraActive ? 'Close Camera' : 'Camera'}</span>
            </button>

            <button
              onClick={sendMessage}
              disabled={!input.trim() && !selectedImage}
              className="chat-btn send-btn"
              title="Send message"
              type="button"
            >
              <span className="chat-button-icon">↗️</span>
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;