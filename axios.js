import axios from "axios";

const API = axios.create({
  baseURL: axios.get("https://zhongke-app.onrender.com/api/users"),
});

export default API;
