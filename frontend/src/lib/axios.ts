import axios from "axios";

export const axiosInstance =axios.create({
    baseURL: import.meta.env.MODE==="development"? "https://playlisten-backend.onrender.com/api": "/api",
    withCredentials: true,
})