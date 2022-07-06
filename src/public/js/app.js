const socket = new WebSocket(`ws://${window.location.host}`);  

socket.addEventListener("open", () => {
    console.log("Connectd to Server!!✔");
})

socket.addEventListener("message", (message) => {
    console.log("New message : ", message.data, "from the server.");
})

socket.addEventListener("close", () => {
    console.log("Disconnected from Server 😢");
})

setTimeout(() => {
    socket.send("Hello from the Chrome ^^");
}, 5000);  // 10초 뒤에 일어나도록