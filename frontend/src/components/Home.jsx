import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>Plant Disease Detection</h1>

      <button onClick={() => navigate("/upload")}>
        Upload Plant Image
      </button>
    </div>
  );
}

export default Home;