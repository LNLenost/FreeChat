const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);

const gamedirectory = path.join(__dirname, "html");

app.use(express.static(gamedirectory));
app.use(express.json()); // Per il parsing dei dati JSON

//" Configurazione di multer per l'upload di file
const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

httpserver.listen(3000);

var rooms = {};
var usernames = {};

io.on("connection", function(socket) {
  console.log("Online users right now: " + io.engine.clientsCount);

  socket.on("join", function(room, username) {
    if (username !== "") {
      if (room === "Beta Testers" && (username === "LNLenost" || username === "Emoticon")) {
        rooms[socket.id] = room;
        usernames[socket.id] = username;
        socket.leaveAll();
        socket.join(room);
        io.in(room).emit("recieve", "Server : User " + username + " joined the chatroom.");
        socket.emit("join", room);
      } else if (room !== "Beta Testers") {
        rooms[socket.id] = room;
        usernames[socket.id] = username;
        socket.leaveAll();
        socket.join(room);
        io.in(room).emit("recieve", "Server : User " + username + " joined the chatroom.");
        socket.emit("join", room);
      } else {
        socket.emit("recieve", "Server : You are not authorized to join this room.");
      }
    }
  });

  socket.on("send", function(message) {
    io.in(rooms[socket.id]).emit("recieve", usernames[socket.id] + " : " + message);
  });

  socket.on("recieve", function(message) {
    socket.emit("recieve", message);
  });

  // Gestione dell'invio di file
  socket.on("send-file", function(data) {
    const { username, filename } = data;
    const filePath = path.join(__dirname, "uploads", filename);

    fs.readFile(filePath, (err, fileData) => {
      if (err) {
        console.error(err);
      } else {
        io.in(rooms[socket.id]).emit("recieve-file", { username, filename, fileData });
      }
    });
  });
});

app.post("/submit-feedback", (req, res) => {
  const { username, feedback } = req.body;

  if (!username || !feedback) {
    return res.json({ message: "Username and feedback are required." });
  }

  const feedbackFilePath = path.join(__dirname, "feedback", `${username}.txt`);

  fs.writeFile(feedbackFilePath, feedback, (err) => {
    if (err) {
      return res.json({ message: "An error occurred while saving the feedback." });
    }
    return res.json({ message: "Feedback saved successfully." });
  });
});


