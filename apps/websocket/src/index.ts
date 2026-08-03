import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
    port: 3002,
});

console.log("WebSocket Server running on ws://localhost:3002");

wss.on("connection", (socket) => {
    console.log("Client connected");

    socket.send(
        JSON.stringify({
            type: "connected",
            message: "Connected to WebSocket Server",
        })
    );

    socket.on("close", () => {
        console.log("Client disconnected");
    });
});

// Broadcast server time every 10 seconds
setInterval(() => {
    const message = JSON.stringify({
        type: "time",
        time: new Date().toLocaleTimeString(),
    });

    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    });

    console.log("Sent:", message);
}, 10000);