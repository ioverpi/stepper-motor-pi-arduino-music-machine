const easymidi = require('easymidi');

const OUTPUT_NAME = 'VirtualMIDISynth #1';
//const OUTPUT_NAME = "Microsoft GS Wavetable Synth";

const output = new easymidi.Output(OUTPUT_NAME);

const MidiPlayer = require('midi-player-js');

const Player = new MidiPlayer.Player(function(event){
    console.log(event);
    output.send("noteon", {
        note: event.noteNumber,
        velocity: event.velocity,
        channel: event.channel
    })
});

Player.loadFile("./Axel_F2.mid");
Player.play();

setTimeout(() => {Player.stop()}, 1000);

/*
output.send('noteoff', {
  note: 64,
  velocity: 0,
  channel: 0
});

output.send('noteon', {
  note: 64,
  velocity: 127,
  channel: 0
});

output.send('cc', {
  controller: 64,
  value: 127,
  channel: 0
});

output.send('poly aftertouch', {
  note: 64,
  pressure: 127,
  channel: 0
});

output.send('channel aftertouch', {
  pressure: 127,
  channel: 0
});

output.send('program', {
  number: 2,
  channel: 0
});

output.send('pitch', {
  value: 12345,
  channel: 0
});

output.send('position', {
  value: 12345
});

output.send('select', {
  song: 10
});

output.send('clock');

output.send('start');

output.send('continue');

output.send('stop');

output.send('reset');


setTimeout(() => {}, 4000);

*/
/*
const midi = require("@julusian/midi");

const output = new midi.Output();

//console.log(output.getPortCount());

//console.log(output.getPortName(0));

output.openPort(0);

output.sendMessage([144,69,127]);

output.sendMessage([144,100,200]);

output.sendMessage([145,100,200]);

output.sendMessage([145,100,200]);

output.sendMessage([145,100,200]);

setTimeout(() => {}, 4000);

//output.closePort();
*/