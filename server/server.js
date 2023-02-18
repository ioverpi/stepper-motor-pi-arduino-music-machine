let net = require("net");

let server = net.createServer(function(connection){
    console.log("client connected");

    connection.on("end", function(){
        console.log("Client disconnected");
    });

    connection.write("Hello World!\n");
    connection.pipe(connection);
});

server.listen(8080, function(){
    console.log("Server is listening.")
})