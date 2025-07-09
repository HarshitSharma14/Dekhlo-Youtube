import { Server as SocketIOServer } from "socket.io";

let io, emitNotification;
const setupSocket = (server) => {
  // console.log(" context 1")
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
  });
  const userSocketMap = new Map();

  const disconnect = (socket) => {
    // console.log(`Client Disconnected : ${socket.id}`)
    for (const [channelId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(channelId);
        break;
      }
    }
  };

  emitNotification = (recieverId, notification) => {
    const recieverSocketId = userSocketMap.get(recieverId);
    if (recieverSocketId) {
      console.log(`Emitting notification to: ${recieverSocketId}`);
      io.to(recieverSocketId).emit("newNotification", notification);
    } else {
      console.log("Creator is not online, notification saved to DB only.");
    }
  };

  io.on("connect", (socket) => {
    // console.log(" context 2")
    const channelId = socket.handshake.query.channelId;
    if (channelId) {
      userSocketMap.set(channelId, socket.id);
      // console.log(`channel connected : ${channelId} with socket ID: ${socket.id}  `)
    } else {
      console.log("channel ID not provided during connection.");
    }

    socket.on("disconnect", () => disconnect(socket));
  });
};

export { setupSocket, io, emitNotification };
