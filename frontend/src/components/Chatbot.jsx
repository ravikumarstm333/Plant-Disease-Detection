import React from "react";
import { useLocation } from "react-router-dom";
import UnifiedChatbot from "./chat/UnifiedChatbot";

const Chatbot = ({ disease, diseaseData }) => {
  const location = useLocation();
  const stateDisease = location.state?.disease || disease || "";
  const stateDiseaseData = location.state?.diseaseData || diseaseData || {};

  return (
    <div style={{ minHeight: "70vh", padding: "20px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ height: "70vh", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
        <UnifiedChatbot diseaseName={stateDisease} diseaseData={stateDiseaseData} title="AI Plant Assistant" />
      </div>
    </div>
  );
};

export default Chatbot;
