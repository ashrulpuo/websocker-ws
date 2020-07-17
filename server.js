'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');
var url = require('url');
const { client } = require('websocket');

const PORT = process.env.PORT || 3001;
const INDEX = path.join(__dirname, 'index.html');

var clients = [];

function register(data, ws){
  clients[data.id] = {
    conn: ws,
    channel: data.channel
  };
}

function message(data){
  console.log(data);
  for(var id in clients){
    if(clients[id].channel == data.channel){
      var send = {
        from: data.from,
        channel: data.channel,
        message: data.message
      }
      clients[id].conn.send(JSON.stringify(send));
    }
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
  	// wss.clients.forEach((client) => {
    //   // console.log(client)
    //   client.send(message);
  	// });
  });
  ws.on('close', () => console.log('Client disconnected'));
});

