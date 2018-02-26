
//set up microphone listener with SpeechRecognition API
const SpeechRecognition = window.SpeechRecognition||window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = false;//only want info to be sent to server once the person has finished speaking

//set up text to audio with Speech Synthesis API
const synth = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance();

synthVoice = text => {//function for the browser to speak text that is fed to it - will say what APIAI sends back as responses to what the web speech api recognized the user saying and was sent to the server
    console.log(utterance);
    utterance.text = text;//set the text to be spoken
    utterance.volume = 2;
    utterance.rate = .8;
    synth.speak(utterance);//speak those words
}

//opening message
synthVoice("Thank you for visiting with me. I am currently undergoing a lot of changes and am adding new features. Currently, you can check the weather, talk with me and get spotify results for songs. However, none of the other features work right now. Please visit me again to test those features out. Thanks!");

//set up socket.io
const socket = io();

//media hooks that will direct user speech in right direction
let music=false,video=false,tweet=false;
//music searches
let songSearch=false,musicianSearch=false,albumSearch=false;
//tweets is the only other media that has a second prompt that must be answered before searching
let usernameSearch=false,keywordSearch=false;
//once youtube is recognized as the search, then going to do straight search - no need for more information

//event listener for when the "Speak" button is clicked
//handles some css but most importantly starts the web speech api speech recognition to pick up on audio input
document.querySelector(".btn-listen").addEventListener("click",()=>{
    document.querySelector(".mic").classList.add("glow");
    document.querySelector(".btn-listen").classList.add("record");
    document.querySelector(".btn-listen").textContent = "Listening";
    recognition.start();
})

const verification = document.querySelector(".verificationForm");
const submit = document.querySelector(".submit");

//event listener for the web speech api speech recognition feature - triggers when the api recognizes that the user has finished speaking
recognition.addEventListener("result",e=>{
    //some css and html changes
    document.querySelector(".mic").classList.remove("glow");
    document.querySelector(".btn-listen").classList.remove("record");
    document.querySelector(".btn-listen").textContent = "Speak";
    //the event "e" object that is returned contains the words that the user has spoken, but in text
    //get the text so that this can be passed to the server with a socket.io emit
    let last = e.results.length - 1;
    let text = e.results[last][0].transcript;
    document.querySelector(".you").textContent = `You said: ${text}`;
    let media = music||video||tweet;
    if(!media){
        socket.emit("chat message",text);//emit to the server what the API recognizes the user as saying
    } else {
        //if the user is at the point that they have provided enough information to chatty for chatty to properly search for what the user wants, present them with a box to validate what chatty heard the user state
        if(songSearch || musicianSearch || albumSearch || usernameSearch || keywordSearch || video){
            synthVoice("This is what I heard you say. Is this correct?");
            verification.classList.add("shown");
            verification.querySelector(".heard").innerHTML=text;
            verification.querySelector(".heard").value=text;
        } else {//get 
            socket.emit("chat message",text);//emit to the server what the API recognizes the user as saying
        }//getting the second part of search - search by - for spotify or twitter
    }
})


socket.on('bot reply', (botObj) => {//socket.io event listener to pick up responses from the server regarding what the APIAI said
    const replyText = botObj.aiText;
    if(botObj.type==="other"){
        document.getElementById("chatty-face").style.color = "white";
        document.getElementById("chatty-face").style.textShadow= "0rem 0rem 4rem white";
        changeIcon_switch(replyText);
        synthVoice(replyText);//pass this info to the function defined above
        document.querySelector(".user-section").style.display = "none";
        document.querySelector(".chatty-section").style.display = "block";
        document.querySelector(".chatbot").textContent = `Chatty said: ${replyText}`;//print what the APIAI responded with to the screen
    } else {
        //if phrase contains 
        changeIcon(`social-${botObj.type}`);
        
        //if music is set to true but search type is not set do the following
        if(!songSearch&&!musicianSearch&&!albumSearch&&music){ 
            songSearch = replyText.indexOf("song")>-1;
            musicianSearch = replyText.indexOf("who")>-1 || replyText.indexOf("artist")>-1 || replyText.indexOf("band")>-1;
            albumSearch = replyText.indexOf("album")>-1 || replyText.indexOf("record")>-1;
        //if tweet is set to true but search type is not set do the following
        } else if(!usernameSearch&&!keywordSearch&&tweet){
            keywordSearch = replyText.indexOf("keyword")>-1 || replyText.indexOf("topic")>-1;
            usernameSearch = replyText.indexOf("username")>-1;
        }
        music=replyText.indexOf("listen")>-1;
        video=replyText.indexOf("watch")>-1;
        tweet=replyText.indexOf("tweets")>-1;
        
        if(tweet){
            document.getElementById("chatty-face").style.color = "#00aced";
            document.getElementById("chatty-face").style.textShadow= "0rem 0rem 4rem #00aced";
        } else if(music){
            document.getElementById("chatty-face").style.color = "#1db954";
            document.getElementById("chatty-face").style.textShadow= "0rem 0rem 4rem #1db954";
        } else if(video){
            document.getElementById("chatty-face").style.color = "#ff0000";
            document.getElementById("chatty-face").style.textShadow= "0rem 0rem 4rem #ff0000";
        }

        synthVoice(replyText);//pass this info to the function defined above
        document.querySelector(".user-section").style.display = "none";
        document.querySelector(".chatty-section").style.display = "block";
        document.querySelector(".chatbot").textContent = `Chatty said: ${replyText}`;//print what the APIAI responded with to the screen        
    }
});

