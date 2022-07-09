const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const h2MyHP = document.getElementById("myHP");
const h2PeerHP = document.getElementById("peerHP");

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
        console.log(()=>1);
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
        /** 이 사이에 모델을 넣으면 될듯? */
        faceapi.nets.tinyFaceDetector.loadFromUri('/public/models')
        faceapi.nets.faceExpressionNet.loadFromUri('/public/models')
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
    if(myPeerConnection) { // 카메라가 바뀌는 경우 peer에도 업데이트
        const videoTrack = myStream.getVideoTracks()[0]; // 새로 바뀐 트랙을 받아옴
        const videoSender = myPeerConnection
            .getSenders()
            .find(sender => sender.track.kind === "video"); // 잘 이해 안감;;
        videoSender.replaceTrack(videoTrack); // 업데이트
    }
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
    console.log("Recieved the offer");
    myPeerConnection.setRemoteDescription(offer); // peer의 description을 offer에 세팅?
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("Sent the answer");
})

socket.on("answer", answer => { // Peer A가 수행
    console.log("Recieved the answer");
    myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice", ice => {
    console.log("Recieved candidate");
    myPeerConnection.addIceCandidate(ice);
})

socket.on("smile", peerHp => {
    h2PeerHP.innerText = `Peer HP : ${peerHp}`;
})


// RTC Code

function makeConnection(){
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ]
            }
        ]
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track, myStream)); 
}

function handleIce(data) {
    console.log("Sent candidate");
    socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
    const peersStream = document.getElementById("peerFace");
    console.log("Got a Stream form my peer!!");
    peersStream.srcObject = data.stream;
}

let HP = 100

myFace.addEventListener('play', () => { // 이 함수는 한 번만 실행
    const canvas = faceapi.createCanvasFromMedia(myFace)
    document.body.append(canvas)
    const displaySize = { width: myFace.width, height: myFace.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => { // 이 함수는 N[ms]마다 실행
      const detections = await faceapi.detectAllFaces(myFace, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions() // 모든 얼굴 감지 -> detectSingleFace 사용 고려해보기
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height) // 그렸던 내용을 지워준다고 함.
      faceapi.draw.drawDetections(canvas, resizedDetections)
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
      if (detections[0] && HP > 0) {
        let happiness = detections[0].expressions.happy
        socket.emit("smile", HP, roomName);
        if (happiness > 0.6) { // 민감도로 하드모드, 이지모드 설정도 가능할듯
          HP -= 1;
        } else if (happiness > 0.2) {
          HP -= 0.5;
        }
      }
      if (HP > 0) {
        console.log("HP :", HP);
      } else {
        console.log("Game Over!!");
      }
      h2MyHP.innerText = `My HP : ${HP}`;
    }, 100) // 마지막 인자로 얼굴 인식 주기 설정(ms)
  })

