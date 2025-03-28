import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-vant";
function Home({ user }) {
  const navigate = useNavigate();

  return (
    <>
      <p>你的角色是：{user.role === "merchant" ? "商家" : "客户"}</p>
      <Button type="primary" block onClick={() => navigate("/products")}>
        查看商品
      </Button>
      {user.role === "merchant" && (
        <Button type="primary" block onClick={() => navigate("/upload")}>
          上传商品
        </Button>
      )}
      <Button type="primary" block onClick={() => navigate("/orders")}>
        查看订单
      </Button>
    </>
  );
}

export default Home;
