//add getting the weather here - or maybe in the apiai webhooks

//set up Express.js server
const express = require("express");
//create an Express app
const app = express();
//serve the static css and js files as well as the html file
app.use(express.static(__dirname+"/views"));
app.use(express.static(__dirname+"/public"));

const port = process.env.port || 5000;
//set up server to listen on port
const server = app.listen(port);

//set up apiai for interpreting questions  asked of it
const apiai = require('apiai')(process.env.APIAI_KEY);
//set up socket.io to listen for client emits on the same server
const io = require("socket.io")(server);

//serve the html file for when the user goes to a webpage
app.get("/",(req,res)=>{
    res.sendFile("index.html");
})

//event listener for web socket connections
io.on("connection",(socket)=>{
    //event listener for client socket.io emits
    socket.on("chat message",text=>{
        //pass the text sent from the client to the apiai engine that will interpret and respond to text passed from clients
        let apiaiReq = apiai.textRequest(text,{
            sessionId: process.env.SESSION_ID
        })
        //when apiai has a response, emit it back to the client
        apiaiReq.on("response",response=>{
            let aiText = response.result.fulfillment.speech;
            socket.emit("bot reply",aiText);
        })
        //if error, show error in console
        apiaiReq.on("error",error=>{
            console.log(error);
        })//end apiai utilization
        apiaiReq.end();
    })
})