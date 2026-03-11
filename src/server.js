const express = require('express');
const { PORT } = require('./config/serverConfig');
const connectDB = require('./config/database');

const app = express();

const setUpAndStartServer = () => {

    // 1) connect to datatbase
    connectDB();

    // 2) start the server
    app.listen(PORT, () => {
        console.log(`Server is listening on the port ${PORT}`);
    })
}
setUpAndStartServer();