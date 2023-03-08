require("dotenv").config();
const net = require("net");

const http_port = process.env.HTTP_PORT || 8080;
const sock_port = process.env.SOCK_PORT || 8081;
const secret_phrase = process.env.SECRET_PHRASE || "241375869";

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

let client_server = net.createServer(function(connection){
    connection.on("data", function(data){
        if(machine_socket){
            client_socket = connection;
            machine_socket.write(data);
        }else{
            connection.write(createHttpResponse(500, "Stepper Motor Machine is not connected."))
        }
    })
});

let machine_socket = null;

let machine_server = net.createServer(function(connection){
    machine_socket = connection;
    connection.on("data", function(data){
        if(client_socket){
            client_socket.write(data);
        }else{
            console.log("Client is not connected anymore.")
        }
    })
});

client_server.listen(http_port, function(){
    console.log(`Client server is listening on port ${http_port}.`)
})

machine_server.listen(sock_port, function(){
    console.log(`Socket server is listening on port ${sock_port}.`);
});