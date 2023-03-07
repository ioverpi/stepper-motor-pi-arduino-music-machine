require("dotenv").config();
const net = require("net");
const express = require("express");
const { response } = require("express");
const app = express();

const http_port = process.env.HTTP_PORT || 8080;
const sock_port = process.env.SOCK_PORT || 8081;
const secret_phrase = process.env.SECRET_PHRASE || "241375869";

const sanitize = (filename) => filename.replaceAll(/[^A-Za-z\d._]/g, "");

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/play/:songname", (req, res) => {
    if(machine_socket){
        machine_socket.write(`play=${req.params.songname}`);
        res.send("Playing");
    }else{
        res.send("Failed to play");
    }
});

app.get("/stop", (req, res) => {
    if(machine_socket){
        machine_socket.write("stop=");
        res.send("Stop");
    }else{
        res.send("Failed to stop");
    }
});

/*
function waitForData(variable_name){
    return new Promise((resolve) => {
        let start = new Date();
        let max_time = 4000;
        while((new Date) - start < max_time && !pending_variables[variable_name]){
            // pass
        }
        console.log(pending_variables[variable_name]);
        resolve();
    });
}


function waitForData(variable){
    let start = new Date();
    let max_time = 4000;
    while((new Date) - start < max_time && !songlist){
        // pass
    }
    console.log(songlist);
}
*/

let songlist = null;

app.get("/songlist", async (req, res) => {
    songlist = null;

    if(machine_socket){
        machine_socket.write("songlist=");
        //waitForData(songlist);

        let tries = 0;
        let max_tries = 10;
        while(!songlist){
            await new Promise(resolve => setTimeout(resolve, 100));
            if(tries > max_tries){
                break;
            }
            tries++;
        }

        
        if(songlist){
            res.send({"songlist": songlist});
        }else{
            res.send("Couldn't get songlist");
        }
    }
});

function createHttpResponse(status_code, message){
    let status_messages = {
        200: "OK", 
        400: "Bad Request", 
        404: "Not Found", 
        500: "Internal Server Error",
        501: "Not Implemented"
    };
    let payload = new Object();
    payload["status"] =  status_code < 400? "success": "error";
    payload["message"] = message;
    json_payload = JSON.stringify(payload);
    return `HTTP/1.1 ${status_code} ${status_messages[status_code]}\r
Date: ${(new Date()).toUTCString()}\r
Server: Node\r
Accept-Ranges: bytes\r
Content-Length: ${json_payload.length}\r
Content-Type: application/json\r
\r
${json_payload}`;
}

let client_socket = null;

let http_server = net.createServer(function(connection){
    console.log("client connected");
    console.log(`From: ${connection.remoteAddress}`);

    connection.on("end", function(){
        console.log("Client disconnected");
    });

    connection.on("data", function(data){
        console.log(data.toString());
        let path = data.toString().match(/GET (.+) HTTP/);
        // TODO: Implement the HEAD handler
        // if(!path){
        //     path = data.toString().match(/HEAD (.+) HTTP/);
        // }
        if(!path){
            connection.write(createHttpResponse(501, "Method not implemented"));
            return;
        }
        let parts = path[1].split("/");
        switch(parts[1]){
            case "play":
                if(parts.length != 3){
                    connection.write(createHttpResponse(400, "Missing song name to play."));
                    break;
                }
                let songname = sanitize(parts[2]);
                client_socket = connection;
                machine_socket.write(`play=${songname}`);
                
                break;
            case "stop":
                client_socket = connection;
                machine_socket.write("stop=");
                break;
            case "songlist":
                client_socket = connection;
                machine_socket.write("songlist=");
                break;
            default:
                connection.write(createHttpResponse(400, "Not a valid path."));
                break;
        }
        // await new Promise(resolve => setTimeout(resolve, 2000));
    })
});

let machine_socket = null;

let server = net.createServer(function(socket){
    console.log("client connected");

    socket.on("end", function(){
        console.log("Client disconnected");
        machine_socket = null;
    });

    socket.on("data", function(data){
        let regexMatch = data.toString().match(/([^=]+)=([^=]*)/);
        if(!regexMatch){
            console.log("Client sent malformed request.");
            //socket.destroy();
            return;
        }

        let command = regexMatch[1];
        let payload = regexMatch[2];

        if(!socket.authenticated){
            // TODO: Add some code to kick clients off that are bad actors. 
            if(command == "password"){
                if(secret_phrase == payload){
                    socket.authenticated = true;
                }
                console.log("Client authenticated.");
                machine_socket = socket;
            } else {
                socket.write("authenticate=");
            }
            return;
        }

        switch(command){
            case "play":
                res = payload.split(",");
                if(res[0] == "success"){
                    client_socket.write(createHttpResponse(200, `Playing ${res[1]}.`));
                }else{
                    client_socket.write(createHttpResponse(500, res[1]))
                }
                
                break;
            case "stop":
                res = payload.split(",");
                if(res[0] == "success"){
                    client_socket.write(createHttpResponse(200, "Stopped playback."));
                }else{
                    client_socket.write(createHttpResponse(500, res[1]));
                }
                break;
            case "songlist":
                songlist = payload.split(",");
                console.log(songlist);
                break;
            default:
                console.log("Unknown command sent from client.");
                break;
        }
    });

    socket.on("error", function(error){
        // TODO: Handle the client disconnecting unexpectedly.
        console.log("Error:", error);
    });
});

server.on("error", function(error){
    console.log("Error:", error);
});

// app.listen(http_port, () => {
//     console.log(`http server is listening on port ${http_port}.`);
// });

http_server.listen(http_port, function(){
    console.log(`http server is listening on port ${http_port}.`)
})

server.listen(sock_port, function(){
    console.log(`Socket server is listening on port ${sock_port}.`);
});