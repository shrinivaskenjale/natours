import axios from "axios";

const request = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_BASE_URL}/api/v1`,
  withCredentials: true,
});

export default request;
