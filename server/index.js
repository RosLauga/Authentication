const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const fs = require('fs');

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

let id = "0"

// fs.readFile(__dirname,"./db.json", 'utf8', (err, json) => {
//   // let dbuser = JSON.parse(json)
// })

const path = require('path');
let dbuser;


app.use(express.json());

// CONFIGURACION DEL CORS
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// COOKIE Y BODY PARSER
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

//  DECLARO SESION
app.use(
  session({
    key: "userId",
    secret: "payfunlogintest",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

let info;

   const read = fs.createReadStream(path.join(__dirname,'./db.json'));
   const dbdata = read.on('data', (chunk)=> {
    console.log("JSON actualizado");
    return info = chunk
  });


app.post("/register", async (req, res)  => {
  const username = req.body.username;
  const password = req.body.password;
  bcrypt.hash(password, saltRounds, async (err, hash) => {
    if (err) {
      console.log(err);
    }        
    const user = {
      id : id,
      name: username,
      password: hash,
    }

    let dbuserarr = await info.toString()
    dbuserarr = await JSON.parse(dbuserarr)
    dbuserarr.push(user)
   
    let finalinfo = await JSON.stringify(dbuserarr)
    
    fs.writeFile('db.json', finalinfo, (err) => {
      if(err) console.log(err)
      console.log("archivo subido")
    });
    res.send(user)
  });
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/login",async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  let dbuserarr = await info.toString()
  dbuserarr = await JSON.parse(dbuserarr)

  const userexist = dbuserarr.find((u) => u.name == username)
  if(userexist){

     bcrypt.compare(password, userexist.password, (error, response) => {
          if (response) {
            req.session.user = userexist
            console.log("Sesion",req.session.user)
            res.send(userexist);
          } else {
            res.send({ message: "Usuario o Password incorrectos!" });
          }
        });         
  } else {

    res.send(console.log("Usuario no encontrado"))

  }
});

app.listen(3001, () => {
  console.log("Server corriento en puerto 3001");
});
