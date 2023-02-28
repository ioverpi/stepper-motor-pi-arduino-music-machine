require("dotenv").config();
const net = require("net");
const express = require("express");
const app = express();

const http_port = process.env.HTTP_PORT || 8080;
const sock_port = process.env.SOCK_PORT || 8081;
const secret_phrase = process.env.SECRET_PHRASE || "241375869";

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/play", (req, res) => {
    if(client_socket){
        client_socket.write("play=");
    }
    res.send("Playing");
});

let client_socket = null;

let server = net.createServer(function(socket){
    console.log("client connected");

    socket.on("end", function(){
        console.log("Client disconnected");
    });

    //socket.on("")

    socket.on("data", function(data){
        let regexMatch = data.toString().match(/([^=]+)=([^=]*)/);
        if(!regexMatch){
            console.log("Client sent malformed request.");
            //socket.destroy();
            return;
        }

        let command = regexMatch[1];
        let payload = regexMatch[2];
        //console.log(command, payload);

        if(!socket.authenticated){
            if(command == "password"){
                if(secret_phrase == payload){
                    socket.authenticated = true;
                }
                console.log("Client authenticated.");
                client_socket = socket;
            } else {
                socket.write("authenticate=");
            }
            return;
        }

        switch(command){
            default:
                console.log("Unknown command sent from client.");
                break;
        }
    });
});

app.listen(http_port, () => {
    console.log(`http server is listening on port ${http_port}.`);
});

server.listen(sock_port, function(){
    console.log(`Socket server is listening on port ${sock_port}.`);
});