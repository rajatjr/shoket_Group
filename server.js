const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Serve the static files
app.use(express.static(__dirname + '/public'));

// Store connected users
const connectedUsers = {};

// Socket.io logic
io.on('connection', (socket) => {
  console.log('A user connected');

  //  user login
  socket.on('login', (username) => {
    console.log(`User ${username} logged in`);
    connectedUsers[username] = socket.id;
    io.emit('user-list', Object.keys(connectedUsers));
  });

  //  joining a group
  socket.on('join-group', ({group, username}) => {
    socket.join(group);
    console.log(`User ${username} joined group ${group}`);
  });

  //  leaving a group
  socket.on('leave-group', ({group, username}) => {
    socket.leave(group);
    console.log(`User ${username} left group ${group}`);
  });

  // sending messages to a group
  socket.on('send-message', (data) => {
    const { group, senderName, sender, message } = data;
    io.to(group).emit('receive-message', {
      sender,
      message,
      senderName
    });
  });

  //  user disconnection
  socket.on('disconnect', () => {
    const disconnectedUser = Object.keys(connectedUsers).find(
      (username) => connectedUsers[username] === socket.id
    );

    if (disconnectedUser) {
      console.log(`User ${disconnectedUser} disconnected`);
      delete connectedUsers[disconnectedUser];
      io.emit('user-list', Object.keys(connectedUsers));
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
