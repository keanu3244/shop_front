// src/pages/ProductList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Search,
  DropdownMenu,
  Toast,
  Stepper,
  Popup,
  Radio,
} from "react-vant";
import request from "@/utils/request";
import styles from "./index.module.scss";

function ProductList({ user }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    { text: "所有分类", value: 0 },
    { text: "新款商品", value: 1 },
    { text: "活动商品", value: 2 },
  ]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [currentProduct, setCurrentProduct] = useState(null);
  const navigate = useNavigate();

  // 支付方式映射
  const paymentMethodMap = {
    wechat: "微信支付",
    alipay: "支付宝支付",
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productResponse = await request.get("/products");
        if (productResponse.status === "ok") {
          setProducts(productResponse.data);
          const initialQuantities = productResponse.data.reduce(
            (acc, product) => {
              acc[product.id] = 1;
              return acc;
            },
            {}
          );
          setQuantities(initialQuantities);
        } else {
          Toast.fail(productResponse.message || "获取商品列表失败");
        }

        const categoryResponse = await request.get("/categories", {});
        if (categoryResponse.status === "ok") {
          setCategories([
            { text: "所有分类", value: 0 },
            ...categoryResponse.data.map((item) => ({
              text: item.name,
              value: item.id,
            })),
          ]);
        } else {
          Toast.fail(categoryResponse.message || "获取分类失败");
        }
      } catch (error) {
        Toast.fail("加载数据失败，请稍后重试");
        console.error("加载数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    const matchesCategory =
      selectedCategory === 0 || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuantityChange = (productId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handlePurchase = (product) => {
    if (
      !product.supportedPaymentMethods ||
      product.supportedPaymentMethods.length === 0
    ) {
      Toast.fail("该商品暂不支持任何支付方式");
      return;
    }
    setCurrentProduct(product);
    setShowPaymentPopup(true);
  };

  const confirmPurchase = async () => {
    if (!selectedPaymentMethod) {
      Toast.fail("请选择支付方式");
      return;
    }

    const quantity = quantities[currentProduct.id] || 1;
    try {
      const response = await request.post("/orders", {
        productId: currentProduct.id,
        quantity,
        paymentMethod: selectedPaymentMethod,
      });
      if (response.status === "ok") {
        // Toast.success("订单创建成功");
        setShowPaymentPopup(false);
        setSelectedPaymentMethod("");
        navigate(`/orders/${response.data.orderId}`);
      } else {
        Toast.fail(response.message || "创建订单失败");
      }
    } catch (error) {
      Toast.fail("创建订单失败，请稍后重试");
      console.error("创建订单失败:", error);
    }
  };

  return (
    <div className={styles.productList}>
      <Search
        placeholder="搜索商品"
        value={searchValue}
        onChange={setSearchValue}
        className={styles.search}
      />
      <DropdownMenu
        value={selectedCategory}
        onChange={(value) => setSelectedCategory(value)}
        className={styles.dropdown}
      >
        <DropdownMenu.Item title="分类" options={categories} />
      </DropdownMenu>

      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : filteredProducts.length === 0 ? (
        <div className={styles.empty}>暂无商品</div>
      ) : (
        <div className={styles.productGrid}>
          {filteredProducts.map((product) => (
            <Card round key={product.id} className={styles.productCard}>
              <Card.Body>
                <Card.Header className={styles.cardHeader}>
                  {product.title}
                </Card.Header>
                <div className={styles.imageContainer}>
                  <img
                    src={product.imageUrl || "https://via.placeholder.com/150"}
                    alt={product.title}
                    className={styles.productImage}
                  />
                </div>
                <p className={styles.price}>
                  价格: ¥{Number(product.price).toFixed(2)}
                </p>
                <p className={styles.stock}>库存: {product.stock} 件</p>
                <div className={styles.description}>{product.description}</div>
                <div className={styles.quantity}>
                  <div style={{ width: "100%", marginBottom: "10px" }}>
                    下单数量:
                  </div>
                  <Stepper
                    value={quantities[product.id] || 1}
                    onChange={(value) =>
                      handleQuantityChange(product.id, value)
                    }
                    min={1}
                    max={product.stock}
                    className={styles.stepper}
                    disabled={product.stock === 0}
                  />
                </div>
              </Card.Body>
              {user.role === "customer" && (
                <Card.Footer className={styles.cardFooter}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handlePurchase(product)}
                    disabled={product.stock === 0}
                  >
                    购买
                  </Button>
                </Card.Footer>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* 支付类型选择弹窗 */}
      <Popup
        visible={showPaymentPopup}
        onClose={() => {
          setShowPaymentPopup(false);
          setSelectedPaymentMethod("");
        }}
        position="bottom"
        style={{ height: "40%" }}
      >
        <div style={{ padding: "10px" }} className={styles.paymentPopup}>
          <h3>选择支付方式</h3>
          <Radio.Group
            value={selectedPaymentMethod}
            onChange={setSelectedPaymentMethod}
          >
            {currentProduct?.supportedPaymentMethods?.map((method) => (
              <Radio key={method} name={method}>
                {paymentMethodMap[method] || method}
              </Radio>
            ))}
          </Radio.Group>
          <Button
            type="primary"
            block
            onClick={confirmPurchase}
            style={{ marginTop: "20px" }}
          >
            确认
          </Button>
        </div>
      </Popup>
    </div>
  );
}

export default ProductList;
