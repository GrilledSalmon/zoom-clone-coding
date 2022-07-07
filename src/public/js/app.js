const socket = io();

const welcome = document.getElementById("welcome");
const enterRoom = welcome.querySelector("#enterRoom");
const nameForm = welcome.querySelector("#name");

const room = document.getElementById("room");

room.hidden = true; 

let roomName;

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You : ${input.value}`);
        input.value = "";
    });
    console.log(input.value);
}

function showRoom(msg) {
    console.log(msg);
    welcome.hidden = true;
    room.hidden = false;
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = nameForm.querySelector("input");
    socket.emit("nickname", input.value);
    input.value = "";
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = enterRoom.querySelector("input");
    // emit method의 마지막 인자로 함수를 넣어주면 back에서 front에 실행시켜준다?
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room : ${roomName}`;
    input.value = "";
}


enterRoom.addEventListener("submit", handleRoomSubmit);
nameForm.addEventListener("submit", handleNicknameSubmit);

socket.on("welcome", (user) => {
    addMessage(`${user} Arrived!`);
});

socket.on("bye", (user) => {
    addMessage(`${user} Left!`);
});

socket.on("new_message", addMessage)