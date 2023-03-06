const net = require("net");

const SERVER_HOST = process.env.SERVER_HOST || "127.0.0.1"; // Put the actual host in the .env file.

let client = net.connect({host: "192.168.1.4", port: 8081}, function(){
    console.log("Connected to server!");
});

client.on("data", function(data){
    console.log(data.toString());
})