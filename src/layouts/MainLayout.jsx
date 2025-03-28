// src/layouts/MainLayout.jsx
import React, { useState } from "react";
import { Sidebar, SidebarItem } from "react-vant";
import { useNavigate, Outlet } from "react-router-dom";
import { ShopO, CartO, FriendsO, BalancePay, Upgrade } from "@react-vant/icons";
import styles from "./mainLayout.module.scss";

const MainLayout = ({ user }) => {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState("products");

  // 根据用户角色动态显示侧边栏 Tab
  const sidebarItems =
    user.role === "merchant"
      ? [
          {
            key: "upload",
            title: "上传商品",
            icon: <Upgrade />,
            path: "/upload",
          },
          {
            key: "products",
            title: "商品列表",
            icon: <ShopO />,
            path: "/products",
          },
          {
            key: "orders",
            title: "订单中心",
            icon: <CartO />,
            path: "/orders",
          },
          {
            key: "profile",
            title: "个人中心",
            icon: <FriendsO />,
            path: "/profile",
          },
        ]
      : [
          {
            key: "products",
            title: "商品列表",
            icon: <ShopO />,
            path: "/products",
          },
          {
            key: "orders",
            title: "订单中心",
            icon: <CartO />,
            path: "/orders",
          },
          {
            key: "profile",
            title: "个人中心",
            icon: <FriendsO />,
            path: "/profile",
          },
          {
            key: "balance",
            title: "账户余额",
            icon: <BalancePay />,
            path: "/balance",
          },
        ];

  const handleSidebarChange = (key) => {
    setActiveKey(key);
    const item = sidebarItems[key];
    console.log("item", item, key);
    if (item) {
      navigate(item.path);
    }
  };

  return (
    <div className={styles.container}>
      {/* 侧边栏 */}
      <div className={styles.sidebar}>
        <Sidebar
          activeKey={activeKey}
          onChange={handleSidebarChange}
          className={styles.sidebarContent}
        >
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.key}
              title={
                <div className={styles.sidebarItem}>
                  {item.icon}
                  <span className={styles.sidebarTitle}>{item.title}</span>
                </div>
              }
            />
          ))}
        </Sidebar>
      </div>

      {/* 主内容区域 */}
      <div className={styles.mainContent}>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
