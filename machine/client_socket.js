require("dotenv").config();
const net = require("net");
const path = require("path");
const fs = require("fs");
const { spawn } = require("node:child_process");
const process = require("process");
const easymidi = require('easymidi');
const MidiPlayer = require('midi-player-js');

const SECRET_PHRASE = process.env.SECRET_PHRASE || "241375869";
const SERVER_HOST = process.env.SERVER_HOST || "127.0.0.1"; // Put the actual host in the .env file.
const MIDI_PORT = `${process.env.MIDI_PORT || "128"}:1`; // You can probably set this by an export command or in the .env file. Otherwise, hope we're right!
const MIDI_FILE_DIR = "midi_files";
// const OUTPUT_NAME = "Microsoft GS Wavetable Synth";
// const OUTPUT_NAME = 'VirtualMIDISynth #1';
/*
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
*/

console.log(SERVER_HOST)

let client = new net.Socket();

let connection_established = false;

function connect(){
    client.connect({
        host: SERVER_HOST,
        port: 8081 //Make this not hardcoded.
    }, function(){
        connection_established = true;
        console.log("Connected to server!");
    });
}

client.on("connect", function(data){
    client.write("hello=");
});

let midi_player = null;
let machine_playing = false;

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
                if(machine_playing){
                    throw Error("Stepper Motor Machine is already playing.");
                }
                // TODO: Get the external program route working.
                // exec(`pmidi -p ${midi_port}:1 ${MIDI_FILE_DIR}/${payload.replaceAll(/[^A-Za-z\d._]/g, "")}`);
                midi_player = spawn("pmidi", ["-p", MIDI_PORT, `${MIDI_FILE_DIR}/${payload.replaceAll(/[^A-Za-z\d._]/g, "")}`]);

                midi_player.on("spawn", () => {
                    console.log("Spawned");
                    client.write(`play=success,${payload}`);
                    machine_playing = true;
                });

                midi_player.on("error", (error) => {
                    client.write(`play=error,${error}`);
                    console.log(error);
                });

                midi_player.stdout.on("data", (data) => {
                    console.log(data.toString());
                });

                midi_player.on("close", (code, signal) => {
                    console.log(`child process exited with code ${code} because of signal ${signal}`);
                    if(signal){
                        midi_player = spawn("pmidi", ["-p", MIDI_PORT, "end.mid"]);
                    }
                    machine_playing = false;
                });

                // The Player code doesn't work very well with the arduino.
                // I'm not sure why. That's why we're using an external program above.
                // TODO: Make this safer.
                // The following code may be useful later to prevent people from trying to access places they shouldn't.
                // var safeSuffix = path.normalize(unsafeSuffix).replace(/^(\.\.(\/|\\|$))+/, '');
                // var safeJoin = path.join(basePath, safeSuffix);
                // Player.loadFile(path.resolve(MIDI_FILE_DIR, payload));
                // Player.play();
            }catch(error){
                client.write(`play=error,${error}`);
                console.log(error);
            }
            break;
        case "stop":
            try{
                if(machine_playing){
                    midi_player.kill();
                }
                client.write("stop=success,yay");
            }catch(error){
                client.write(`stop=error,${error}`);
                console.log(error);
            }
            break;
            /*
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
            */
        case "songlist":
            fs.readdir(path.resolve(MIDI_FILE_DIR), (err, files) => {
                client.write(`songlist=${files}`);
            });
            break;
        case "authenticate":
            client.write(`password=${SECRET_PHRASE}`);
            break;
        default:
            console.log("Server sent an unknown command.");
            break;
    }
})

client.on("end", function(){
    console.log("Disconnected from server");
})

client.on("error", function(error){
    if(!connection_established) setTimeout(connect, 5000);
    console.log(error);
});

process.on("SIGINT", (signal) => {
    client.destroy();
    process.exit(0);
})

connect();
