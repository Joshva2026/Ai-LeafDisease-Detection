/* =====================================================
   DISEASE PARSING AND MAPPING HELPER
 ===================================================== */

export const mapClassName = (className, lang = "en") => {
  if (!className) {
    return {
      plantName: lang === "ta" ? "பயிர்" : "Plant",
      diseaseName: lang === "ta" ? "தெரியாது" : "Unknown",
      displayName: lang === "ta" ? "தெரியாது" : "Unknown",
      status: "Unknown",
      severity: "Unknown",
      emoji: "🌿",
      isHealthy: false
    };
  }

  const parts = className.split("___");
  let plantRaw = parts[0] || "Plant";
  let diseaseRaw = parts[1] || "healthy";

  // Clean Plant Name
  let plantName = plantRaw.replace(/_/g, " ").replace(/\(including sour\)/g, "");
  plantName = plantName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  if (plantName.toLowerCase().includes("pepper")) {
    plantName = "Bell Pepper";
  }

  // Clean Disease Name
  let diseaseName = diseaseRaw.replace(/_/g, " ");
  
  // Custom corrections
  const lowerDisease = diseaseName.toLowerCase();
  if (lowerDisease.includes("cercospora") || lowerDisease.includes("gray leaf spot")) {
    diseaseName = "Gray Leaf Spot";
  } else if (lowerDisease.includes("esca")) {
    diseaseName = "Esca (Black Measles)";
  } else if (lowerDisease.includes("isariopsis")) {
    diseaseName = "Leaf Blight (Isariopsis)";
  } else if (lowerDisease.includes("haunglongbing")) {
    diseaseName = "Citrus Greening";
  } else if (lowerDisease.includes("spider mites")) {
    diseaseName = "Spider Mites";
  } else if (lowerDisease.includes("healthy")) {
    diseaseName = "Healthy";
  }
  
  // Title Case disease name
  diseaseName = diseaseName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const isHealthy = diseaseName.toLowerCase() === "healthy";

  let displayName = `${plantName} - ${diseaseName}`;
  if (isHealthy) {
    displayName = `${plantName} (Healthy)`;
  }

  // Set Status & Severity
  let status = "Healthy";
  let severity = "None";
  
  if (!isHealthy) {
    severity = "Medium";
    if (lowerDisease.includes("blight") || 
        lowerDisease.includes("greening") || 
        lowerDisease.includes("virus") ||
        lowerDisease.includes("mosaic") ||
        lowerDisease.includes("black rot")) {
      severity = "High";
    }
    
    if (lowerDisease.includes("bacterial") || lowerDisease.includes("greening")) {
      status = "Bacterial";
    } else if (lowerDisease.includes("virus") || lowerDisease.includes("mosaic")) {
      status = "Viral";
    } else if (lowerDisease.includes("mite") || lowerDisease.includes("pest")) {
      status = "Pest";
    } else {
      status = "Fungal";
    }
  }

  // Emojis for plants
  const plantEmojis = {
    "Apple": "🍎",
    "Blueberry": "🫐",
    "Cherry": "🍒",
    "Corn": "🌽",
    "Grape": "🍇",
    "Orange": "🍊",
    "Peach": "🍑",
    "Bell Pepper": "🫑",
    "Pepper, Bell": "🫑",
    "Potato": "🥔",
    "Raspberry": "🌿",
    "Soybean": "🌱",
    "Squash": "🥬",
    "Strawberry": "🍓",
    "Tomato": "🍅"
  };

  const emoji = plantEmojis[plantName] || "🌿";

  const result = {
    plantName,
    diseaseName,
    displayName,
    status,
    severity,
    emoji,
    isHealthy
  };

  // Add Tamil translations if lang === "ta"
  if (lang === "ta") {
    const plantTranslations = {
      "Apple": "ஆப்பிள்",
      "Blueberry": "புளூபெர்ரி",
      "Cherry": "செர்ரி",
      "Corn": "சோளம்",
      "Grape": "திராட்சை",
      "Orange": "ஆரஞ்சு",
      "Peach": "பீச்",
      "Bell Pepper": "குடைமிளகாய்",
      "Pepper, Bell": "குடைமிளகாய்",
      "Potato": "உருளைக்கிழங்கு",
      "Raspberry": "ராஸ்பெர்ரி",
      "Soybean": "சோயாபீன்ஸ்",
      "Squash": "ஸ்குவாஷ்",
      "Strawberry": "ஸ்ட்ராபெரி",
      "Tomato": "தக்காளி",
      "Plant": "பயிர்"
    };

    const diseaseTranslations = {
      "Healthy": "ஆரோக்கியமானது",
      "Scab": "இலை சொறி நோய் (Scab)",
      "Black Rot": "கரு அழுகல் நோய் (Black Rot)",
      "Cedar Apple Rust": "சிடார் ஆப்பிள் துரு நோய்",
      "Esca (Black Measles)": "எஸ்கா கரும்புள்ளி நோய்",
      "Leaf Blight (Isariopsis)": "இலை கருகல் நோய் (Blight)",
      "Common Rust": "சாதாரண துரு நோய்",
      "Gray Leaf Spot": "சாம்பல் இலை புள்ளி நோய்",
      "Northern Leaf Blight": "வடக்கு இலை கருகல் நோய்",
      "Powdery Mildew": "சாம்பல் நோய் (Mildew)",
      "Early Blight": "முன் கருகல் நோய் (Early Blight)",
      "Late Blight": "பின் கருகல் நோய் (Late Blight)",
      "Leaf Mold": "இலை பூஞ்சை காளான்",
      "Septoria Leaf Spot": "செப்டோரியா இலை புள்ளி நோய்",
      "Spider Mites": "சிலந்தி பூச்சி தாக்குதல்",
      "Target Spot": "இலக்கு புள்ளி நோய் (Target Spot)",
      "Yellow Leaf Curl Virus": "மஞ்சள் இலை சுருள் வைரஸ்",
      "Mosaic Virus": "மொசைக் வைரஸ்",
      "Citrus Greening": "சிட்ரஸ் கிரீனிங் நோய்",
      "Bacterial Spot": "பாக்டீரியா புள்ளி நோய்",
      "Leaf Blight": "இலை கருகல் நோய்",
      "Unknown": "தெரியாத பாதிப்பு"
    };

    const tPlant = plantTranslations[plantName] || plantName;
    let tDisease = diseaseTranslations[diseaseName] || diseaseName;
    if (!diseaseTranslations[diseaseName]) {
      for (const key in diseaseTranslations) {
        if (diseaseName.toLowerCase().includes(key.toLowerCase())) {
          tDisease = diseaseTranslations[key];
          break;
        }
      }
    }

    result.plantName = tPlant;
    result.diseaseName = tDisease;
    result.displayName = diseaseName === "Healthy" ? `${tPlant} (${tDisease})` : `${tPlant} - ${tDisease}`;
  }

  return result;
};

export const getSeverityStyle = (severity) => {
  switch (severity?.toLowerCase()) {
    case "none":
      return "healthy";
    case "medium":
      return "warning";
    case "high":
      return "danger";
    default:
      return "healthy";
  }
};
