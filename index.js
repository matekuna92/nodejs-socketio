const dotenv = require('dotenv').config({path: __dirname + '/.env'});
const express = require('express');
const http = require('http');
const winston = require('winston');
const oracledb = require('oracledb');
const socketio = require('socket.io');
const crossenv = require('cross-env');
const dbConfig = require('./server/dbconfig');
///const serveStatic = require('serve-static');

const PORT = process.env.PORT || 8080;
const app = express();
const httpserver = http.createServer(app);

const server = app.listen(PORT);
const io = require('socket.io').listen(server);
console.log(PORT);

io.on('connection', socket => {
    console.log('a user connected');
    
    socket.on('disconnect', function() {
      console.log('user disconnected');
    });
  });

io.on('change', function(employees)
{
    console.log('DB changed!');
  //  showEmployees(employees);
});

/// app.use('/', serveStatic(__dirname + '/public'));

app.get('/', (req, res) => {
 //   winston.debug(`Your port is ${PORT}`);
    res.sendFile(__dirname + '/public/index.html'); // serve-static package is erre való, a sendFile beépített function
    // res.end('Hello World!');
});

// endpoint létrehozása a dolgozók számára, az itt lévő JSON objektumot kérjük el a get-tel, és jelenítjük meg a táblázatban
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
                            res.send(results.rows); 
                            //console.log(results.rows);
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




