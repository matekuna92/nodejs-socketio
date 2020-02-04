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
    
    socket.on('employee added', function()
    {
        console.log('button clicked!');   
        
        /*
        try
        {
        //    socket.emit('employee added');
            /*
            let connection = oracledb.getConnection(dbConfig);
            connection.execute(
                `INSERT INTO EMPLOYEES(:ID, :DEPARTMENT_ID, :NAME, :EMAIL, :COST_CENTER, :DATE_HIRED, :JOB) 
                    VALUES(20001014041041, 209119519135897625115199142974062211758, 'USER 5', 'newest@mail.com', 55,
                    TO_DATE('2020-01-01','YYYY-MM-DD'), 'Developer')`,
            );
            oracledb.autoCommit = true;
            console.log("Rows inserted: " + result.rowsAffected);
            */

           /// io.sockets.emit('employee added', emp);

           /**** működik!
            socket.emit('newMessage', 
            { 
                from:'jen@mds', 
                text:'hepppp', 
                createdAt:123 
            }); 
            
            socket.on('createMessage', (newMessage)=>{ 
                console.log('newMessage', newMessage); 
            });
            
        }
        catch(err)
        {
            if(err)
            {
                console.log(err);
            }
        }
        */
        
    })

    /*
    // add employee esemény figyelése
    socket.on('add employee', function(emp) 
    {
        add_employee(emp, function(res)
        {
            if(res)
            {
                console.log('employee added in funciton');
                io.emit('employee added', emp);
            }
            else
            {
                console.log('error, cant add employee');
                io.emit('error');
            }
        })
    })
    */

    socket.on('disconnect', function() 
    {
      console.log('user disconnected');
    });
  });

/*****
let add_employee = function(status, callback)
{
    oracledb.getConnection(dbConfig, function(err, connection)
    {
        if(err)
        {
            callback(false);
            console.log('ERROR in add_employee');
            return;
        }
        
        connection.query("INSERT INTO EMPLOYEES(ID, NAME, LOCATION, COUNTRY) VALUES('5', 'Newest User', 'Test City', 'Germany')", 
            function(err,rows)
            {
                console.log('CONNETION QUERY OK');
                connection.release();
                if(!err) {
                  callback(true);
                }
            });

        connection.on('error', function(err) 
        {
            console.log('ERROR IN QUERY');
            callback(false);
            return;
        });
    })
}
*****/


/*
io.on('change', function(employees)
{
    console.log('DB changed!');
  //  showEmployees(employees);
});
*/

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
async function addEmployee(req, res)
{
    try
    {
        const connection = await oracledb.getConnection(dbConfig);
        connection.execute(
            `INSERT INTO EMPLOYEES(:ID, :DEPARTMENT_ID, :NAME, :EMAIL, :COST_CENTER, :DATE_HIRED, :JOB) 
                VALUES(20001014041041, 209119519135897625115199142974062211758, 'USER 5', 'newest@mail.com', 55,
                TO_DATE('2020-01-01','YYYY-MM-DD'), 'Developer');`,
        );
        console.log("Rows inserted: " + result.rowsAffected);
    }
    catch (err) 
    {
        console.error(err);
    }       
}
*/

/*
let server = http.createServer(function(req, res) {
    res.writeHead(200);
    res.end('Server working!');
});
*/




