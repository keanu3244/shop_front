// src/pages/productupload.jsx
import React, { useState, useEffect } from "react";
import { Button, Input, Cell, Uploader, Picker, Toast } from "react-vant";
import { useNavigate } from "react-router-dom";
import request from "@/utils/request";

const ProductUpload = () => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState([]);
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState(""); // 添加 description 状态
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
    if (!title || !image.length || !stock || !category || !description) {
      // 添加 description 校验
      Toast.error("请填写所有字段");
      return;
    }

    const stockNum = parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      Toast.error("库存必须为非负整数");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("image", image[0].file);
      formData.append("stock", stockNum);
      formData.append("category", category);
      formData.append("description", description); // 添加 description

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
        Toast.error(response.message || "上传失败");
      }
    } catch (error) {
      Toast.error("上传失败，请稍后重试");
      console.error("上传失败:", error);
    }
  };

  return (
    <div>
      <h2>上传商品</h2>
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
        style={{ marginTop: "10px" }}
        onClick={() => navigate("/products")}
      >
        返回
      </Button>
    </div>
  );
};

export default ProductUpload;
