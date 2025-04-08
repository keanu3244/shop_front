// src/pages/MerchantSettings.jsx
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Toast, Divider, Uploader } from "react-vant";
import request from "@/utils/request";
import styles from "./index.module.scss";

const MerchantSettings = ({ user }) => {
  const [alipayForm] = Form.useForm();
  const [wechatForm] = Form.useForm();
  const [alipayInitialValues, setAlipayInitialValues] = useState({});
  const [wechatInitialValues, setWechatInitialValues] = useState({});
  const [alipayQrCode, setAlipayQrCode] = useState([]); // 支付宝二维码文件列表
  const [wechatQrCode, setWechatQrCode] = useState([]); // 微信二维码文件列表

  // 初始化表单值
  useEffect(() => {
    // 从 localStorage 获取 user 对象
    const storedUser = localStorage.getItem("user");
    let paymentInfo = {};

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      paymentInfo = parsedUser.paymentInfo || {}; // 统一使用 payment_info
    } else {
      // 如果 localStorage 中没有 user，回退到 props.user
      paymentInfo = user?.payment_info || {};
    }
    console.log("paymentInfo", paymentInfo);

    // 初始化表单值
    const alipayValues = {
      name: paymentInfo.alipay?.name || "",
      account: paymentInfo.alipay?.account || "",
    };
    const wechatValues = {
      name: paymentInfo.wechat?.name || "",
      account: paymentInfo.wechat?.account || "",
    };

    // 设置状态
    setAlipayInitialValues(alipayValues);
    setWechatInitialValues(wechatValues);

    // 手动更新表单字段值
    alipayForm.setFieldsValue(alipayValues);
    wechatForm.setFieldsValue(wechatValues);

    // 初始化二维码状态
    if (paymentInfo.alipay?.qrcode) {
      setAlipayQrCode([{ url: paymentInfo.alipay.qrcode }]);
    }
    if (paymentInfo.wechat?.qrcode) {
      setWechatQrCode([{ url: paymentInfo.wechat.qrcode }]);
    }
  }, [user, alipayForm, wechatForm]); // 依赖 user, setUser, alipayForm, wechatForm

  // 上传文件到后端
  const upload = async (file, type) => {
    console.log("file", file);
    const formData = new FormData();
    formData.append("file", file);
    console.log("formData", formData.entries());
    // 传递旧图片 URL，以便后端删除
    const oldFileUrl =
      type === "alipay"
        ? alipayQrCode[0]?.url || ""
        : wechatQrCode[0]?.url || "";
    formData.append("oldFileUrl", oldFileUrl);

    try {
      const response = await request.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === "ok") {
        return { url: response.data.url };
      } else {
        Toast.fail(response.message || "上传失败");
        return false;
      }
    } catch (error) {
      Toast.fail("上传失败，请稍后重试");
      console.error("文件上传失败:", error);
      return false;
    }
  };

  const onAlipayFinish = async (values) => {
    try {
      const currentPaymentInfo = user.payment_info || {};
      const paymentInfo = {
        ...currentPaymentInfo,
        alipay: {
          name: values.name,
          account: values.account,
          qrcode: alipayQrCode[0]?.url || "", // 保存二维码 URL
        },
      };

      const updateResponse = await request.post("/user/payment-info", {
        paymentInfo,
      });
      if (updateResponse.status === "ok") {
        Toast.success("支付宝收款信息更新成功");
        // 更新 localStorage 中的 user 对象的 paymentInfo
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.payment_info = paymentInfo;
          localStorage.setItem("user", JSON.stringify(parsedUser));
        }
      } else {
        Toast.fail(updateResponse.message || "更新支付宝收款信息失败");
      }
    } catch (error) {
      Toast.fail("更新支付宝收款信息失败，请稍后重试");
      console.error("更新支付宝收款信息失败:", error);
    }
  };

  const onWechatFinish = async (values) => {
    try {
      const currentPaymentInfo = user.payment_info || {};
      const paymentInfo = {
        ...currentPaymentInfo,
        wechat: {
          name: values.name,
          account: values.account,
          qrcode: wechatQrCode[0]?.url || "", // 保存二维码 URL
        },
      };

      const updateResponse = await request.post("/user/payment-info", {
        paymentInfo,
      });
      if (updateResponse.status === "ok") {
        Toast.success("微信收款信息更新成功");
        // 更新 localStorage 中的 user 对象的 paymentInfo
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.payment_info = paymentInfo;
          localStorage.setItem("user", JSON.stringify(parsedUser));
        }
      } else {
        Toast.fail(updateResponse.message || "更新微信收款信息失败");
      }
    } catch (error) {
      Toast.fail("更新微信收款信息失败，请稍后重试");
      console.error("更新微信收款信息失败:", error);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>加载中...</div>
    );
  }

  if (user.role !== "merchant") {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>无权限访问</div>
    );
  }

  return (
    <div
      className={styles.merchantSettings}
      style={{ padding: "0 20px 20px 20px" }}
    >
      <h3 style={{ fontSize: "16px", margin: "10px 0" }}>支付宝收款信息</h3>
      <Form
        form={alipayForm}
        initialValues={alipayInitialValues}
        onFinish={onAlipayFinish}
        footer={
          <Button type="primary" block nativeType="submit">
            保存支付宝信息
          </Button>
        }
      >
        <Form.Item
          name="name"
          label="姓名"
          rules={[{ required: true, message: "请输入姓名" }]}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item
          name="account"
          label="支付宝账号"
          rules={[{ required: true, message: "请输入支付宝账号" }]}
        >
          <Input placeholder="请输入支付宝账号" />
        </Form.Item>
        <Form.Item label="支付宝收款二维码">
          <Uploader
            value={alipayQrCode}
            onChange={(files) => {
              // 直接覆盖旧图片
              setAlipayQrCode(files);
            }}
            upload={(file) => upload(file, "alipay")}
            maxCount={1} // 限制只上传一张图片
            previewImage // 启用图片预览
            accept="image/*"
          />
        </Form.Item>
      </Form>

      <Divider style={{ margin: "10px 0" }} />

      <h3 style={{ fontSize: "16px", margin: "10px 0" }}>微信收款信息</h3>
      <Form
        form={wechatForm}
        initialValues={wechatInitialValues}
        onFinish={onWechatFinish}
        footer={
          <Button type="primary" block nativeType="submit">
            保存微信信息
          </Button>
        }
      >
        <Form.Item
          name="name"
          label="微信昵称"
          rules={[{ required: true, message: "请输入微信昵称" }]}
        >
          <Input placeholder="请输入昵称" />
        </Form.Item>
        <Form.Item
          name="account"
          label="微信账号"
          rules={[{ required: true, message: "请输入微信账号" }]}
        >
          <Input placeholder="请输入微信账号" />
        </Form.Item>
        <Form.Item label="微信收款二维码">
          <Uploader
            value={wechatQrCode}
            onChange={(files) => {
              // 直接覆盖旧图片
              setWechatQrCode(files);
            }}
            upload={(file) => upload(file, "wechat")}
            maxCount={1}
            accept="image/*"
            previewImage
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default MerchantSettings;