let currentIcon = "robot-face";
let prefix="icofont-";
let iconGroup = "icofont";

//apiai responses
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
        //weather responses from apiai
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

//setting icon to be shown for apiai weather
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

//changing the actual shown icon - weather will be true if the response is weather related and will be false if it is not
//newIcon is the icon that will replace the current icon. it is set in changeIcon_weather or changeIcon_switch above
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

//when the browser has finished speaking
utterance.onend = (e)=>{
    if(!mediaChoices){
        document.querySelector(".user-section").style.display = "block";
        document.querySelector(".chatty-section").style.display = "none";
    }
}
let mediaChoices = false;
//submitting verified information to server to get media

submit.addEventListener("click",function(){


    usernameSearch=false;
    keywordSearch=false;


    this.parentNode.classList.remove("shown");
    let searchTerm = this.parentNode.querySelector(".heard");
    if(searchTerm.innerHTML !== searchTerm.value){
        searchTerm = searchTerm.value;
    } else {
        searchTerm = searchTerm.innerHTML;
    }

    if(music===true){
        music=false;
        if(songSearch){socket.emit("music",{searchTerm,type:"song"});}
        if(musicianSearch){socket.emit("music",{searchTerm,type:"band"});}
        if(albumSearch){socket.emit("music",{searchTerm,type:"album"});}
        songSearch=false;
        musicianSearch=false;
        albumSearch=false;
    }
    this.parentNode.querySelector(".heard").innerHTML="";
    this.parentNode.querySelector(".heard").value="";
});

//for getting back music data from spotify
socket.on("music",spotifyData=>{
    const {musicData,type} = spotifyData;
    if(musicData.length>0){
        mediaChoices = true;
        synthVoice(`Please choose the ${type} that you'd like to hear from this list. You can swipe up and down to see the rest of the list`);//pass this info to the function defined above
        document.querySelector(".user-section").style.display = "none";    
        console.log(musicData);
        if(type==="song" || type==="album"){
            const musicArr = organizingMusicResults(musicData);
            formResultDOMPresentation(musicArr,type);
        } else {formResultDOMPresentation(musicData,type);}
        addChoiceBtnEventListeners();
        setSwiperFunctionality();
    } else {
        music=true;
        synthVoice("I did not find any results for this name from the list. Please try again");
        document.querySelector(".user-section").style.display = "none";
        document.querySelector(".chatty-section").style.display = "block";
    }
})

const organizingMusicResults = musicData=>{
    return musicData.map(music=>{
        const {album,artists,external_urls,name} = music;
        const albumName = album.name;
        const image = album.images[0].url;
        const artist = artists[0].name;
        const url = external_urls.spotify.replace(".com",".com/embed");
        const songName = name;
        return {albumName,image,artist,url,songName};
    })
}

const formResultDOMPresentation = (choiceList,type)=>{
    const swiperContainer = document.createElement("div");
    swiperContainer.classList.add("swiper-container");
    const swiperWrapper = document.createElement("div");
    swiperWrapper.classList.add("swiper-wrapper");
    

    choiceList.forEach(choice=>{
        if(type==="song"){const {albumName,image,artist,url,songName} = choice;}
        if(type==="album"){const {albumName,image,artist,url,songName} = choice;}
        const swiperSlide = document.createElement("div");
        swiperSlide.classList.add("swiper-slide");
        const btn = document.createElement("div");
        btn.classList.add("choose");
        btn.innerHTML = "Choose";
        const info = document.createElement("div");
        info.classList.add("info");
        if(type==="song"||type==="album"){
            info.setAttribute("url",url);
            const img = document.createElement("img");
            img.classList.add("img-thumbnail");
            img.setAttribute("src",image);
            info.appendChild(img);
        }
        const stats = document.createElement("p");
        if(type==="song"||type==="album"){stats.innerHTML=`${artist} - ${albumName} - ${songName}`;}
        else {stats.innerHTML=choice}
        info.appendChild(stats);
        swiperSlide.appendChild(btn);
        swiperSlide.appendChild(info);
        swiperWrapper.appendChild(swiperSlide);
    })

    swiperContainer.appendChild(swiperWrapper);
    document.querySelector("body").appendChild(swiperContainer);

}

const setSwiperFunctionality = ()=>{
    var swiper = new Swiper('.swiper-container', {
        direction: 'vertical'
    });        
}

const addChoiceBtnEventListeners=()=>{
    document.querySelectorAll(".choose").forEach(btn=>{
        btn.addEventListener("click",function(){
            mediaChoices = false;
            const spotify = document.querySelector(".spotify");
            spotify.classList.add("shown");
            spotify.setAttribute("src",this.parentNode.querySelector(".info").getAttribute("url"));
            document.querySelector(".user-section").style.display = "block";
            document.querySelector(".chatty-section").style.display = "none";
            document.querySelector("body").removeChild(document.querySelector(".swiper-container"));
        });
    })
}

