const disease = response.data.disease;

const info = diseaseData[disease] || {
  description: "No description available.",
  symptoms: ["No information available."],
  treatment: "No treatment available.",
  prevention: "No prevention available."
};

setPrediction({
  disease: disease,
  confidence: response.data.confidence,
  description: info.description,
  symptoms: info.symptoms,
  treatment: info.treatment,
  prevention: info.prevention
});