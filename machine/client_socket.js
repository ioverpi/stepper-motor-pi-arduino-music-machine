let net = require("net");
let path = require("path");
const process = require("process");
const easymidi = require('easymidi');
const MidiPlayer = require('midi-player-js');

const secret_phrase = process.env.SECRET_PHRASE || "241375869";
const OUTPUT_NAME = 'VirtualMIDISynth #1';
const MIDI_FILE_DIR = "midi_files";
//const OUTPUT_NAME = "Microsoft GS Wavetable Synth";

const output = new easymidi.Output(OUTPUT_NAME);

const Player = new MidiPlayer.Player(function(event){
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
    let regexMatch = data.toString().match(/([^=]+)=([^=]*)/);
    if(!regexMatch){
        console.log("Server sent malformed request.");
        return;
    }

    let command = regexMatch[1];
    let payload = regexMatch[2];

    switch(command){
        case "play":
            try{
                Player.loadFile(path.resolve(MIDI_FILE_DIR, payload));
                Player.play();
            }catch(error){
                console.log(error);
            }
            break;
        case "stop":
            Player.stop();

            // The purpose of this code is to stop the motors from spinning 
            // forever once the song ends. This will have to be tested on
            // the actual system.
            for(let i = 1; i <= 4; i++){
                output.send("noteoff", {
                    channel: i
                });
            }
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

process.on("SIGINT", (signal) => {
    client.destroy();
    process.exit(0);
})