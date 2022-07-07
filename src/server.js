import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public")); // public 폴더를 유저에게 공개?
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/")); // home만 사용할 거임

const handleListen = () => console.log('Listening on http://localhost:8000');

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
    socket.on("enter_room", (roomName, done) => {
        console.log(roomName);
        setTimeout(() => {
            done("Hello from the Back-End");
        }, 10000);
    });
})

// const wss = new WebSocket.Server({ server }); // 하나의 서버에서 http와 ws을 둘 다 작동시키기 위해

// const sockets = [];

// wss.on("connection", (socket) => {  // 연결된 socket에 대해 아래의 동일한 코드를 실행시켜줌
//     sockets.push(socket);
//     socket["nickname"] = "Anonymous";
//     console.log("Connectd to Browser!!✔");
//     socket.on("close", () => console.log("Disconnected from the Browser..."));
//     socket.on("message", (msg) => {
//         console.log(msg.toString('utf-8'));
//         const message = JSON.parse(msg.toString('utf-8'));
//         switch (message.type) {
//             case "new_message":
//                 sockets.forEach((aSocket) => 
//                     aSocket.send(`${socket.nickname} : ${message.payload}`)
//                 );
//                 break;
//             case "nickname":
//                 socket["nickname"] = message.payload;
//                 break;
//         }
//     });
// });

httpServer.listen(8000, handleListen);