import http from "http";
import SocketIO from "socket.io";
import express from "express";
import { doesNotThrow } from "assert";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public")); // public 폴더를 유저에게 공개?
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/")); // home만 사용할 거임

const handleListen = () => console.log('Listening on http://localhost:8000');

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", socket => {
    socket.on("joinRoom", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    })
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    })
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    })
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    })
})

httpServer.listen(8000, handleListen);