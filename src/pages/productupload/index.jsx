// src/pages/productupload.jsx
import React, { useState, useEffect } from "react";
import { Button, Input, Cell, Uploader, Picker, Toast } from "react-vant";
import { useNavigate } from "react-router-dom";
import request from "@/utils/request";
import styles from "./index.module.scss";

const ProductUpload = () => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState([]);
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("开始获取分类列表");
        const response = await request.get("/categories");
        console.log("分类列表响应:", response);
        if (response.status === "ok") {
          const categoryOptions = response.data.map((cat) => ({
            text: cat.name,
            value: cat.name,
          }));
          setCategories(categoryOptions);
        } else {
          Toast.fail(response.message || "获取分类失败");
        }
      } catch (error) {
        Toast.fail("获取分类失败，请稍后重试");
        console.error("获取分类失败:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleUpload = async () => {
    if (
      !title ||
      !image.length ||
      !stock ||
      !category ||
      !description ||
      !price
    ) {
      Toast.fail("请填写所有字段");
      return;
    }

    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      Toast.fail("库存必须为非负整数");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      Toast.fail("价格必须为非负数");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("image", image[0].file);
      formData.append("stock", stockNum);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("price", priceNum);

      console.log("开始上传商品，formData:", formData);
      const response = await request.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("商品上传响应:", response);

      if (response.status === "ok") {
        Toast.success("商品上传成功");
        navigate("/products");
      } else {
        Toast.fail(response.message || "上传失败");
      }
    } catch (error) {
      Toast.fail("上传失败，请稍后重试");
      console.error("上传失败:", error);
    }
  };

  return (
    <>
      <div className={styles.form}>
        <Cell title="商品标题">
          <Input
            placeholder="请输入商品标题"
            value={title}
            onChange={(val) => setTitle(val)}
          />
        </Cell>
        <Cell title="商品图片">
          <Uploader
            value={image}
            onChange={(files) => setImage(files)}
            maxCount={1}
            accept="image/*"
            previewSize={80}
            deletable
          />
        </Cell>
        <Cell title="库存数量">
          <Input
            type="number"
            placeholder="请输入库存数量"
            value={stock}
            onChange={(val) => setStock(val)}
          />
        </Cell>
        <Cell title="商品分类">
          <Picker
            columns={categories}
            value={category}
            onChange={(val) => setCategory(val)}
            placeholder="请选择分类"
          />
        </Cell>
        <Cell title="商品描述">
          <Input.TextArea
            placeholder="请输入商品描述"
            value={description}
            onChange={(val) => setDescription(val)}
            rows={4}
            autosize
          />
        </Cell>
        <Cell title="商品价格">
          <Input
            type="number"
            placeholder="请输入商品价格"
            value={price}
            onChange={(val) => setPrice(val)}
          />
        </Cell>
        <Button
          type="primary"
          block
          onClick={handleUpload}
          style={{ marginTop: "20px" }}
        >
          上传
        </Button>
        <Button
          type="default"
          block
          style={{ marginTop: "10px", marginBottom: "20px" }}
          onClick={() => navigate("/products")}
        >
          返回
        </Button>
      </div>
    </>
  );
};

export default ProductUpload;
