// src/pages/Profile.jsx
import React from "react";
import { Cell, Button, Toast } from "react-vant";
import { useNavigate } from "react-router-dom";

const Profile = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null); // 清除用户信息
    localStorage.removeItem("token"); // 清除 token
    Toast.success("已退出登录");
    navigate("/login"); // 跳转到登录页面
  };

  return (
    <div>
      <h2>个人中心</h2>
      <Cell title="用户名" value={user?.username || "未知"} />
      <Cell title="角色" value={user?.role === "merchant" ? "商家" : "客户"} />
      <Cell title="注册时间" value="2025-03-27" />
      <Button
        type="danger"
        block
        style={{ marginTop: "20px" }}
        onClick={handleLogout}
      >
        退出登录
      </Button>
    </div>
  );
};

export default Profile;
