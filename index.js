const dotenv = require('dotenv').config({path: __dirname + '/.env'});
const express = require('express');
const http = require('http');
const winston = require('winston');
const oracledb = require('oracledb');
const socketio = require('socket.io');
const dbConfig = require('./server/dbconfig');
///const serveStatic = require('serve-static');

const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);
const PORT = process.env.PORT || 8080;

app.listen(PORT);

/// app.use('/', serveStatic(__dirname + '/public'));

app.get('/', (req, res) => {
    winston.debug(`Your port is ${PORT}`);
    res.sendFile(__dirname + '/public/index.html'); // serve-static package is erre való, a sendFile beépített function
    // res.end('Hello World!');
});

app.get('/api/employees', (req, res, next) => {
    getEmployees(req, res, next, 'API');
})

// valamennyi dolgozó lekérdezése oracledb driverrel
function getEmployees(req, res, next, context)
{
    oracledb.getConnection(
        dbConfig,
        
        function(err, connection)
        {
            if(err)
            {
                return next(err);
            }

            connection.execute(
                'SELECT * FROM EMPLOYEES',
                {}, // bind paraméter most üresen marad
                {
                    outFormat: oracledb.OBJECT
                },
                function(err, results) 
                {
                    if (err) 
                    {
                        return connection.release(function() {
                            next(err);
                        });
                    }
                    connection.release(function(err) 
                    {
                        if (err) return next(err);

                        if (context === 'API') 
                        {
                            res.send(results.rows); console.log(results.rows);
                        } else if (context === 'SOCKET_IO') 
                        {
                            io.emit('change', results.rows);
                            res.send();
                        }
                    });
                }
            )
        }
    );
}


/*
let server = http.createServer(function(req, res) {
    res.writeHead(200);
    res.end('Server working!');
});
*/




