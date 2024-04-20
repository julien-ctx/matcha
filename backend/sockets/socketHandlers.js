import jwt from 'jsonwebtoken';

export function setupSocketEvents(io) {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
            socket.decoded = decoded;  // Store decoded user data in socket session
            next();
        });
    });
    
    io.on('connection', socket => {
        console.log('A user connected', socket.id);

        socket.on('disconnect', () => {
            console.log('User disconnected', socket.id);
        });

        socket.on('test', (data) => {
            console.log('Example event received:', data);
            socket.emit('testRes', { status: true });
        });
    });
}
