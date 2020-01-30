const dotenv = require('dotenv').config({path: __dirname + '/.env'});
const express = require('express');
const http = require('http');
const winston = require('winston');
const oracledb = require('oracledb');

const app = express();
app.listen(8080);
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.end('Hello World!');
    winston.debug(`Your port is ${PORT}`);
});




/*
let server = http.createServer(function(req, res) {
    res.writeHead(200);
    res.end('Server working!');
});
*/




