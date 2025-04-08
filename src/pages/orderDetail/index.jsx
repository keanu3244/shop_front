// src/pages/OrderDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Cell, Button, Toast, Popup } from "react-vant";
import request from "@/utils/request";
import styles from "./index.module.scss";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  // const [product, setProduct] = useState(null);
  const [remainingTime, setRemainingTime] = useState("");
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await request.get(`/orders/${orderId}`);
        if (response.status === "ok") {
          setOrder(response.data);
          // const productResponse = await request.get(
          //   `/products/${response.data.product_id}`
          // );
          // if (productResponse.status === "ok") {
          //   setProduct(productResponse.data);
          // }
        } else {
          Toast.fail(response.message || "获取订单失败");
        }
      } catch (error) {
        Toast.fail("获取订单失败，请稍后重试");
        console.error("获取订单失败:", error);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!order || order.status !== "pending") return;

    const updateRemainingTime = () => {
      const now = new Date();
      const deadline = new Date(order.payment_deadline);
      const diff = deadline - now;

      if (diff <= 0) {
        setRemainingTime("00:00");
        request.post(`/orders/${orderId}/cancel`).then(() => {
          setOrder({ ...order, status: "cancelled" });
          Toast.info("订单已超时，自动取消");
          navigate("/products"); // 超时后跳转回商品列表
        });
        return;
      }

      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setRemainingTime(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    };

    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(timer);
  }, [order, orderId, navigate]);

  const handleCancel = async () => {
    try {
      const response = await request.post(`/orders/${orderId}/cancel`);
      if (response.status === "ok") {
        Toast.success("订单已取消");
        setOrder({ ...order, status: "cancelled" });
        navigate("/products"); // 取消后跳转回商品列表
      } else {
        Toast.fail(response.message || "取消订单失败");
      }
    } catch (error) {
      Toast.fail("取消订单失败，请稍后重试");
      console.error("取消订单失败:", error);
    }
  };

  const handleContactSupport = () => {
    document.querySelector(".rw-launcher").click();
  };

  const handleConfirmPayment = async () => {
    try {
      const response = await request.post(`/orders/${orderId}/confirm`);
      if (response.status === "ok") {
        Toast.success("已确认付款，等待商家发货");
        setOrder({ ...order, status: "paid" });
        setShowPaymentDetails(false);
      } else {
        Toast.fail(response.message || "确认付款失败");
      }
    } catch (error) {
      Toast.fail("确认付款失败，请稍后重试");
      console.error("确认付款失败:", error);
    }
  };

  if (!order) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>加载中...</div>
    );
  }
  const merchantPaymentInfo = order.merchant_payment_info
    ? order.merchant_payment_info
    : {};

  return (
    <div
      className={styles.orderDetail}
      style={{ padding: "20px", minHeight: "100vh", background: "#f5f5f5" }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        订单已生成，请尽快付款
      </h2>
      <p style={{ textAlign: "center", color: "#ff4d4f", fontSize: "16px" }}>
        付款剩余时间：{remainingTime}
      </p>

      <div
        className={styles.section}
        style={{
          background: "#fff",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>
          1 提供以下信息
        </h3>
        <Cell title="支付金额" value={`¥${order.total_price}`} />
        <Cell title="姓名" value={merchantPaymentInfo.name || "未知"} />
        <Cell
          title="微信账号"
          value={merchantPaymentInfo.wechat_account || "未知"}
        />
        <Cell title="订单号" value={order.id} />
        <p
          className={styles.note}
          style={{ color: "#999", fontSize: "12px", marginTop: "10px" }}
        >
          温馨提示：请确保你所用微信与平安金安支付宝一致，否则将导致交易失败
          权方式。请不要使用支付宝直接转账付款，否则将导致订单付款失败
          失败的收款端已并被转被冻结。发起客诉
        </p>
      </div>

      <div
        className={styles.section}
        style={{
          background: "#fff",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>
          2 点击“转账支付”选项菜单
        </h3>
        <Button
          type="primary"
          block
          onClick={() => setShowPaymentDetails(true)}
          disabled={order.status !== "pending"}
        >
          我已支付
        </Button>
        <Button
          type="default"
          block
          onClick={handleContactSupport}
          style={{ marginTop: "10px" }}
        >
          不知道如何支付？
        </Button>
      </div>

      <Button
        type="danger"
        block
        onClick={handleCancel}
        disabled={order.status !== "pending"}
        style={{ marginTop: "20px" }}
      >
        取消订单
      </Button>

      <Popup
        visible={showPaymentDetails}
        onClose={() => setShowPaymentDetails(false)}
        position="bottom"
        style={{ height: "50%" }}
      >
        <div className={styles.paymentDetails} style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>确认付款</h3>
          <p style={{ color: "#999", fontSize: "12px", marginBottom: "10px" }}>
            客诉本转账账户点击“确认”，您的账户可能会由于涉及 操控恶操作而被冻结
          </p>
          <Cell title={`我已通过微信支付 向对方转账 ¥${order.total_price}`} />
          <Button type="primary" block onClick={handleConfirmPayment}>
            确认
          </Button>
        </div>
      </Popup>
    </div>
  );
};

export default OrderDetail;
