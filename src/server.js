const http = require('http');
const { PORT } = require('./config/serverConfig');
const connectDB = require('./config/database');
const { connectQueue } = require('./utils/message-queue');
const { initSocket } = require('./utils/socket-server');
const NotificationConsumer = require('./modules/notification/notification-consumer');
const app = require('./app');

const setUpAndStartServer = async() => {

    // 1) Connect to Database
    await connectDB();

    // 2) Connect RabbitMQ
    await connectQueue();
    console.log('✅ RabbitMQ Connected');

    // 3) Start Notification Consumer
    const consumer = new NotificationConsumer();
    await consumer.start();
    console.log('✅ Notification Consumer Started');

    // 4) Create HTTP Server & Bind Socket.io
    const httpServer = http.createServer(app);
    initSocket(httpServer);
    console.log('✅ Socket.io WebSocket Gateway Initialized');

    // 5) Start listening
    httpServer.listen(PORT, () => {
        console.log(`Server is listening on the port ${PORT}`);
    });
}
setUpAndStartServer();
