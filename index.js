'use strict';

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var moment = require('moment');

var port = process.env.PORT || 3000;

var count = 0
var l = 1
var clients = {}
var events = []

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', function(socket){
  // init clicks log
  socket.emit('init', events);

  if (clients[socket.id] == undefined) {
    clients[socket.id] = socket
  }

  let noc = Object.keys(clients).length;

  console.log(noc);

  io.emit('noc', noc);

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
    io.emit('events', events)
    // console.log('click', data);
    // socket.emit('rcv', 'remote')
    // count = count + 1
    // if (count % 2 === 0) {
    //   io.emit('to-all', 'message to all')
    // }
  })

  socket.on('disconnect', function(){
    console.log('*******');
    delete clients[socket.id]
    console.log('Total clients');
    io.emit('noc', noc);
  });
});

http.listen(port, function(){
  console.log(`listening on ${port}`);
});
