// src/pages/CategoryManage.jsx
import React, { useState, useEffect } from "react";
import { Button, Input, Cell, List,Toast } from "react-vant";
import request from "@/utils/request";

const CategoryManage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  const fetchCategories = async () => {
    try {
      const response = await request.get("/categories");
      if (response.status === "ok") {
        setCategories(response.data);
      }
    } catch (error) {
      Toast.fail("获取分类失败");
    }
  };

  const handleCreate = async () => {
    if (!newCategory) {
      Toast.fail("分类名称不能为空");
      return;
    }

    try {
      const response = await request.post("/categories", { name: newCategory });
      if (response.status === "ok") {
        Toast.success("分类创建成功");
        setNewCategory("");
        fetchCategories();
      } else {
        Toast.fail(response.message || "创建失败");
      }
    } catch (error) {
      Toast.fail("创建失败，请稍后重试");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      <h2>分类管理</h2>
      <Cell title="新分类名称">
        <Input
          placeholder="请输入分类名称"
          value={newCategory}
          onChange={(val) => setNewCategory(val)}
        />
      </Cell>
      <Button type="primary" block onClick={handleCreate} style={{ marginBottom: "20px" }}>
        创建分类
      </Button>
      <List>
        {categories.map((category) => (
          <Cell key={category.id} title={category.name} />
        ))}
      </List>
    </div>
  );
};

export default CategoryManage;