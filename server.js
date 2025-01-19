const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const userSocketMap = {};
const roomState = {}; // Store the latest code and language for each room

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    // Handle user joining a room
    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);

        // Initialize room state if not already present
        if (!roomState[roomId]) {
            roomState[roomId] = { code: '', language: 'javascript' }; // Default to JavaScript
        }

        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });

        // Sync the latest code and language to the newly joined client
        socket.emit(ACTIONS.SYNC_CODE, roomState[roomId]);
    });

    // Handle code changes
    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code, language }) => {
        roomState[roomId].code = code;
        socket.broadcast.to(roomId).emit(ACTIONS.CODE_CHANGE, { language, code });
    });

    // Handle language changes
    socket.on(ACTIONS.LANGUAGE_CHANGE, ({ roomId, language, code }) => {
        roomState[roomId].language = language;
        roomState[roomId].code = code;
        socket.broadcast.to(roomId).emit(ACTIONS.LANGUAGE_CHANGE, { language, code });
    });

    // Handle user disconnection
    socket.on('disconnecting', () => {
        const rooms = Array.from(socket.rooms);
        rooms.forEach((roomId) => {
            socket.leave(roomId);
            const clients = getAllConnectedClients(roomId);
            clients.forEach(({ socketId }) => {
                io.to(socketId).emit(ACTIONS.DISCONNECTED, {
                    socketId: socket.id,
                    username: userSocketMap[socket.id],
                });
            });
        });
        delete userSocketMap[socket.id];
    });
});

server.listen(5000, () => {
    console.log('Listening on port 5000');
});
