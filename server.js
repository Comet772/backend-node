// Require express to load our app server and create an instance of it
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql'); //mysql connection
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

function getConnection() {
    return mysql.createConnection({
        host: "sql10.freemysqlhosting.net",
        user: "sql10309969",
        password: "VPQAvGvIM4",
        database: "sql10309969"
    });
}
const con = getConnection();
console.log('con---', con);

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
            const token = jwt.sign({ sub: user.username }, config.secret);
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

//token verify
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

app.get('/api/users', (req, res) => {
   con.connect((err) => {
        if (err) throw err;
        const queryString = "SELECT * FROM users";
        con.query(queryString, (err, result, fields) => {
        if(err) {
            console.log("failed to query for users:" + err)
            res.status(500).send('server error');
            return;
        }
        res.status(200).send(JSON.stringify(result));
    })
  })
})

// start the server in the port 3000 !
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));