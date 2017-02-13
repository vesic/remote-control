'use strict';
var express = require('express')
// var app = express()

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var moment = require('moment');
var MobileDetect = require('mobile-detect');

var port = process.env.PORT || 3000;

app.use(express.static('public'))

var count = 0
var l = 1
var clients = {}
var events = []
var connectedClients = {}

let clientCount;
// let connectedClients = 0;

app.get('/', function(req, res){
  var md = new MobileDetect(req.headers['user-agent']);
  console.log(md.is('iPhone'));
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo.html'));
});

app.get('/fabric', (req, res) => {
  res.sendFile(path.join(__dirname, 'fabric.html'));
});

app.get('/demo-02', (req, res) => {
  let page = 'demo-02-server.html';
  var md = new MobileDetect(req.headers['user-agent']);
  if (md.mobile()) page = 'demo-02-client.html';
  // console.log(md.is('Phone'))
  res.sendFile(path.join(__dirname, page));
});

io.on('connection', function(socket){

  socket.on('demo:click', () => {
    console.log('click from demo!');
    io.emit('demo:click')
  })

  socket.on('rotate', event => {
    io.emit('rotation', event);
  })
  // init clicks log
  socket.emit('init', events);

  if (connectedClients[socket.id] == undefined) {
    connectedClients[socket.id] = socket
  }
  clientCount = Object.keys(connectedClients).length;

  io.emit('clientCountUpdate', clientCount);

  // for (let i in clients) {
  //   console.log(clients[i].id);
  // }
  // console.log(socket);
  // socket.id = l++;
  // clients.push(socket.id);
  // console.log(clients);
  // console.log('a user connected');

  socket.on('click', data => {
    events.push({id: socket.id, time: moment().format('MMMM Do YYYY, h:mm:ss a')})

    io.emit('events', events);
    console.log('click', events);
    // socket.emit('rcv', 'remote')
    // count = count + 1
    // if (count % 2 === 0) {
    //   io.emit('to-all', 'message to all')
    // }
  })

  socket.on('fabric:init', () => {
    console.log('fabric:init');
  })

  socket.on('rotateTriangle', function(event) {
    console.log('gamma', event);
    io.emit('rotatedTriangle', event);
  })

  /**
   * demo-02
   * 
   */
  socket.on('demo-02:conn', event => {
    console.log('demo02 connected', socket.id)

    if (clients[socket.id] == undefined) {
      clients[socket.id] = socket
    }

    let count = Object.keys(clients).length;
    io.emit('create:object', socket.id, count);
  });

  socket.on('demo-02:change', event => {
    console.log('change', event);
    io.emit('update:client', { event:event, id:socket.id });
  });

  socket.on('rotateLeft', event => {
    io.emit('handleRotateLeft', event);
  });

  socket.on('rotateRight', event => {
    io.emit('handleRotateRight', event);
  });

  socket.on('disconnect', function(){

    delete clients[socket.id];
    clientCount = Object.keys(clients).length;
    io.emit('clientCountUpdate', clientCount);

    delete connectedClients[socket.id];
    let count = Object.keys(connectedClients).length - 1;
    io.emit('destroy:object', socket.id, count);
  });
});

http.listen(port, function(){
  console.log(`listening on ${port}`);
});
