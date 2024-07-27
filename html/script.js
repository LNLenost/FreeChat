var socket;
var usernameInput;
var roomSelect;
var messageInput;
var chatRoom;
var dingSound;
var messages = [];
var delay = true;

function onload() {
  socket = io();
  usernameInput = document.getElementById("NameInput");
  roomSelect = document.getElementById("RoomSelect");
  messageInput = document.getElementById("ComposedMessage");
  chatRoom = document.getElementById("RoomID");
  dingSound = document.getElementById("Ding");

  socket.on("join", function (room) {
    chatRoom.innerHTML = "Your Room: " + room;
  });

  socket.on("recieve", function (message) {
    console.log(message);
    if (messages.length < 9) {
      messages.push(message);
      dingSound.currentTime = 0;
      dingSound.play();
    } else {
      messages.shift();
      messages.push(message);
    }
    for (i = 0; i < messages.length; i++) {
      document.getElementById("Message" + i).innerHTML = messages[i];
      document.getElementById("Message" + i).style.color = "#303030";
    }
  });
}

function Connect() {
  var selectedRoom = roomSelect.value;
  socket.emit("join", selectedRoom, usernameInput.value);
}

function Send() {
  if (delay && messageInput.value.replace(/\s/g, "") != "") {
    delay = false;
    setTimeout(delayReset, 1000);
    socket.emit("send", messageInput.value);
    messageInput.value = "";
  }
}

// ... (il resto del tuo script)

function EnableDarkTheme() {
  document.body.style.backgroundColor = "#303030";
  document.body.style.color = "#FFFFFF";
}

function EnableLightTheme() {
  document.body.style.backgroundColor = "#FFFFFF";
  document.body.style.color = "#303030";
}

function delayReset() {
  delay = true;
}
// ... (resto del tuo script)

function ShowFeedbackForm() {
  var feedbackForm = document.getElementById("FeedbackForm");
  feedbackForm.style.display = "block";
}

function SubmitFeedback() {
  var feedbackTextArea = document.getElementById("FeedbackTextArea");
  var feedback = feedbackTextArea.value;
  var usernameInput = document.getElementById("NameInput");
  var username = usernameInput.value;

  // Chiamata AJAX per inviare il feedback al server
  fetch('/submit-feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: username, feedback: feedback })
  })
  .then(response => response.json())
  .then(data => {
    console.log(data.message);
  });

  var feedbackForm = document.getElementById("FeedbackForm");
  feedbackForm.style.display = "none";
}
