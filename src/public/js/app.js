const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function backendDone(msg) {
    console.log(`Back-End says :`, msg);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    // emit method의 마지막 인자로 함수를 넣어주면 back에서 front에 실행시켜준다?
    socket.emit("enter_room", input.value, backendDone); 
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);