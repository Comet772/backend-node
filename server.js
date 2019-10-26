// Require express to load our app server and create an instance of it
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql'); //mysql connection
const jwt = require('jsonwebtoken');
// const morgan = require('morgan')  //why use?

// app.use(express.static('./public'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(morgan('combined'))
// app.use(morgan('short'))  //why use?

function getConnection() {
    return mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "mydb"
    });
}
const con = getConnection();

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   /*Create a database named "mydb":*/
//   con.query("CREATE DATABASE mydb", function (err, result) {
//     if (err) throw err;
//     console.log("Database created");
//   });
//   //Table create
//   var sql = "CRETE TABLE users(id int(11) primary key auto_increment, username VARCHAR(255), email VARCHAR(255), password VARCHAR(255))";
//   con.query(sql, (err, result) => {
//       if (err) throw err;
//       console.log("table created!")
//   });
// });

// //on the request to root (localhost:3000/)
app.get('/', (req, res) => {
    res.send('<b>My</b> first express http server');
    console.log("responding to localhost:3000")
});

app.post('/api/signup', (req, res) => {
    // console.log('req.body', req.body);
    const { username, email, password } = req.body;
    console.log(username);

    con.connect(() => {
        const sql = `INSERT INTO users(username, email, password) VALUES ("${username}", "${email}", "${password}")`;
        con.query(sql, (err, results) => {
            if (err) {
                console.log('failed' + err);
                res.Status(500).send(err);
                return
            } else {
                console.log('results->', results, '->');
                res.json({ 'status': 'success', body: results.body })
                console.log(results.body);
                res.end();
            }
        })
    })

    // //another method
    // if(!username & !password & !email) {
    //     return res.status(400).send({
    //         error:true, message: 'please provide user'
    //     });
    // }
    // con.query("INSERT INTO users SET ?", {username: username, email: email, password: password}, (err, result, fields) => {
    //     if(err) throw err;
    //     return res.send({
    //         err: false, data:result, message: 'create successfully!'
    //     });
    // });
});

app.get('/api/login', (req, res) => {
    const { username, password } = req.body;
   
    const sql = "SELECT * from users";
    con.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result)

        const user = result.find(u => u.username === username && u.password === password);
        // res.send(user);
          
        //jwt
        if (user) {
            const token, curUser;
            curUser = Object.assign({}, user);
            token = jwt.sign({ sub: user.username }, config.secret);
            res.send({
              users: users.map(u => {
                const { password, ...userWithoutPassword } = u;
                return userWithoutPassword;
              }),
              token
            });
          } else {
            res.status(400).send({ message: 'Username or password is incorrect' });
          }
    })

});

app.get('/api/verifyToken', (req, res, next) => {
    
        let token = req.headers['x-access-token'];
      
        if (!token){
            return res.status(403).send({ 
                auth: false, message: 'No token provided.' 
            });
        }
    
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err){
                return res.status(500).send({ 
                        auth: false, 
                        message: 'Fail to Authentication. Error -> ' + err 
                    });
            }
            req.userId = decoded.id;
            next();
        });
    
})
// app.get('/users/:id', (req, res) => {
//     con.connect((err) => {
//       if (err) throw err;
//       const userId = req.params.id;
//       const queryString = "SELECT * FROM users  WHERE id = ?"
//       con.query(queryString, [userId],  (err, result, fields) => {
//         if (err) {
//             console.log("failed to query for users:" + err)
//             res.sendStatus(500);
//              return  // throw err; // res.(end);
//         }
//         console.log('success')
//         const users = result.map((row) => {
//             return {username: row.username, email: row.email}
//         });
//         // res.send(result);
//         // res.json(result);
//         res.json(users)
//       });
//     });
// });

app.get('/api/users', (req, res) => {
   con.connect((err) => {
   const queryString = "SELECT * FROM users"
    con.query(queryString, (err, result, fields) => {
        if(err) {
            console.log("failed to query for users:" + err)
            res.sendStatus(500);
            return;  
        }
    })
  })
})

// // Change the 404 message modifing the middleware
// app.use( (req, res, next) => {
//     res.status(404).send("Sorry, that route doesn't exist. Have a nice day! :)");
//     next();
// }, );

// start the server in the port 3000 !
app.listen(3000, function () {
    console.log('Example app listening on port 3000.');
});