import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot } from 'lucide-react';
import './ChatbotPopup.css';

const ChatbotPopup = ({ isOpen, onClose, disease }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize welcome message when popup opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: `Hello! 👋 I see your plant has **${disease}**.\n\nWould you like to know about:\n• Treatment methods\n• Prevention tips\n• Fertilizer suggestions\n• General care\n\nJust ask away!`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, disease, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getDiseaseInfo = (query) => {
    const lowerQuery = query.toLowerCase();

    // Disease-specific responses
    const diseaseResponses = {
      treatment: `For ${disease}, here are the recommended treatments:\n\n**Chemical Treatment:**\n• Apply fungicide or bactericide based on the disease type\n• Follow the manufacturer's instructions\n• Apply every 7-14 days as needed\n\n**Natural Treatment:**\n• Improve air circulation\n• Remove infected leaves\n• Avoid overhead watering\n• Apply neem oil or sulfur spray\n\n**Important:** Consult with a local agricultural expert for specific recommendations.`,

      prevention: `**Prevention Tips for ${disease}:**\n\n✓ **Watering:** Water at the base, avoid wetting leaves\n✓ **Spacing:** Ensure proper plant spacing for airflow\n✓ **Sanitation:** Remove diseased leaves promptly\n✓ **Drainage:** Ensure good soil drainage\n✓ **Mulch:** Apply mulch to prevent soil splash\n✓ **Tools:** Sterilize pruning tools between cuts\n✓ **Rotation:** Rotate crops annually\n✓ **Weather:** Monitor weather and adjust care accordingly`,

      fertilizer: `**Fertilizer Recommendations for ${disease}:**\n\n**During Disease:**\n• Use NPK 8:16:24 (higher potassium for resilience)\n• Reduce nitrogen to avoid excessive growth\n• Add magnesium (Epsom salt) if deficient\n\n**After Recovery:**\n• Switch to balanced NPK 16:16:16\n• Apply micronutrients if needed\n• Use organic compost for long-term health\n\n**Application:**\n• Follow dosage instructions on packaging\n• Apply every 2-4 weeks during growing season\n• Avoid fertilizer burn by watering first`,

      care: `**General Plant Care for ${disease}:**\n\n🌱 **Light:** Provide 6-8 hours of sunlight daily\n💧 **Water:** Water consistently, avoid overwatering\n🌡️ **Temperature:** Maintain optimal temperature (varies by plant)\n💨 **Humidity:** Maintain moderate humidity\n🧪 **Soil:** Use well-draining soil with proper pH\n📊 **Monitoring:** Check plants regularly for early signs\n✂️ **Pruning:** Remove dead or diseased parts promptly\n🔄 **Rotation:** Rotate plants to maintain health`,

      duration: `**Recovery Timeline for ${disease}:**\n\n**Week 1-2:** Start treatment, remove infected parts\n**Week 3-4:** Symptoms should start improving\n**Week 5-6:** Visible recovery expected\n**Week 7-8:** Full recovery (depending on severity)\n\n**Note:** Severe cases may take longer. Monitor progress and adjust treatment if needed.`,

      spread: `**How ${disease} Spreads:**\n\n🦠 **Waterborne:** Through splashing water and irrigation\n🌬️ **Airborne:** Through wind and air currents\n✋ **Contact:** Through contaminated tools or hands\n🌍 **Soil:** Through infected soil particles\n🍂 **Debris:** Through fallen diseased leaves\n\n**Prevention:**\n• Maintain good sanitation\n• Avoid working with plants when wet\n• Sterilize tools regularly\n• Remove infected plant material`,
    };

    // Check for keywords in the query
    for (const [key, response] of Object.entries(diseaseResponses)) {
      if (lowerQuery.includes(key)) {
        return response;
      }
    }

    // Default response if no match
    return `I can help you with:\n\n✓ **Treatment** - Specific treatment methods for ${disease}\n✓ **Prevention** - How to prevent this disease\n✓ **Fertilizer** - Recommended fertilizer options\n✓ **Care** - General plant care tips\n✓ **Duration** - Recovery timeline\n✓ **Spread** - How the disease spreads\n\nJust ask about any of these topics!`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    // Simulate API call delay (1.5 seconds)
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getDiseaseInfo(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const slideInVariants = {
    hidden: { x: 400, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      x: 400,
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="chatbot-overlay"
          />

          {/* Chatbot Panel */}
          <motion.div
            variants={slideInVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="chatbot-popup"
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-title">
                <Bot size={24} className="text-green-600" />
                <h2>Plant Care Bot</h2>
              </div>
              <button
                onClick={onClose}
                className="chatbot-close-btn"
                aria-label="Close chatbot"
              >
                <X size={24} />
              </button>
            </div>

            {/* Messages Container */}
            <div className="chatbot-messages">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className={`message ${message.sender}`}
                >
                  {message.sender === 'bot' && (
                    <div className="message-avatar bot-avatar">
                      <Bot size={20} />
                    </div>
                  )}

                  <div className={`message-bubble ${message.sender}`}>
                    <MessageContent text={message.text} />
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className="message bot"
                >
                  <div className="message-avatar bot-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="message-bubble bot typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chatbot-input-area">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about treatment, prevention, fertilizer..."
                className="chatbot-input"
                rows="3"
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !inputValue.trim()}
                className="chatbot-send-btn"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Message Content Component with Markdown-like formatting
const MessageContent = ({ text }) => {
  // Simple markdown-like parser for bold text
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <div className="message-content">
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={idx}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return (
          <span key={idx}>
            {part.split('\n').map((line, lineIdx) => (
              <div key={lineIdx}>{line}</div>
            ))}
          </span>
        );
      })}
    </div>
  );
};

export default ChatbotPopup;
