// src/layouts/MainLayout.jsx
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarItem, NavBar, Overlay, Badge } from "react-vant";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  ShopO,
  CartO,
  FriendsO,
  BalancePay,
  Upgrade,
  Bars,
  Replay,
  Paid,
  ChatO,
} from "@react-vant/icons";
import styles from "./mainLayout.module.scss";

const MainLayout = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation(); // 获取当前路由信息
  const [activeKey, setActiveKey] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [title, setTitle] = useState("");

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
            key: "messageList",
            title: "消息列表",
            icon: <ChatO />,
            path: "/message-list",
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
            key: "merchantSetting",
            title: "商家配置",
            icon: <Paid />,
            path: "/merchant-setting",
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
          {
            key: "chat",
            title: "客服消息",
            icon: <ChatO />,
            path: "/chat",
          },
        ];

  // 在组件加载时，根据当前 URL 设置 activeKey 和 title
  useEffect(() => {
    const currentPath = location.pathname; // 获取当前 URL 路径
    const matchedIndex = sidebarItems.findIndex(
      (item) => item.path === currentPath
    );
    if (matchedIndex !== -1) {
      setActiveKey(matchedIndex);
      setTitle(sidebarItems[matchedIndex].title);
    } else {
      // 如果当前路径不在 sidebarItems 中，可以设置一个默认值
      setActiveKey(0);
      setTitle(sidebarItems[0].title);
    }
  }, [location.pathname, sidebarItems]); // 依赖 location.pathname 和 sidebarItems

  // 切换侧边栏显示状态
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // 关闭侧边栏
  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  // 刷新页面
  const refreshPage = () => {
    window.location.reload();
  };

  const handleSidebarChange = (key) => {
    console.log("key", key);
    setActiveKey(key);
    setTitle(sidebarItems[key].title);
    const item = sidebarItems[key];
    if (item) {
      navigate(item.path);
      setSidebarVisible(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 顶部工具栏 */}
      <NavBar
        title={title}
        leftText={<Bars name="bars" size="20" onClick={toggleSidebar} />}
        rightText={<Replay name="refresh" size="20" onClick={refreshPage} />}
        fixed
      />
      {/* 暗色透明遮罩 */}
      <Overlay
        visible={sidebarVisible}
        onClick={closeSidebar}
        style={{ zIndex: 999 }}
      >
        {/* 侧边栏 */}
        <div className={`${styles.sidebar} ${styles.visible}`}>
          <Sidebar
            value={activeKey}
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
      </Overlay>

      {/* 主内容区域 */}
      <div className={styles.mainContent}>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
