// src/pages/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import request from "@/utils/request";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [messages, setMessages] = useState([]); // 消息列表
  const userId = localStorage.getItem("userId");
  const room = userId ? `user_${userId}` : null;
  const messagesEndRef = useRef(null); // 用于自动滚动到底部

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 检查用户是否登录并加载历史消息
  useEffect(() => {
    if (!userId || !localStorage.getItem("token")) {
      setMessages((prev) => [
        ...prev,
        { type: "system", message: "请先登录以使用聊天功能" },
      ]);
      setConnectionStatus("unauthenticated");
      return;
    }

    // 加载消息历史
    const fetchMessages = async () => {
      try {
        const response = await request.get(`/messages/history?roomId=${room}`);
        if (response.status === "ok" && Array.isArray(response.data)) {
          const formattedMessages = response.data.map((msg) => ({
            type: "message",
            userId: msg.sender_id,
            username: msg.sender_username,
            role: msg.sender_role,
            message: msg.message,
            timestamp: msg.created_at,
            direction:
              msg.sender_id === parseInt(userId) ? "outgoing" : "incoming",
          }));
          setMessages(formattedMessages);
        } else {
          console.error("历史消息数据格式错误:", response);
          setMessages((prev) => [
            ...prev,
            { type: "system", message: "加载历史消息失败" },
          ]);
        }
      } catch (error) {
        console.error("加载消息历史失败:", error);
        setMessages((prev) => [
          ...prev,
          { type: "system", message: "加载历史消息失败，请稍后重试" },
        ]);
      }
    };

    fetchMessages();
  }, [room, userId]);

  // 初始化 Socket.IO
  useEffect(() => {
    if (!userId || !localStorage.getItem("token")) return;

    const token = localStorage.getItem("token");
    const newSocket = io("/chat", {
      query: { Authorization: `Bearer ${token}` },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setConnectionStatus("connected");
      setMessages((prev) => [
        ...prev,
        { type: "system", message: "已连接到聊天服务" },
      ]);
      newSocket.emit("joinRoom", room);
    });

    newSocket.on("connect_error", (error) => {
      setConnectionStatus("disconnected");
      console.error("Socket.IO 连接失败:", error.message);
      setMessages((prev) => [
        ...prev,
        { type: "system", message: `连接失败 - ${error.message}` },
      ]);
    });

    newSocket.on("reauthenticate", (data) => {
      setConnectionStatus("unauthenticated");
      setMessages((prev) => [
        ...prev,
        { type: "system", message: data.message },
      ]);
    });

    newSocket.on("joinedRoom", (data) => {
      setMessages((prev) => [
        ...prev,
        { type: "system", message: data.message },
      ]);
    });

    newSocket.on("receiveMessage", (message) => {
      console.log("收到消息:", message);
      setMessages((prev) => [
        ...prev,
        {
          type: "message",
          userId: message.userId,
          username: message.username,
          role: message.role,
          message: message.message,
          timestamp: message.timestamp,
          direction:
            message.userId === parseInt(userId) ? "outgoing" : "incoming",
        },
      ]);
    });

    newSocket.on("error", (error) => {
      console.error("Socket.IO 错误:", error.message);
      setMessages((prev) => [
        ...prev,
        { type: "system", message: `错误 - ${error.message}` },
      ]);
    });

    newSocket.on("disconnect", () => {
      setConnectionStatus("disconnected");
      setMessages((prev) => [
        ...prev,
        { type: "system", message: "已断开连接" },
      ]);
    });

    return () => {
      newSocket.off("connect");
      newSocket.off("connect_error");
      newSocket.off("reauthenticate");
      newSocket.off("joinedRoom");
      newSocket.off("receiveMessage");
      newSocket.off("error");
      newSocket.off("disconnect");
      newSocket.emit("leaveRoom", room);
      newSocket.close();
    };
  }, [room, userId]);

  const handleSendMessage = (textContent) => {
    if (!textContent.trim()) {
      setMessages((prev) => [
        ...prev,
        { type: "system", message: "消息内容不能为空" },
      ]);
      return;
    }

    if (!socket || connectionStatus !== "connected") {
      setMessages((prev) => [
        ...prev,
        { type: "system", message: "当前未连接，无法发送消息" },
      ]);
      return;
    }

    // 本地回显
    const newMessage = {
      type: "message",
      userId: parseInt(userId),
      username: localStorage.getItem("username") || "我",
      role: localStorage.getItem("role") || "customer",
      message: textContent,
      timestamp: new Date().toISOString(),
      direction: "outgoing",
    };
    setMessages((prev) => [...prev, newMessage]);

    // 发送消息到后端
    socket.emit(
      "sendMessage",
      { roomId: room, message: textContent },
      (response) => {
        if (response && response.status !== "ok") {
          console.error("发送消息失败:", response);
          setMessages((prev) => [
            ...prev,
            {
              type: "system",
              message: `发送消息失败 - ${response.message || "未知错误"}`,
            },
          ]);
        }
      }
    );
  };

  return (
    <div
      style={{
        position: "relative",
        height: "500px",
        width: "400px",
        margin: "20px auto",
      }}
    >
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {messages.map((msg, index) => {
              if (msg.type === "system") {
                return (
                  <Message
                    key={index}
                    model={{
                      type: "custom",
                      sender: "system",
                      position: "single",
                    }}
                  >
                    <Message.CustomContent>
                      <div style={{ textAlign: "center", color: "#888" }}>
                        {msg.message}
                      </div>
                    </Message.CustomContent>
                  </Message>
                );
              }
              return (
                <Message
                  key={index}
                  model={{
                    message: msg.message,
                    sentTime: new Date(msg.timestamp).toLocaleTimeString(),
                    sender: `${msg.username} (${msg.role})`,
                    direction: msg.direction,
                    position: "single",
                  }}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </MessageList>
          <MessageInput
            placeholder="输入消息..."
            onSend={handleSendMessage}
            attachButton={false} // 禁用附件按钮（可根据需求启用）
          />
        </ChatContainer>
      </MainContainer>
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          color:
            connectionStatus === "connected"
              ? "#52c41a"
              : connectionStatus === "unauthenticated"
              ? "#faad14"
              : "#ff4d4f",
        }}
      >
        {connectionStatus === "connected"
          ? "已连接"
          : connectionStatus === "unauthenticated"
          ? "未认证"
          : "已断开"}
      </div>
    </div>
  );
};

export default Chat;
