/**
 * Shadowverse Evolve Server - With Field Sync
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 5000;

// Room-based field tracking
const roomFields = new Map(); // Map<room, {player1Field, player2Field, player1Id, player2Id}>

// Socket connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle old-style messages with field sync
    socket.on('send msg', (data) => {
        const { room, type, data: payload } = data;

        // Initialize room fields if needed
        if (!roomFields.has(room)) {
            roomFields.set(room, {
                player1Id: null,
                player2Id: null,
                player1Field: Array(10).fill(0),
                player2Field: Array(10).fill(0)
            });
        }

        const roomData = roomFields.get(room);

        // Track which player this is
        if (!roomData.player1Id) {
            roomData.player1Id = socket.id;
        } else if (!roomData.player2Id && roomData.player1Id !== socket.id) {
            roomData.player2Id = socket.id;
        }

        const isPlayer1 = socket.id === roomData.player1Id;
        const myField = isPlayer1 ? roomData.player1Field : roomData.player2Field;
        const opponentField = isPlayer1 ? roomData.player2Field : roomData.player1Field;

        // Handle special message types
        if (type === 'destroyByCode') {
            console.log(`[${room}] destroyByCode from ${socket.id}: ${payload.productCode}`);

            // Find card in opponent's field by product code
            let foundIndex = -1;
            for (let i = 0; i < opponentField.length; i++) {
                if (opponentField[i] && opponentField[i] !== 0) {
                    // Simple string match for now
                    // In production, you'd have a proper card database
                    if (opponentField[i] === payload.cardName) {
                        foundIndex = i;
                        break;
                    }
                }
            }

            if (foundIndex >= 0) {
                console.log(`[${room}] Found card at index ${foundIndex}, destroying...`);

                // Destroy the card
                opponentField[foundIndex] = 0;

                // Send updated field to opponent
                const opponentSocketId = isPlayer1 ? roomData.player2Id : roomData.player1Id;
                const opponentSocket = io.sockets.sockets.get(opponentSocketId);

                if (opponentSocket) {
                    opponentSocket.emit('receive msg', {
                        type: 'fieldUpdate',
                        data: { field: [...opponentField] }
                    });
                    console.log(`[${room}] Sent fieldUpdate to opponent`);
                }

                // Confirm to sender
                socket.emit('receive msg', {
                    type: 'destroyConfirmed',
                    data: { index: foundIndex, cardName: payload.cardName }
                });
            } else {
                console.log(`[${room}] Card not found in opponent field`);
                socket.emit('receive msg', {
                    type: 'destroyFailed',
                    data: { error: 'Card not found', productCode: payload.productCode }
                });
            }

            return; // Don't relay this message
        }

        // Track field updates
        if (type === 'field') {
            if (isPlayer1) {
                roomData.player1Field = [...payload];
            } else {
                roomData.player2Field = [...payload];
            }
            console.log(`[${room}] Field updated for ${isPlayer1 ? 'player1' : 'player2'}`);
        }

        // Broadcast to other players in room
        socket.to(room).emit('receive msg', { type, data: payload });
    });

    // Room management
    socket.on('join_room', (room) => {
        socket.join(room);
        socket.emit('joined_room', { room });
        console.log(`${socket.id} joined room ${room}`);
    });

    socket.on('leave_room', (room) => {
        socket.leave(room);

        // Clean up room data
        if (roomFields.has(room)) {
            roomFields.delete(room);
            console.log(`Cleaned up room ${room}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        // Clean up rooms where this player was
        for (const [room, data] of roomFields.entries()) {
            if (data.player1Id === socket.id || data.player2Id === socket.id) {
                roomFields.delete(room);
                console.log(`Cleaned up room ${room} after disconnect`);
            }
        }
    });
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        activeRooms: roomFields.size
    });
});

server.listen(PORT, () => {
    console.log(`Shadowverse server with field sync running on port ${PORT}`);
});