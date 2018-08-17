import * as WebSocket from 'ws';

const port = 8080;
const wss = new WebSocket.Server({port});

console.log('socket listening on port ' + port);

wss.on('open', () => {
  console.log('socket opened');
});

function broadcast(ws: WebSocket, data: WebSocket.Data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  })
}

wss.on('connection', (ws: WebSocket) => {
  console.log('socket connected');

  ws.on('message', (data) => {
    broadcast(ws, data);
  });

  ws.on('close', () => {
    console.log('socket closed');
  })
})
