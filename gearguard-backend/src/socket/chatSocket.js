const socketAuth = require('../middleware/socketAuth');
const Message = require('../models/Message');

module.exports = (io) => {
    // Middleware for Auth
    io.use(socketAuth);

    io.on('connection', (socket) => {
        console.log(`User connected to socket: ${socket.user.name} (${socket.user.role})`);

        // Join Request Room
        socket.on('join_room', (requestId) => {
            // Here we could add logic to verify if user is allowed to join this request
            // e.g., is Technician assigned, or Requester creator, or Manager
            socket.join(requestId);
            console.log(`User ${socket.user.name} joined room: ${requestId}`);
        });

        // Handle sending messages
        socket.on('send_message', async (data) => {
            try {
                const { requestId, content, type } = data;

                // Save to DB
                const newMessage = new Message({
                    request: requestId,
                    sender: socket.user._id,
                    content,
                    type: type || 'text'
                });

                await newMessage.save();

                // Populate sender info before broadcasting
                await newMessage.populate('sender', 'name role');

                // Broadcast to room
                io.to(requestId).emit('receive_message', newMessage);
            } catch (err) {
                console.error('Error sending message:', err);
                socket.emit('error', 'Failed to send message');
            }
        });

        socket.on('disconnect', () => {
            // console.log('User disconnected');
        });
    });
};
