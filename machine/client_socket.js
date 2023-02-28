let net = require("net");
//const fs = require("fs");
//const csvParser = require("csv-parser");
const easymidi = require('easymidi');
const MidiPlayer = require('midi-player-js');

const secret_phrase = process.env.SECRET_PHRASE || "241375869";
const OUTPUT_NAME = 'VirtualMIDISynth #1';
//const OUTPUT_NAME = "Microsoft GS Wavetable Synth";

/*
const result = [];
const songnameToFilename = new Object();

fs.createReadStream("filenames.csv", {encoding: "utf-8"})
.pipe(csvParser())
.on("data", (chunk) => {
    result.push(chunk);
})
.on("error", (error) => {
    console.log(error);
})
.on("end", () => {
    for(data of result){
        songnameToFilename[data.Songname] = data.Filename;
    }
})
*/
/*
try{
    const data = fs.readFileSync("filenames.csv", "utf8");
    console.log(data.split("\n"));
}catch(err){
    console.log(error);
}
*/

const output = new easymidi.Output(OUTPUT_NAME);

const Player = new MidiPlayer.Player(function(event){
    //console.log(event);
    if(event.name == "Note on"){
      output.send("noteon", {
          note: event.noteNumber,
          velocity: event.velocity,
          channel: event.channel
      });
    }
});

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
        case "play":
            Player.loadFile("./midi_files/Axel_F2.mid");
            Player.play();
            break;
        case "stop":
            Player.stop();
            break;
        case "authenticate":
            client.write(`password=${secret_phrase}`);
            break;
        default:
            console.log("Server sent an unknown command.");
            break;
    }
})

client.on("end", function(){
    console.log("Disconnected from server");
})