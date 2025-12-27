import axios from "axios"

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api`,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to attach token
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("[v0] API Request:", config.method?.toUpperCase(), config.url)
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["x-auth-token"] = token
    }
    return config
  },
  (error) => {
    console.log("[v0] Request Error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("[v0] API Response:", response.status, response.config.url)
    return response
  },
  (error) => {
    console.log("[v0] Response Error:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    })
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
