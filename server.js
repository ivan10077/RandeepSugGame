const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow requests from all origins
    },
});

// In-memory storage for servers and players
const servers = {};

// Handle new client connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Create a server
    socket.on('createServer', (data) => {
        const { serverCode, playerName } = data;
        servers[serverCode] = {
            players: [{ name: playerName, isHost: true }],
        };
        socket.join(serverCode);
        io.to(serverCode).emit('updatePlayers', servers[serverCode].players);
    });

    // Join a server
    socket.on('joinServer', (data) => {
        const { serverCode, playerName } = data;
        if (servers[serverCode]) {
            servers[serverCode].players.push({ name: playerName, isHost: false });
            socket.join(serverCode);
            io.to(serverCode).emit('updatePlayers', servers[serverCode].players);
        } else {
            socket.emit('error', 'Server code is invalid.');
        }
    });

    // Start the game
    socket.on('startGame', (serverCode) => {
        if (servers[serverCode]) {
            io.to(serverCode).emit('gameStarted', { question: getRandomQuestion() });
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        // Clean up logic could go here
    });
});

// Utility function to get a random question
const getRandomQuestion = () => {
    const questions = [
        "What's the funniest thing you've ever seen?",
        "If you could be an animal, which one would you be and why?",
        "What's the weirdest thing you've ever eaten?",
        "If you could live anywhere, where would it be?",
        "What's your dream superpower?",
    ];
    return questions[Math.floor(Math.random() * questions.length)];
};

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});