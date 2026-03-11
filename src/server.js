const { PORT } = require('./config/serverConfig');
const connectDB = require('./config/database');
const app = require('./app');

const setUpAndStartServer = async() => {

    // 1) connect to datatbase
    await connectDB();

    // 2) start the server
    app.listen(PORT, () => {
        console.log(`Server is listening on the port ${PORT}`);
    })
}
setUpAndStartServer();
