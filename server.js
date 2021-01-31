const express = require("express");
const app = express();
const http = require("http").createServer(app);

const websockets = require("ws");

require("dotenv").config();

app.use(express.urlencoded(), express.Router());
app.set("view engine", "ejs");
app.set("views", __dirname + "/pages");

const code = process.env.CODE;

const socket = new websockets.Server({ server: http, path: "/api/socket" });

socket.on("connection", uSocket=>{
    console.log("User connected.");
    uSocket.on("close", ()=>{
        console.log("User disconnected.");
    });
});

function emitMessage(message) {
    socket.clients.forEach(client=>{
        if(client.readyState == websockets.OPEN) {
            client.send(message);
        }
    });
}

app.post("/api/sendMessage", (req,res)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    const cookies = parseCookie(req.headers.cookie);

    if(cookies != {}) {
        if(cookies.code) {
            if(cookies.code == code) {
                emitMessage(req.body.message);
                console.log("Sent message: "+req.body.message);
            }
        }
    }

    // console.log(req.body);
});

const parseCookie = function(string) {
    result = {};

    try {
        const a = string.split(";");
        for(var i = 0; i < a.length; i++) {
            const na = a[i].split("=");
            const val = na[1].trim();
            const nam = na[0];

            result[nam] = val;
        }
    } catch(e) {
        0;
    }
    
    return result;
}

app.get('/', (req,res)=>{
    // console.log(parseCookie(req.headers.cookie));

    const cookies = parseCookie(req.headers.cookie);

    if(cookies == {}) {
        res.render("login.ejs")
    } else {
        if(cookies.code) {
            if(cookies.code == code) {
                res.render("chat.ejs");
            } else {
                res.render("login.ejs")
            }
        } else {
            res.render("login.ejs")
        }
    }

    //res.render("login.ejs");
});

app.post("/login", (req,res)=>{
    const cookies = parseCookie(req.headers.cookie);

    if(req.body.code) {
        if(req.body.code == code) {
            res.cookie("code", code, {
                maxAge: 2.88e+7
            });
            res.redirect("/");
        } else {
            res.redirect("/");
        }
    } else {
        res.redirect("/");
    }
});
app.get('/api/loggedIn', (req,res)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");

    const cookies = parseCOokie(req.headers.cookie);
    let li = false;
    if(cookies != {}) {
        if(cookies.code) {
            if(cookies.code == code) {
                li = true;
            }
        }
    }

    res.send(li);
});

http.listen(80, ()=>{
    console.log("[Server] Ready; port 80.")
});