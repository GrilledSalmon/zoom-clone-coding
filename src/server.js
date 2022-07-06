import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public")); // public 폴더를 유저에게 공개?
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/")); // home만 사용할 거임
console.log("hello");

const handleListen = () => console.log('Listening on http://localhost:3000'); // ws://local~~ 이것도 가능   

const server = http.createServer(app);

const wss = new WebSocket.Server({ server }); // 하나의 서버에서 http와 ws을 둘 다 작동시키기 위해

server.listen(3000, handleListen)