import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Cell, Popup, RadioGroup, Radio } from "react-vant";
import axios from "axios";
import styles from "./index.module.scss"; // 引入样式文件
import request from "@/utils/request";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // const [captcha, setCaptcha] = useState(generateCaptcha());
  // const [captchaInput, setCaptchaInput] = useState("");
  // const [showCaptchaPopup, setShowCaptchaPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { username = "" } = JSON.parse(localStorage.getItem("user") || "{}");
    setUsername(username);
  }, []);

  // function generateCaptcha() {
  //   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  //   let result = "";
  //   for (let i = 0; i < 4; i++) {
  //     result += chars.charAt(Math.floor(Math.random() * chars.length));
  //   }
  //   return result;
  // }

  const handleLogin = async () => {
    // if (captchaInput.toUpperCase() !== captcha) {
    //   alert("验证码错误");
    //   setCaptcha(generateCaptcha());
    //   setCaptchaInput("");
    //   return;
    // }

    const response = await request.post("/user/login", {
      username,
      password,
    });
    const role = response.data.role;
    if (response.data?.token) {
      // 保存 token 到 localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));

      // 更新用户状态
      setUser({ username, role });
      // 根据角色跳转到不同页面
      if (role === "merchant") {
        navigate("/upload");
      } else {
        navigate("/products");
      }
    } else {
      alert(response?.message || "登录失败");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>登录</h1>
      <Cell title="用户名">
        <Input
          placeholder="请输入用户名"
          value={username}
          onChange={setUsername}
        />
      </Cell>
      <Cell title="密码">
        <Input
          type="password"
          placeholder="请输入密码"
          value={password}
          onChange={setPassword}
        />
      </Cell>
      <Button
        className={styles.loginButton}
        type="primary"
        block
        onClick={() => handleLogin()}
      >
        登录
      </Button>
      <Button type="default" block onClick={() => navigate("/register")}>
        去注册
      </Button>

      {/* <Popup
        visible={showCaptchaPopup}
        onClose={() => setShowCaptchaPopup(false)}
      >
        <div className={styles.captchaPopup}>
          <h3 className={styles.captchaTitle}>请输入验证码</h3>
          <p className={styles.captchaText}>{captcha}</p>
           <Input
            placeholder="请输入验证码"
            value={captchaInput}
            onChange={setCaptchaInput}
          /> 
          <Button
            className={styles.confirmButton}
            type="primary"
            block
            onClick={handleLogin}
          >
            确认
          </Button>
        </div>
      </Popup>  */}
    </div>
  );
}

export default Login;
