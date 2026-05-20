import React, { useEffect, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UnifiedChatbot = ({ diseaseName = "", diseaseData = {}, title = "AI Plant Assistant" }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) {
      const intro = diseaseName
        ? `Hello! I can help with ${String(diseaseName).replace(/_/g, " ")}. Ask treatment, fertilizer or prevention.`
        : "Hello! Ask me farming, crop, disease, fertilizer, soil, or pest questions.";
      setMessages([{ sender: "bot", text: intro }]);
    }
  }, [diseaseName, messages.length]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          diseaseName,
          diseaseData,
        }),
      });

      const data = await res.json();
      console.log("chatbot api response:", data);
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply || "No response from AI." }]);
    } catch (err) {
      console.error("chatbot api error:", err);
      setMessages((prev) => [...prev, { sender: "bot", text: "Error: Could not get response. Check network tab." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "10px 12px", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>{title}</div>
      <div ref={containerRef} style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ marginBottom: 10, textAlign: m.sender === "user" ? "right" : "left" }}>
            <span
              style={{
                display: "inline-block",
                padding: "8px 10px",
                borderRadius: 10,
                background: m.sender === "user" ? "#d1fae5" : "#f3f4f6",
                maxWidth: "80%",
                whiteSpace: "pre-wrap",
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
        {loading && <div style={{ color: "#6b7280", fontStyle: "italic" }}>Typing...</div>}
      </div>
      <div style={{ borderTop: "1px solid #e5e7eb", padding: 10, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Ask your question..."
          style={{ flex: 1, padding: "10px", border: "1px solid #d1d5db", borderRadius: 8 }}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ padding: "10px 14px" }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default UnifiedChatbot;
