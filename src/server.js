const { PORT } = require('./config/serverConfig');
const connectDB = require('./config/database');
const { connectQueue } = require('./utils/message-queue');
const NotificationConsumer = require('./modules/notification/notification-consumer');
const app = require('./app');

const setUpAndStartServer = async() => {

    // 1) connect to datatbase
    await connectDB();

    // 2️) Connect RabbitMQ
    await connectQueue();
    console.log('✅ RabbitMQ Connected');

    // 3️) Start Notification Consumer
    const consumer = new NotificationConsumer();
    await consumer.start();
    console.log('✅ Notification Consumer Started');

    // 2) start the server
    app.listen(PORT, () => {
        console.log(`Server is listening on the port ${PORT}`);
    })
}
setUpAndStartServer();
