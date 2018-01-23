//set up microphone listener with SpeechRecognition API
const SpeechRecognition = window.SpeechRecognition||window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = false;//only want info to be sent to server once the person has finished speaking

//set up text to audio with Speech Synthesis API
const synth = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance();

//set up socket.io
const socket = io();


//event listener for when the "Speak" button is clicked
//handles some css but most importantly starts the web speech api speech recognition to pick up on audio input
document.querySelector(".btn-listen").addEventListener("click",()=>{
    document.querySelector(".mic").classList.add("glow");
    document.querySelector(".btn-listen").classList.add("record");
    document.querySelector(".btn-listen").textContent = "Listening";
    recognition.start();
})

//event listener for the web speech api speech recognition feature - triggers when the api recognizes that the user has finished speaking
recognition.addEventListener("result",(e)=>{
    //some css and html changes
    document.querySelector(".mic").classList.remove("glow");
    document.querySelector(".btn-listen").classList.remove("record");
    document.querySelector(".btn-listen").textContent = "Speak";
    //the event "e" object that is returned contains the words that the user has spoken, but in text
    //get the text so that this can be passed to the server with a socket.io emit
    let last = e.results.length - 1;
    let text = e.results[last][0].transcript;
    document.querySelector(".you").textContent = `You said: ${text}`;
    socket.emit("chat message",text);//emit to the server what the API recognizes the user as saying
})

synthVoice = (text) => {//function for the browser to speak text that is fed to it - will say what APIAI sends back as responses to what the web speech api recognized the user saying and was sent to the server
    console.log(utterance);
    utterance.text = text;//set the text to be spoken
    utterance.volume = 2;
    utterance.rate = .8;
    synth.speak(utterance);//speak those words
}

socket.on('bot reply', (replyText) => {//socket.io event listener to pick up responses from the server regarding what the APIAI said
    changeIcon_switch(replyText);
    synthVoice(replyText);//pass this info to the function defined above
    document.querySelector(".user-section").style.display = "none";
    document.querySelector(".chatty-section").style.display = "block";
    document.querySelector(".chatbot").textContent = `Chatty said: ${replyText}`;//print what the APIAI responded with to the screen
});

let currentIcon = "robot-face";
let prefix="icofont-";
let iconGroup = "icofont";

changeIcon_switch = (replyText)=>{
    switch(replyText){
        case "moo, I am a cow, moo, moo, moo":
            changeIcon("animal-cow");
            break;
        case "I baked you a cake, do you like?":
            changeIcon("layered-cake");
            break;
        case "It is an honor to be at your service, master":
            changeIcon("robot");    
            break;
        case "How can I help you?":
            changeIcon("help-robot");        
            break;
        case "woof, I am a dog, woof, woof, woof":
            changeIcon("animal-dog-alt");         
            break;
        case "happy as a dog":
            changeIcon("animal-dog-alt"); 
            break;
        case "I'll show you bad":
            changeIcon("angry-monster"); 
            break;
        case "I've got one of these too":
            changeIcon("microphone"); 
            break; 
        case "I live to answer your questions":
            changeIcon("brain-alt"); 
            break;
        case "I love playing tetris":
            changeIcon("game-console"); 
            break;
        case "I love playing pong":
            changeIcon("game-console"); 
            break;
        case "yes. carving pumpkins. do you like?":
            changeIcon("halloween-pumpkin"); 
            break; 
        case "that's right, I'm surprised you figured that out.":
            changeIcon("king-monster"); 
            break;
        case "ha. hahaha. hahaha":            
            changeIcon("emo-simple-smile");
            break;
        case "For what city would you like the weather?":
            changeIcon("ui-weather")                 ;
            break;
        default:
            if(replyText.indexOf("Weather conditions in ")>-1){
                changeIcon_weather(replyText);
            }
            else {
                changeIcon("robot-face"); 
            }
            break;
    }
}

changeIcon_weather = text => {
    if(text.match(/cloud/g)){
        changeIcon("cloud",true);
    } else if(text.match(/overcast/gi)){
        changeIcon("day-cloudy",true);
    } else if(text.match(/hail/gi)){
        changeIcon("hail",true);
    } else if(text.match(/hurricane/gi)){
        changeIcon("hurricane",true);
    } else if(text.match(/rain/gi)){
        changeIcon("rain",true);
    } else if(text.match(/snow/gi)){
        if(text.match(/windy/gi)){
            changeIcon("snowy-windy");
        } else {
            changeIcon("snow");
        }
    } else if(text.match(/clear/gi)){
        changeIcon("day-sunny",true);
    } else if(text.match(/sun/gi)){
        changeIcon("day-sunny",true);
    } else if(text.match(/wind/gi)){
        changeIcon("windy");
    } else if(text.match(/haze/gi)){
        changeIcon("dust",true);
    } else if(text.match(/smoke/gi)){
        changeIcon("smoke",true);
    } else if(text.match(/smog/gi)){
        changeIcon("smog",true);
    } else if(text.match(/fog/gi)){
        changeIcon("fog",true);
    } else if(text.match(/eclipse/gi)){
        if(text.match(/lunar/gi)){
            changeIcon("lunar-eclipse",true);
        } else {
            changeIcon("solar-eclipse",true)
        }
    } else if(text.match(/shower/gi)){
        changeIcon("showers",true);
    } else if(text.match(/sleet/gi)){
        changeIcon("sleet",true);
    } else if(text.match(/sprinkle/gi)){
        changeIcon("sprinkle",true);
    } else if(text.match(/lightning/gi)){
        changeIcon("lightning",true);
    } else if(text.match(/earthquake/gi)){
        changeIcon("earthquake",true);
    } else if(text.match(/flood/gi)){
        changeIcon("flood",true);
    } else if(text.match(/tornado/gi)){
        changeIcon("tornado",true);
    }
    
}

changeIcon = (newIcon,weather)=>{
    const chattyFace = document.getElementById("chatty-face");
    chattyFace.classList.remove(iconGroup);
    chattyFace.classList.remove(`${prefix}${currentIcon}`);
    if(weather){
        chattyFace.classList.add(`wi`);
        chattyFace.classList.add(`wi-${newIcon}`);
        currentIcon=newIcon;
        prefix='wi-';
        iconGroup="wi";
    } else {
        chattyFace.classList.add(`icofont`);
        chattyFace.classList.add(`icofont-${newIcon}`);
        currentIcon=newIcon;
        prefix='icofont-';  
        iconGroup= "icofont";  
    }
}

utterance.onend = (e)=>{
    document.querySelector(".user-section").style.display = "block";
    document.querySelector(".chatty-section").style.display = "none";
}