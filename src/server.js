const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const index = fs.readFileSync(`${__dirname}/../client/index.html`);

const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(PORT);

console.log(`Listening on 127:0.0.1: ${PORT}`);

// pass http server to socketio & grab websocket server as io
const io = socketio(app);

// obj holds all connected users
// const users = {};// not sure i need this

const onJoined = (sock) => {
  const socket = sock;
  socket.on('join', () => {
    socket.join('room1');
  });
};

const serverFroggo = {
    froggoSize: 1.0,
    green: 50,
    message: 'froggo is',
  };

const onUpdate = (sock) => {
  const socket = sock;

  

  socket.on('updateToServer', (data) => {
    //console.log('in updateToServer');
    //console.dir(data);
    console.dir(serverFroggo);

    serverFroggo.froggoSize += data.incrementSize;
    serverFroggo.green += data.incrementGreen;
    if (serverFroggo.green >= 255) {
      serverFroggo.green = 50;
    }// it's not easy being green

    io.sockets.in('room1').emit('update', serverFroggo);
    // socket.emit('update', serverFroggo);// calls updateLocal on client side
  });
  socket.on('clear', () => {
    console.log('clear called');
    serverFroggo.froggoSize = 1.0;

    io.sockets.in('room1').emit('update', serverFroggo);
    // socket.emit('update', serverFroggo);
  });
};


const onDisconnect = (sock) => {
  const socket = sock;// not sure why this is like this :/

  socket.on('disconnect', () => {
    socket.leave('room1');
  });
};


io.sockets.on('connection', (socket) => {
  onJoined(socket);
  onUpdate(socket);
  onDisconnect(socket);
});

console.log('Websocket server started');
