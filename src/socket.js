import { io } from 'socket.io-client';

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };

    // Replace with your actual backend URL
    const backendUrl = 'http://localhost:5000';  // For local development
    // const backendUrl = 'https://your-production-backend-url.com';  // For production

    return io(backendUrl, options);
};
