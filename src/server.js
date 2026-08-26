const { PORT } = require('./config/serverConfig');
const connectDB = require('./config/database');
const { connectQueue } = require('./utils/message-queue');
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

    // 4) Start the HTTP Server
    app.listen(PORT, () => {
        console.log(`Server is listening on the port ${PORT}`);
    });
}
setUpAndStartServer();
