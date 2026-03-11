const express = require('express');
const { PORT } = require('./config/serverConfig');

const app = express();

const setUpAndStartServer = () => {
    app.listen(PORT, () => {
        console.log(`Server is listening on the port ${PORT}`);
    })
}
setUpAndStartServer();