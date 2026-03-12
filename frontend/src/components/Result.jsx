import React from "react";
import { useLocation } from "react-router-dom";

function Result() {

  const location = useLocation();
  const data = location.state;

  if (!data) {
    return <h2>No Result Found</h2>;
  }

  const {
    disease,
    confidence,
    treatment,
    fertilizer,
    fertilizer_links,
  } = data;

  const showRawJson = !disease && !confidence && !treatment && !fertilizer;

  return (
    <div className="container">

      <h2>Prediction Result</h2>

      <div className="card">
        {showRawJson ? (
          <>
            <p>Received data in an unexpected format. Raw API response:</p>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </>
        ) : (
          <> 
            <h3>Disease: {disease}</h3>

            <p>
              <strong>Confidence:</strong> {confidence}%
            </p>

            <p>
              <strong>Treatment:</strong> {treatment}
            </p>

            <p>
              <strong>Fertilizer:</strong> {fertilizer}
            </p>

            <h4>Buy Fertilizer:</h4>

            <ul>
              {Array.isArray(fertilizer_links) ? (
                fertilizer_links.map((link, index) => (
                  <li key={index}>
                    <a href={link} target="_blank" rel="noreferrer">
                      {link}
                    </a>
                  </li>
                ))
              ) : (
                <li>{String(fertilizer_links)}</li>
              )}
            </ul>
          </>
        )}
      </div>

    </div>
  );
}

export default Result;