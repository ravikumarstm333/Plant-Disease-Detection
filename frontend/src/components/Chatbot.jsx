import React, { useState, useRef, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './chatbot.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [predictedDisease, setPredictedDisease] = useState(null);
  const [predictionConfidence, setPredictionConfidence] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isInitialMount = useRef(true);

  // Handle disease context from navigation state or props
  useEffect(() => {
    const contextDisease = location.state?.disease || disease;
    if (contextDisease && messages.length === 0) {
      setPredictedDisease(contextDisease);
      const welcomeMessage = {
        sender: "bot",
        text: `Hello! I see you want to discuss **${contextDisease.replace(/___/g, ' ').replace(/_/g, ' ')}**. \n\nWhat would you like to know?`,
        quickReplies: ["Treatment", "Prevention", "Fertilizer Suggestions", "General Care"]
      };
      setMessages([welcomeMessage]);
    }
  }, [disease, location.state]);

  // Auto scroll to bottom
  useEffect(() => {
    // Prevent auto-scrolling to the bottom when the page is first refreshed
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Use localized container scrolling instead of scrollIntoView 
    // to prevent the entire window from jumping/navigating to the footer
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  const getDiseaseInfo = (query, diseaseName) => {
    const lowerQuery = query.toLowerCase();
    const name = diseaseName || predictedDisease || "this condition";
    
    const responses = {
      treatment: `💊 **Treatment for ${name.replace(/___/g, ' ').replace(/_/g, ' ')}**:\n\n• Remove and destroy infected leaves immediately.\n• Apply recommended organic or chemical fungicides.\n• Ensure tools are sterilized before and after use.\n• Avoid watering from above to keep leaves dry.`,
      prevention: `🛡️ **Prevention Tips**:\n\n• Use disease-resistant seed varieties.\n• Maintain proper spacing (30-45cm) for airflow.\n• Rotate crops every season to break the disease cycle.\n• Keep the soil healthy with organic compost.`,
      fertilizer: `🌱 **Fertilizer Advice**:\n\n• Use a balanced NPK (16-16-16) to strengthen overall immunity.\n• Increase Potassium (K) intake for better disease resistance.\n• Avoid heavy Nitrogen (N) during active infections.`,
      care: `☀️ **General Care**:\n\n• Ensure 6-8 hours of direct sunlight.\n• Water at the base of the plant early in the morning.\n• Mulch the soil to prevent fungal spores from splashing onto leaves.`
    };

    if (lowerQuery.includes('treatment')) return responses.treatment;
    if (lowerQuery.includes('prevention')) return responses.prevention;
    if (lowerQuery.includes('fertilizer')) return responses.fertilizer;
    if (lowerQuery.includes('care')) return responses.care;
    return null;
  };

  const sendMessage = async (overrideText = null) => {
    // Ensure overrideText is a string (prevents React Event objects from being treated as text)
    const questionText = (typeof overrideText === 'string' ? overrideText : null) || input.trim();
    if (!questionText && !selectedImage) return;

    const userMessage = {
      sender: "user",
      text: questionText || "Analyze this plant image",
      image: imagePreview
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    const isImageAnalysis = !!selectedImage;
    const currentImage = selectedImage;
    const currentPreview = imagePreview;

    // Clear preview immediately after starting send
    setSelectedImage(null);
    setImagePreview(null);

    try {
      let data;
      if (isImageAnalysis) {
        // Using the same API logic as the Upload page
        const formData = new FormData();
        formData.append("image", currentImage);
        if (selectedCrop) formData.append("crop", selectedCrop);
        
        // Determine endpoint and headers based on Auth state
        const endpoint = isAuthenticated ? `${API_BASE_URL}/predict/auth` : `${API_BASE_URL}/predict`;
        const headers = {};
        const token = localStorage.getItem('token');
        if (isAuthenticated && token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: headers,
          body: formData,
        });

        if (!res.ok) throw new Error("Analysis failed");

        data = await res.json();

        // Handle prediction results
        // checking for all possible keys that might come from the API
        const detected = data.disease || data.predicted_disease || data.class || data.prediction || data.label;
        
        if (detected) {
          setPredictedDisease(detected);
          // Normalize confidence (handle both 0.95 and 95 formats)
          let confidence = data.confidence || data.score || 0.85;
          if (confidence > 1) confidence = confidence / 100;
          setPredictionConfidence(confidence);
          
          const botMessage = {
            sender: "bot",
            isResult: true,
            diseaseName: detected,
            confidence: (confidence * 100).toFixed(1),
            text: `I've analyzed the photo. It looks like **${detected.replace(/___/g, ' ').replace(/_/g, ' ')}**.`,
            quickReplies: ["Treatment", "Prevention", "Fertilizer Suggestions", "General Care"]
          };
          setMessages(prev => [...prev, botMessage]);
          return;
        }
      } else {
        // If we already have a predicted disease, check if user is asking for specific info locally
        const localResponse = predictedDisease ? getDiseaseInfo(questionText, predictedDisease) : null;
        
        if (localResponse) {
          data = { answer: localResponse };
        } else {
          // Standard chat logic
          const res = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: questionText,
              disease: predictedDisease || disease
            }),
          });
          data = await res.json();
        }
      }

      const botMessage = {
        sender: "bot",
        text: data.answer || "I've analyzed the request but couldn't generate a specific response. Please try again."
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "bot",
        text: "Sorry, I encountered an error. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 4096 },
          height: { ideal: 2160 }
        }
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

    // Set canvas to high resolution matching the video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // High quality settings
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    setTempImage(canvas.toDataURL('image/jpeg', 1.0));
    setIsCropping(true);
    stopCamera();
  };

  const applyCrop = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Simple square center crop logic for high-quality leaf analysis
      const size = Math.min(img.width, img.height);
      const startX = (img.width - size) / 2;
      const startY = (img.height - size) / 2;

      canvas.width = size;
      canvas.height = size;
      context.drawImage(img, startX, startY, size, size, 0, 0, size, size);

      canvas.toBlob((blob) => {
        const file = new File([blob], "captured-leaf.jpg", { type: "image/jpeg" });
        setSelectedImage(file);
        setImagePreview(canvas.toDataURL('image/jpeg', 0.95));
        setIsCropping(false);
        setTempImage(null);
      }, 'image/jpeg', 0.95);
    };
    img.src = tempImage;
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
          <div className="chatbot-header-icon"></div>
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
      {/* Messages Area */}
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-state-icon"></div>
            <p>Start a conversation by asking a question about plant diseases or farming!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className={`message-bubble ${msg.isResult ? 'result-bubble' : ''}`}>
                {msg.image && (
                  <img src={msg.image} alt="Uploaded" className="message-image" />
                )}
                {msg.isResult ? (
                  <div className="analysis-card">
                    <div className="analysis-header">🔍 Analysis Result</div>
                    <div className="analysis-body">
                      <div className="detected-label">Detected Condition:</div>
                      <div className="detected-value">{msg.diseaseName.replace(/___/g, ' ').replace(/_/g, ' ')}</div>
                      <div className="confidence-meter">
                        <div className="confidence-bar" style={{ width: `${msg.confidence}%` }}></div>
                      </div>
                      <div className="confidence-text">Confidence: {msg.confidence}%</div>
                    </div>
                  </div>
                ) : (
                  <p className="message-text">{msg.text}</p>
                )}
                {msg.quickReplies && (
                  <div className="quick-replies">
                    {msg.quickReplies.map((reply, i) => (
                      <button key={i} onClick={() => sendMessage(reply)} className="reply-btn">
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
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
              Capture Photo
            </button>
            <button onClick={stopCamera} className="camera-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cropping Interface */}
      {isCropping && (
        <div className="camera-container">
          <div className="crop-header">
            <h3>Optimize Image for Detection</h3>
            <p>Center the leaf in the frame for best results</p>
          </div>
          <div className="crop-view-container">
            <img src={tempImage} alt="Raw capture" className="crop-raw-img" />
            <div className="crop-overlay-box"></div>
          </div>
          <div className="camera-controls">
            <button onClick={applyCrop} className="camera-btn confirm-btn">
              Confirm & Crop
            </button>
            <button onClick={() => { setIsCropping(false); startCamera(); }} className="camera-btn">
              Retake
            </button>
          </div>
        </div>
      )}

      {imagePreview && !cameraActive && !isCropping && (
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

      <canvas ref={canvasRef} className="hidden-canvas" />

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
              <span className="chat-button-icon"></span>
              <span>Upload</span>
            </button>

            <button
              onClick={cameraActive ? stopCamera : startCamera}
              className="chat-btn action-btn"
              title={cameraActive ? "Stop camera" : "Take photo"}
              type="button"
            >
              <span className="chat-button-icon"></span>
              <span>{cameraActive ? 'Close Camera' : 'Camera'}</span>
            </button>

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() && !selectedImage}
              className="chat-btn send-btn"
              title="Send message"
              type="button"
            >
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;