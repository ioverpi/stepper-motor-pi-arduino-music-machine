let net = require("net");
const secret_phrase = process.env.SECRET_PHRASE || "241375869";

let client = net.connect({port:8081}, function(){
    console.log("Connected to server!");
});

client.on("connect", function(data){
    client.write("hello=");
});

client.on("data", function(data){
    console.log(data.toString());
    let regexMatch = data.toString().match(/([^=]+)=([^=]*)/);
    if(!regexMatch){
        console.log("Server sent malformed request.");
        return;
    }

    let command = regexMatch[1];
    let payload = regexMatch[2];
    //console.log(command, payload);

    switch(command){
        case "authenticate":
            client.write(`password=${secret_phrase}`);
            break;
    }
})

setTimeout(function(){
    client.write("hello=");
},1000)

client.on("end", function(){
    console.log("Disconnected from server");
})