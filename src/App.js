// src/App.jsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import ProductList from "./pages/productlist";
import ProductUpload from "./pages/productupload";
import OrderList from "./pages/orderlist";
import Profile from "./pages/profile";
import Balance from "./pages/balance";
import CategoryManage from "./pages/categoryManage";
import "./styles.css";

function App() {
  const [user, setUser] = useState(null); // 用户信息：{ role: 'merchant' 或 'customer', username: '' }

  return (
    <Router>
      <div className="container">
        <Routes>
          {/* 登录和注册页面独立展示 */}
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />

          {/* 其他页面使用侧边栏布局 */}
          <Route
            path="/"
            element={
              user ? <MainLayout user={user} /> : <Navigate to="/login" />
            }
          >
            <Route index element={<Navigate to="/products" replace />} />
            <Route path="home" element={<Home user={user} />} />
            <Route path="products" element={<ProductList user={user} />} />
            <Route
              path="upload"
              element={
                user && user.role === "merchant" ? (
                  <ProductUpload />
                ) : (
                  <Navigate to="/products" />
                )
              }
            />
            <Route path="orders" element={<OrderList user={user} />} />
            <Route
              path="profile"
              element={<Profile user={user} setUser={setUser} />}
            />
            <Route path="balance" element={<Balance />} />
            <Route path="categories" element={<CategoryManage />} />
          </Route>

          {/* 404 路由 */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
