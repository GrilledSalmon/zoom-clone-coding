const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
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
    const input = room.querySelector("input");
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
    const form = room.querySelector("form");
    form.addEventListener("submit", handleMessageSubmit)
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    // emit method의 마지막 인자로 함수를 넣어주면 back에서 front에 실행시켜준다?
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room : ${roomName}`;

    input.value = "";
}


form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", () => {
    addMessage("Someone Joined!");
});

socket.on("bye", () => {
    addMessage("Someone Left ㅠㅠ");
});

socket.on("new_message", addMessage)