import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // 导入 useLocation
import { Button, Card, Popup, RadioGroup, Radio } from "react-vant";
import axios from "axios"; // 用于通过 productId 获取商品数据

function OrderList({ user = { role: "customer", username: "defaultUser" } }) {
  const location = useLocation(); // 使用 useLocation 获取 location
  const [orders, setOrders] = useState([]);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("usdt");
  const [currentProduct, setCurrentProduct] = useState(null);

  useEffect(() => {
    // 调试 location.state
    console.log("location.state:", location.state);

    // 优先从 location.state 获取购买的商品
    if (location.state?.product && user.role === "customer") {
      setCurrentProduct(location.state.product);
      setShowPaymentPopup(true);
    } else {
      // 如果 location.state 没有数据，从 localStorage 获取
      const pendingProduct = JSON.parse(localStorage.getItem("pendingProduct"));
      if (pendingProduct && user.role === "customer") {
        setCurrentProduct(pendingProduct);
        setShowPaymentPopup(true);
        // 清除临时存储
        localStorage.removeItem("pendingProduct");
      }
    }

    // 从 localStorage 加载订单
    const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(storedOrders);
  }, [location, user.role]); // 依赖 location 而不是 location.state

  const handlePayment = () => {
    if (!currentProduct) {
      alert("未选择商品，无法支付");
      return;
    }

    // 模拟支付
    const newOrder = {
      id: Date.now(),
      product: currentProduct,
      paymentMethod,
      status: "待发货",
      user: user.username,
      role: user.role,
    };
    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    setShowPaymentPopup(false);
    setCurrentProduct(null); // 清空当前商品
    alert("支付成功，等待商家发货");
  };

  const handleShip = (orderId, auto = false) => {
    // 手动或自动发货，生成虚拟商品兑换码
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          status: "已发货",
          redeemCode: auto
            ? `CODE-${Math.random()
                .toString(36)
                .substring(2, 10)
                .toUpperCase()}`
            : `CODE-${Math.random()
                .toString(36)
                .substring(2, 10)
                .toUpperCase()}`,
        };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    alert(auto ? "自动发货成功" : "手动发货成功");
  };

  const userOrders = orders.filter((order) => order.user === user.username);

  return (
    <div>
      <h2>订单列表</h2>
      {userOrders.length === 0 ? (
        <p>暂无订单</p>
      ) : (
        userOrders.map((order) => (
          <Card key={order.id} style={{ marginBottom: "10px" }}>
            <div style={{ padding: 10 }}>
              <h3>{order.product.title}</h3>
              <p>价格: ${order.product.price}</p>
              <p>支付方式: {order.paymentMethod}</p>
              <p>状态: {order.status}</p>
              {order.status === "已发货" && <p>兑换码: {order.redeemCode}</p>}
              {user.role === "merchant" && order.status === "待发货" && (
                <div style={{ marginTop: 10 }}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleShip(order.id, false)}
                    style={{ marginRight: 10 }}
                  >
                    手动发货
                  </Button>
                  <Button
                    type="default"
                    size="small"
                    onClick={() => handleShip(order.id, true)}
                  >
                    自动发货
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))
      )}

      <Popup
        visible={showPaymentPopup}
        onClose={() => {
          setShowPaymentPopup(false);
          setCurrentProduct(null); // 关闭弹窗时清空当前商品
        }}
      >
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h3>选择支付方式</h3>
          <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
            <Radio name="usdt">USDT</Radio>
            <Radio name="alipay">支付宝</Radio>
            <Radio name="wechat">微信支付</Radio>
          </RadioGroup>
          <Button
            type="primary"
            block
            onClick={handlePayment}
            style={{ marginTop: "10px" }}
          >
            确认支付
          </Button>
        </div>
      </Popup>
    </div>
  );
}

export default OrderList;
