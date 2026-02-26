const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static('public'));

// CHANGE THIS SECRET! Anyone who knows it can update the location.
const SECRET = 'gps12345';

let latestLocation = {
  lat: 28.6139,
  lng: 77.2090,
  timestamp: new Date().toISOString()
};

app.post('/api/location', (req, res) => {
  if (req.query.secret !== SECRET) {
    return res.status(401).json({ error: 'Invalid secret' });
  }

  const { lat, lng } = req.body;
  if (lat != null && lng != null) {
    latestLocation = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      timestamp: new Date().toISOString()
    };
    io.emit('locationUpdate', latestLocation);
    console.log(`✅ GPS updated: ${latestLocation.lat}, ${latestLocation.lng}`);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'lat and lng required' });
  }
});

app.get('/api/location', (req, res) => res.json(latestLocation));

io.on('connection', (socket) => {
  console.log('Web client connected');
  socket.emit('locationUpdate', latestLocation);
});

const PORT = 5023;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Live GPS Tracker running on http://0.0.0.0:${PORT}`);
});
