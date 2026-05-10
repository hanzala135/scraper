import axios from "axios";

const BASE_URL = "https://scraper-two-pink.vercel.app/_/backend/api";

const api = axios.create({
  baseURL: BASE_URL,
});

export const getHistory = () => api.get("/history").then((r) => r.data);
export const getStats = () => api.get("/history/stats").then((r) => r.data);
export const getRun = (id) => api.get(`/history/${id}`).then((r) => r.data);

export const deleteRun = (id) =>
  api.delete(`/history/${id}`).then((r) => r.data);

export const clearHistory = () => api.delete("/history").then((r) => r.data);

export const startScrape = (task) =>
  new EventSource(`${BASE_URL}/scrape/${task}`);
