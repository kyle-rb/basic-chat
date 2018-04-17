'use-strict';

const http = require('http');
const fs = require('fs');
const WebSocket = require('uws');
const MIME_TYPES = {
  'png': 'image/png',    'jpg':'image/jpeg',    'jpeg': 'image/jpeg', 'gif': 'image/gif',
  'ico': 'image/x-icon', 'svg':'image/svg+xml', 'webp': 'image/webp',
  'txt': 'text/plain',   'html':'text/html',    'css': 'text/css',    'js': 'text/javascript',
  'xml': 'text/xml',     'json':'application/json'
};

// HTTP server, for handling static files and API calls (maybe at some point)
const server = http.createServer(function(request, response) {
  let url = decodeURI(request.url);

  // if this is an API call, then use this:
  if (url.slice(0, 5) === '/api/') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ response: false })); // placeholder for now
    return;
  }

  // otherwise, they're requesting a static resource:
  if (url === '/') {
    url = '/index.html';
  }
  let filePath = process.cwd() + url; // prepend location script was called from to get full path

  fs.readFile(filePath, 'binary', function(err, file) {
    if (err) { // assume 404 because I'm too lazy to check for errors
      response.writeHead(404, { 'Content-Type': 'text/html' });
      response.write('<html><head><title>error :(</title></head><body><h1>file not found (probably)</h1></body></html>');
      response.end();
      return;
    }
    
    let fileExtension = filePath.split('.').pop();
    response.writeHead(200, { 'Content-Type': MIME_TYPES[fileExtension] });
    response.write(file);
    response.end();
  });
});
server.listen(8000, '0.0.0.0', function() {
  console.log('server running at http://0.0.0.0:8000');
});



// WebSocket server for communicating with clients in real time
const wss = new WebSocket.Server({ port: 8080 });
let currentId = 0; // unique id for messages, added in before they're broadcast

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    let message = JSON.parse(data);
    message.id = currentId;
    currentId++;
    let messageStr = JSON.stringify(message);

    wss.clients.forEach(function(client) { // send to everyone, including sender
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
    console.log('sent to ' + wss.clients.length + ' clients');
  });
});



/* for doing redirects if I do need them later
response.writeHead(301, {'Location': '/'});
response.end();
return;
*/
