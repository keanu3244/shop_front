// src/pages/MerchantChat.jsx
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import request from "@/utils/request";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  Sidebar,
  Search,
  ConversationList,
  Conversation,
  Avatar,
  ChatContainer,
  ConversationHeader,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

const MerchantChat = ({ user }) => {
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]); // 房间列表
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]); // 当前房间消息
  const [typing, setTyping] = useState(false);
  const inputRef = useRef();

  const token = localStorage.getItem("token");
  const userId = user.id;

  // 初始化 Socket.IO
  useEffect(() => {
    if (!userId || !token) return;
    const sock = io("http://127.0.0.1:7001/", {
      query: { token: `Bearer ${token}` },
      transports: ["websocket"],
      forceNew: true,
    });
    setSocket(sock);

    sock.on("connect", () => {
      console.log("Socket.IO 连接成功");
      sock.emit("connection", { roomId: activeRoom });

      // newSocket.emit("joinRoom", room);
    });

    //  newSocket.on("receiveMessage", (res) => {
    //    if (res.status == "ok" && res.data.connection && res.type == "system") {
    //      setConnectionStatus("connected");
    //      return;
    //    }
    //    const role = res.data.role;
    //    if (res.type == "message") {
    //      setMessages((prev) => [
    //        ...prev,
    //        {
    //          ...res.data,
    //          direction: role == "customer" ? "outgoing" : "incoming",
    //          type: role,
    //        },
    //      ]);
    //    }
    //  });

    sock.on("receiveMessage", ({ type, data }) => {
      setMessages((prev) => [
        ...prev,
        {
          type: data.role,
          direction: data.role === "merchant" ? "outgoing" : "incoming",
          message: data.message,
          sender: data.username,
          sentTime: new Date(data.timestamp).toLocaleTimeString(),
        },
      ]);
    });

    sock.on("typing", ({ room, userName }) => {
      if (room === activeRoom) setTyping(true);
    });
    sock.on("stopTyping", ({ room }) => {
      if (room === activeRoom) setTyping(false);
    });

    return () => sock.close();
  }, [userId, token, activeRoom]);

  // 拉取房间列表
  useEffect(() => {
    request
      .get("/rooms")
      .then((res) => {
        console.log(res, "kkkk");
        if (res.status === "ok") {
          setRooms(res.data);
        }
      })
      .catch(console.error);
  }, [token]);

  // 切换房间时加载历史消息
  useEffect(() => {
    if (!activeRoom) return;
    request
      .get(`/messages/history?roomId=${activeRoom}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.status === "ok") {
          setMessages(
            res.data.map((msg) => ({
              direction: msg.role === "merchant" ? "outgoing" : "incoming",
              message: msg.message,
              sender: msg.sender_username,
              sentTime: new Date(msg.created_at).toLocaleTimeString(),
            }))
          );
        }
      })
      .catch(console.error);
  }, [activeRoom, token]);

  // 发送消息
  const handleSend = (text) => {
    if (!socket || !activeRoom) return;
    const payload = {
      room: activeRoom,
      message: text,
      role: "merchant",
      username: "商家",
      timestamp: new Date().toISOString(),
    };
    // 本地回显
    setMessages((prev) => [
      ...prev,
      {
        direction: "outgoing",
        message: text,
        sender: "商家",
        sentTime: new Date().toLocaleTimeString(),
      },
    ]);
    socket.emit("sendMessage", { msg: text, roomId: activeRoom });
  };

  // 输入时通知对方
  const handleTyping = () => {
    if (socket && activeRoom) {
      socket.emit("typing", { room: activeRoom, userName: "商家" });
      clearTimeout(inputRef.current);
      inputRef.current = setTimeout(() => {
        socket.emit("stopTyping", { room: activeRoom });
      }, 1000);
    }
  };

  return (
    <MainContainer responsive style={{ height: "600px" }}>
      {/* 左侧：会话列表 */}
      <Sidebar position="left">
        <Search placeholder="搜索房间..." />
        <ConversationList>
          {rooms.map((room) => (
            <Conversation
              key={room.room_id}
              name={room.room_id}
              active={room.room_id === activeRoom}
              onClick={() => setActiveRoom(room.room_id)}
            >
              <Avatar
                name="Akane"
                src="https://chatscope.io/storybook/react/assets/akane-MXhWvx63.svg"
                status="eager"
              />
            </Conversation>
          ))}
        </ConversationList>
      </Sidebar>

      {/* 右侧：聊天窗口 */}
      <ChatContainer>
        <ConversationHeader>
          <ConversationHeader.Back onClick={() => setActiveRoom(null)} />
          {/* <Avatar name={activeRoom} /> */}
          <ConversationHeader.Content
            userName={activeRoom || "请选择房间"}
            // info={activeRoom ? `在线` : ""}
          />
        </ConversationHeader>

        <MessageList
          typingIndicator={
            typing && <TypingIndicator content="对方正在输入..." />
          }
        >
          {messages.map((msg, idx) => (
            <Message
              key={idx}
              model={{
                direction: msg.direction,
                message: msg.message,
                sender: msg.sender,
                sentTime: msg.sentTime,
              }}
            />
          ))}
        </MessageList>

        {activeRoom && (
          <MessageInput
            placeholder="输入消息..."
            onSend={handleSend}
            onChange={handleTyping}
          />
        )}
      </ChatContainer>
    </MainContainer>
  );
};

export default MerchantChat;
