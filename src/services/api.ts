import axios from "axios";
axios.defaults.baseURL =
    process.env.NODE_ENV === "development" ? "" : "https://coralscop-bke.hkustvgd.com";
const bkebase = process.env.NODE_ENV === "development" ? "/bke" : "";

const apiInstance = axios.create({
  baseURL: `${bkebase}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

const staticFileInstance = axios.create({
  baseURL: `${bkebase}`,
});

export { apiInstance, staticFileInstance };