const midiFolder = './midi_files/';
const fs = require('fs');

fs.readdir(midiFolder, (err, files) => {
  files.forEach(file => {
    let name = file.replaceAll("_", " ").split(".")[0]
    console.log(`${name.substr(0, name.length-8)},${file}`);
  });
});