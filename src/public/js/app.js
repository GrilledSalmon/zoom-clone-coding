const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;   // 현재 위치하고 있는 방
let myPeerConnection;

async function getCameras() {
    // 사용 가능한 카메라를 camerasSelect에 담아줌
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera.label == camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        })
    } catch(e) {
        console.log(e);
    }
}

async function getMedia(deviceId) {
    const initialConstrains = {
        audio : true,
        video : {facingMode: "user"},   // 셀카 카메라로 실행 시도
    };
    const cameraConstraints = {
        audio : true,
        vedio : {deviceId : {exact : deviceId}},
    };
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstrains
        );
        myFace.srcObject = myStream; // 현재 카메라와 오디오를 브라우저와 연결
        if (!deviceId) {
            await getCameras();
        }
    } catch (e) {
        console.log(e);
    }
}

function handleMuteClick() {
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    if(muted) {
        muteBtn.innerText = "Mute";
        muted = false;
    } else {
        muteBtn.innerText = "Unmute";
        muted = true;
    }
}

function handleCameraClick() {
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    if(cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

async function handleCameraChange() {
    await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);


// Welcome Form(join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();   // addStream 역할
}

async function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("joinRoom", input.value);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);


// Socket Code

socket.on("welcome", async () => { // Peer A가 수행
    const offer = await myPeerConnection.createOffer(); // peer A의 offer
    myPeerConnection.setLocalDescription(offer);
    console.log("Sent the offer"); 
    socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {   // Peer B가 수행
    myPeerConnection.setRemoteDescription(offer); // peer의 description을 offer에 세팅?
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
})

socket.on("answer", answer => { // Peer A가 수행
    myPeerConnection.setRemoteDescription(answer);
})


// RTC Code

function makeConnection(){
    myPeerConnection = new RTCPeerConnection();
    myStream
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track, myStream)); 
}