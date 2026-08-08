/* =====================================================
   AXIOS API CONFIGURATION
===================================================== */

import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420"
    },
});

export default api;