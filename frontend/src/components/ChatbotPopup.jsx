import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import UnifiedChatbot from "./chat/UnifiedChatbot";
import "./ChatbotPopup.css";

const ChatbotPopup = ({ isOpen, onClose, disease, diseaseData }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="chatbot-overlay"
          />

          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="chatbot-popup"
          >
            <div className="chatbot-header">
              <div className="chatbot-title">
                <h2>Plant Care Bot</h2>
              </div>
              <button onClick={onClose} className="chatbot-close-btn" aria-label="Close chatbot">
                <X size={24} />
              </button>
            </div>
            <div style={{ height: "calc(100% - 64px)" }}>
              <UnifiedChatbot diseaseName={disease} diseaseData={diseaseData || {}} title="Ask About Your Plant" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatbotPopup;
