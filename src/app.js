const express = require('express');
const cors = require('cors');

const app = express();

const userRoutes = require('./api/v1/user-routes');
// const v2Routes = require('./api/v2');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', userRoutes);
// app.use('/api/v2', v2Routes);

module.exports = app;
