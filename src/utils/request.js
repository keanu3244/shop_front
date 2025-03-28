import axios from "axios";
import { Toast } from "react-vant";
const isDev = process.env.NODE_ENV === "development";
console.log("isDev", isDev);
// 创建axios实例
const service = axios.create({
  baseURL: isDev
    ? process.env.REACT_APP_API_PREFIX // 开发环境走代理（如 /api）
    : process.env.REACT_APP_BASE_API, // api的base_url
  timeout: 5000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // 例如：设置token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    const res = response.data;
    console.log("axios-res", response);
    if (response?.status === 401) {
      window.location.href = "/login";
      return Promise.reject(new Error("未授权，请重新登录"));
    }

    if (res.code !== 200 && res.code !== 201) {
      // 处理业务错误
      Toast.fail(res.message);
      return res;
    } else {
      return res;
    }
  },
  (error) => {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

export default service;
