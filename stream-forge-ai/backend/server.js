const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Ensure recordings directory exists
if (!fs.existsSync('./recordings')) {
  fs.mkdirSync('./recordings');
}

// A simple map to keep track of active streams per socket
const activeStreams = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('start-stream', (config) => {
    console.log('Starting stream for client:', socket.id, config);
    
    // We create a PassThrough stream to pipe socket binary data into ffmpeg
    const inputStream = new PassThrough();
    
    // Configure FFmpeg command
    const command = ffmpeg()
      .input(inputStream)
      .inputFormat('webm') // Browsers usually record MediaRecorder streams in WebM
      .inputOptions([
        '-re', // Read input at native frame rate
      ]);

    // Build outputs based on the simulcast config
    const outputs = [];
    if (config.destinations) {
      if (config.destinations.youtube && process.env.YOUTUBE_RTMP_URL) outputs.push(process.env.YOUTUBE_RTMP_URL);
      if (config.destinations.twitch && process.env.TWITCH_RTMP_URL) outputs.push(process.env.TWITCH_RTMP_URL);
    }

    // Add a local recording output for VOD / AI Highlights later
    const recordingPath = `./recordings/stream_${socket.id}_${Date.now()}.mp4`;
    
    // Configure local recording
    command.output(recordingPath)
      .outputFormat('mp4')
      .videoCodec('libx264')
      .audioCodec('aac');

    // Configure the RTMP outputs
    outputs.forEach(out => {
      command.output(out)
        .outputFormat('flv')
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-preset veryfast',
          '-maxrate 3000k',
          '-bufsize 6000k',
          '-pix_fmt yuv420p',
          '-g 50',
          '-c:a aac',
          '-b:a 160k',
          '-ar 44100'
        ]);
    });

    command.on('start', (commandLine) => {
      console.log('FFmpeg spawned:', commandLine);
      socket.emit('stream-status', { status: 'live' });
    })
    .on('error', (err) => {
      console.error('FFmpeg Error:', err.message);
      socket.emit('stream-status', { status: 'error', message: err.message });
    })
    .on('end', () => {
      console.log('FFmpeg stream ended');
      socket.emit('stream-status', { status: 'ended' });
    });

    command.run();

    activeStreams.set(socket.id, { inputStream, command });
  });

  socket.on('binary-stream', (data) => {
    const streamInfo = activeStreams.get(socket.id);
    if (streamInfo && streamInfo.inputStream) {
      streamInfo.inputStream.write(Buffer.from(data));
    }
  });

  socket.on('stop-stream', () => {
    console.log('Stopping stream for:', socket.id);
    const streamInfo = activeStreams.get(socket.id);
    if (streamInfo) {
      if (streamInfo.inputStream) streamInfo.inputStream.end();
      activeStreams.delete(socket.id);
    }
  });

  // Room Management for WebRTC Signaling
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId, socket.id);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId, socket.id);
    });
  });

  socket.on('webrtc-offer', (roomId, offer, targetSocketId) => {
    socket.to(targetSocketId).emit('webrtc-offer', offer, socket.id);
  });

  socket.on('webrtc-answer', (roomId, answer, targetSocketId) => {
    socket.to(targetSocketId).emit('webrtc-answer', answer, socket.id);
  });

  socket.on('webrtc-ice-candidate', (roomId, candidate, targetSocketId) => {
    socket.to(targetSocketId).emit('webrtc-ice-candidate', candidate, socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const streamInfo = activeStreams.get(socket.id);
    if (streamInfo) {
      if (streamInfo.inputStream) streamInfo.inputStream.end();
      activeStreams.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend Signaling Server running on port ${PORT}`);
});
