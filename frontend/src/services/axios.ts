import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: 'https://localhost:7292/',
    withCredentials: true,
});