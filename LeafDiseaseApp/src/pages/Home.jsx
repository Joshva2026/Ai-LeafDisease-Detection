import React, { useState } from "react";
import api from "../api/api";

function Home() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [confidence, setConfidence] = useState("");

  const uploadImage = async () => {
    if (!image) {
      alert("Select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await api.post("/predict", formData);

      console.log(response.data); // Debug

      setResult(response.data.disease);
      setConfidence(response.data.confidence);
    } catch (error) {
      console.error(error);
      setResult("Server error");
      setConfidence("");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>🌿 Leaf Disease Detection</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <br />
      <br />

      <button onClick={uploadImage}>
        Predict Disease
      </button>

      <br />
      <br />

      <h2>Disease : {result}</h2>

      <h3>
        {confidence && `Confidence : ${confidence}%`}
      </h3>
    </div>
  );
}

export default Home;
