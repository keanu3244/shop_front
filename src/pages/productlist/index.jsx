import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Search, DropdownMenu, Tag } from "react-vant";
import axios from "axios";
import request from "@/utils/request";

function ProductList({ user }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    { text: "全部商品", value: 0 },
    { text: "新款商品", value: 1 },
    { text: "活动商品", value: 2 },
  ]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("所有分类");
  const navigate = useNavigate();

  useEffect(() => {
    // 获取商品列表
    request.get("/products").then((res) => {
      setProducts(res.data);
    });
    // 获取分类
    request.get("/categories").then((res) => {
      setCategories([
        { text: "所有分类", value: 0 },
        ...res.data.map((item) => {
          return {
            text: item.name,
            value: item.id,
          };
        }),
      ]);
    });
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    const matchesCategory =
      selectedCategory === "所有分类" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePurchase = (product) => {
    console.log("prod", product);
    // 跳转到支付页面（这里简化，直接模拟支付）
    navigate("/orders", { state: { product } });
  };

  return (
    <div>
      <Search
        placeholder="搜索商品"
        value={searchValue}
        onChange={setSearchValue}
      />
      <DropdownMenu onChange={setSelectedCategory}>
        <DropdownMenu.Item options={categories}></DropdownMenu.Item>
      </DropdownMenu>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
          marginTop: "10px",
        }}
      >
        {filteredProducts.map((product) => (
          <Card
            round
            key={product.id}
            style={{ width: "45%", marginBottom: "10px" }}
          >
            <Card.Body>
              <Card.Header>{product.title}</Card.Header>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  style={{
                    height: "150px",
                    objectFit: "cover",
                  }}
                />
              </div>
              <p style={{ textAlign: "center" }}>价格: ${product.price}</p>
              <div
                style={{
                  height: "30px",
                  backgroundColor: "#f5f5f5",
                  marginBottom: "10px",
                  padding: "5px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center", // 添加 text-align: center
                }}
              >
                {product.description}
              </div>
              <div
                style={{
                  height: "30px",
                  backgroundColor: "#f5f5f5",
                  marginBottom: "10px",
                  padding: "5px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center", // 添加 text-align: center
                }}
              >
                {product.category}
              </div>
            </Card.Body>
            {user.role === "customer" && (
              <Card.Footer
                style={{ display: "flex", justifyContent: "center" }}
              >
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handlePurchase(product)}
                >
                  购买
                </Button>
              </Card.Footer>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
