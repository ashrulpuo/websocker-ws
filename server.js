'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3001;
const INDEX = path.join(__dirname, 'index.html');

var clients = [];

function register(data, ws){
  if(!clients[data.channel]){
    clients[data.channel] = [];
  }

  clients[data.channel][data.id] = ws;
  console.log(clients);
}

function message(data){
  var participants = clients[data.channel];
  for(var user_id in participants){
    var send = {
      from: data.from,
      channel: data.channel,
      message: data.message
    }
    clients[data.channel][user_id].send(JSON.stringify(send));
  }
}

function assignProcess(data, ws = null){
  try{
    var d = JSON.parse(data);
    switch(d.type){
      case "register":
        register(d.body, ws);
        break;
      case "message":
        message(d.body);
        break;
    }
  } catch (e) {
  }
}

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

wss.on('connection', (ws, req) => {
  ws.on('message', function(message){
    assignProcess(message, ws);
  });
  ws.on('close', () => console.log('Client disconnected'));
});

