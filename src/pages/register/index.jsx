import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Cell, RadioGroup, Radio, Toast } from "react-vant";
import styles from "./index.module.scss"; // 引入样式文件
import request from "@/utils/request";

function Register({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password) {
      Toast.fail("用户名和密码不能为空");
      return;
    }

    try {
      const response = await request.post("/user/register", {
        username,
        password,
        role,
      });
      console.log("response", response);
      if (response.status == "ok") {
        Toast.success("注册成功");
        setUser({ username, role });
        if (role === "merchant") {
          navigate("/productupload");
        } else {
          navigate("/products");
        }
      } else {
        Toast.fail(response.message || "注册失败");
      }
    } catch (error) {
      Toast.fail("注册失败，请稍后重试");
      console.error("注册失败:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>注册</h2>
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
      <Cell title="选择角色">
        <RadioGroup direction="horizontal" value={role} onChange={setRole}>
          <Radio name="customer">客户</Radio>
          <Radio name="merchant">商家</Radio>
        </RadioGroup>
      </Cell>
      <Button
        className={styles.registerButton}
        type="primary"
        block
        onClick={handleRegister}
      >
        注册
      </Button>
      <Button
        style={{ marginTop: "10px" }}
        type="default"
        block
        onClick={() => navigate("/login")}
      >
        去登录
      </Button>
    </div>
  );
}

export default Register;
