const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
    const msg = {type, payload};
    return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
    console.log("Connectd to Server!!✔");
})

socket.addEventListener("message", (message) => {
    console.log("New message : ", message.data, "from the server.");
})

socket.addEventListener("close", () => {
    console.log("Disconnected from Server 😢");
})

// setTimeout(() => {
//     socket.send("Hello from the Chrome ^^");
// }, 5000);  // 10초 뒤에 일어나도록


function handleSubmit(event) {
    event.preventDefault(); // submit event가 일어났을 때 기본적으로 발생하는 이벤트(reload)를 막아주는듯
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    const li = document.createElement("li");
    li.innerText = `You : ${input.value}`;
    messageList.append(li);
    input.value = "";
}

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "Created!";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);