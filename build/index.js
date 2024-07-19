"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = require("@vercel/postgres");
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
(0, dotenv_1.config)();
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
const client = (0, postgres_1.createClient)({
    connectionString: process.env.DATABASE_URL,
});
client.connect();
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}), express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
io.on("connection", (socket) => {
    socket.on("message-sent", (message) => {
        client.query(`INSERT INTO messages (content) VALUES ($1)`, [message], (error) => {
            if (!error)
                io.emit("message-received", message);
        });
    });
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "index.html"));
});
app.get("/api/messages", (req, res) => {
    client.query("SELECT * FROM messages", (error, response) => {
        if (error)
            res.status(500).json({ error });
        else
            res.status(200).json(response.rows);
    });
});
app.post("/api/messages", (req, res) => {
    const { content } = req.body;
    client.query(`INSERT INTO messages (content) VALUES ($1)`, [content], (error) => {
        if (error)
            res.status(500).json({ error });
        else
            res.status(200).json({ message: "Message created successfully" });
    });
});
server.listen(PORT, () => {
    console.log(`Server API is running http://localhost:${PORT}`);
});
