import axios from "axios";

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        "https://ai-leafdisease-detection.onrender.com",
    timeout: 120000,
    headers: {
        "ngrok-skip-browser-warning": "69420",
    },
});

export default api;