let available_songs = null;
let basePath = "http://127.0.0.1:8080";

async function init(){
    let songDiv = document.getElementById("song_list");
    let stopButton = document.getElementById("stop");
    stopButton.addEventListener("click", async function(){
        try{
            await axios.get(`${basePath}/stop`);
        }catch(error){
            console.log(error);
        }
    }, false);

    try{
        let response = await axios.get(`${basePath}/songlist`);
        available_songs = response.data.message;
    }catch(error){
        // Put something here.
    }
    for(let name of available_songs){
        new_button = document.createElement("button");
        new_button.innerHTML = name.substr(0, name.length-4).replaceAll("_", " ");
        new_button.addEventListener("click", async function(){
            try{
                await axios.get(`${basePath}/play/${name}`);
            }catch(error){
                console.log(error);
            }
        }, false);
        songDiv.appendChild(new_button);
    }
}

window.addEventListener("load", init, false);