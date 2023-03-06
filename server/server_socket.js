let net = require("net");

let server = net.createServer(function(connection){
    console.log("client connected");
    console.log(`From: ${connection.remoteAddress}`);

    connection.on("end", function(){
        console.log("Client disconnected");
    });

    connection.on("data", function(data){
        console.log(data.toString());
        let path = data.toString().match(/GET (.+) HTTP/)[1]
        let parts = path.split("/");
        console.log(parts);
        switch(parts[1]){
            case "play":
                console.log("Hello");
                let songname = parts[2].replaceAll(/[^A-Za-z\d._]/g, "");
                let document = `Playing ${songname}`;
                connection.write(
`HTTP/1.1 200 OK\r
Date: ${(new Date()).toUTCString()}\r
Server: Node\r
Accept-Ranges: bytes\r
Content-Length: ${document.length}\r
Content-Type: text/plain\r
\r
${document}
`
                );
                break;
            default:
                connection.write(
`HTTP/1.1 404 Not Found\r
Date: ${(new Date()).toUTCString()}\r
Server: Node\r
Accept-Ranges: bytes\r
Content-Length: 18\r
Content-Type: text/plain\r
\r
404 File not found
`
                );
                break;
        }
        // await new Promise(resolve => setTimeout(resolve, 2000));
    })
});

server.listen(80, function(){
    console.log("Server is listening.")
})