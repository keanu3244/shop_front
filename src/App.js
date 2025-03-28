// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Loading, Flex } from "react-vant"; // 引入 Flex 组件用于布局
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
import request from "./utils/request";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("App component mounted");
    const restoreUser = async () => {
      let restoredUser = null;
      try {
        const token = localStorage.getItem("token");
        console.log("Token from localStorage:", token);
        if (token) {
          const { data, status } = await request.get("/user/verify", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("恢复用户状态:", data);
          if (status === "ok") {
            restoredUser = data.user;
            console.log("Restored user:", restoredUser);
          } else {
            localStorage.removeItem("token");
            console.log("Token invalid, user set to null");
          }
        } else {
          console.log("No token found, user set to null");
        }
      } catch (error) {
        console.error("恢复用户状态失败:", error);
        localStorage.removeItem("token");
        console.log("Error occurred, user set to null");
      } finally {
        setUser(restoredUser);
        setLoading(false);
        console.log("Loading set to false, user:", restoredUser);
      }
    };

    restoreUser();
  }, []);

  console.log("Rendering App, user:", user, "loading:", loading);

  if (loading) {
    return (
      <Flex
        direction="column"
        justify="center"
        align="center"
        style={{ height: "100vh" }}
      >
        <Loading type="spinner" size="large" color="#1989fa" />
      </Flex>
    );
  }

  return (
    <Router>
      <div className="container">
        <Routes>
          <Route
            path="/login"
            element={
              user ? <Navigate to="/products" /> : <Login setUser={setUser} />
            }
          />
          <Route path="/register" element={<Register setUser={setUser} />} />

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

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
