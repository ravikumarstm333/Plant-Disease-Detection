import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Upload() {
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setImage(e.target.files[0]);
  };

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await fetch("/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed: ${res.status} ${res.statusText} (${text})`);
      }

      const data = await res.json();
      navigate("/result", { state: data });
    } catch (err) {
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Upload Leaf Image</h2>

      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleChange} required />
        <button type="submit" disabled={loading}>
          {loading ? "Detecting…" : "Detect Disease"}
        </button>
      </form>

      {error && (
        <div style={{ color: "red", marginTop: "1rem" }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

export default Upload;