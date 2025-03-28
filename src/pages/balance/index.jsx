// src/pages/Balance.jsx
import React from "react";
import { Cell, Button } from "react-vant";

const Balance = () => {
  return (
    <div>
      <h2>账户余额</h2>
      <Cell title="当前余额" value="￥1000.00" />
      <div style={{ marginTop: "20px" }}>
        <Button type="primary" style={{ marginRight: "10px" }}>
          充值
        </Button>
        <Button type="default">提现</Button>
      </div>
    </div>
  );
};

export default Balance;
