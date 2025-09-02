import { getToken, isExpired, removeToken } from "./auth-helper.js";
import { API_ENDPOINTS, apiRequest } from "./api.js";

export async function enforceAuth() {
  const token = getToken();

  if (!token || isExpired(token)) {
    removeToken();
    window.location.href = "login.html";
    return;
  }

  try {
    await apiRequest(API_ENDPOINTS.ME, { method: "GET" }); // validate backend session
  } catch (err) {
    console.warn("Session invalid:", err);
    removeToken();
    window.location.href = "login.html";
  }
}

document.addEventListener("DOMContentLoaded", enforceAuth);
