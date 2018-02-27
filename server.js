//add getting the weather here - or maybe in the apiai webhooks

//set up Express.js server
const express = require("express");
//create an Express app
const app = express();
//serve the static css and js files as well as the html file
app.use(express.static(__dirname+"/views"));
app.use(express.static(__dirname+"/public"));

const spotify = require("./mediaQs/spotify");
const port = process.env.PORT||5000;
//set up server to listen on port
const server = app.listen(port);

//set up apiai for interpreting questions  asked of it
const apiai = require('apiai')(process.env.APIAI_KEY||require("../../secrets/apiai"));
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
		console.log(text);
        //pass the text sent from the client to the apiai engine that will interpret and respond to text passed from clients
        let apiaiReq = apiai.textRequest(text,{
            sessionId: process.env.SESSION_ID
        })
		//when apiai has a response, emit it back to the client
		//if the response is related to spotify, youtube or twitter, pass that information back to client
        apiaiReq.on("response",response=>{
			let aiText = response.result.fulfillment.speech;
			if(aiText.indexOf("song")>-1||aiText.indexOf("listen")>-1){
				socket.emit("bot reply",{aiText,type:"spotify"});
			} else if(aiText.indexOf("Twitter")>-1){
				socket.emit("bot reply",{aiText,type:"twitter"});
			} else if(aiText.indexOf("YouTube")>-1){
				socket.emit("bot reply",{aiText,type:"youtube"});
			} else {
				socket.emit("bot reply",{aiText,type:"other"});
			}
        })
        //if error, show error in console
        apiaiReq.on("error",error=>{
            console.log(error);
        })//end apiai utilization
        apiaiReq.end();
	})
	socket.on("music",searchObj=>{
		console.log(searchObj);
		const {searchTerm,type} = searchObj;
		if(type==="song"){
			spotify.spotifySongSearch(searchTerm,socket);
		} else if(type==="band"){
			spotify.spotifyBandSearch_partOne(searchTerm,socket);
		} else if(type==="album"){
			spotify.spotifyAlbumSearch(searchTerm,socket);
		}
	})
	socket.on("band choice",bandName=>{
		spotify.spotifyBandSearch_partTwo(bandName,socket);
	})
})


// //function for searching by screenname
// function twittByName(screenName){
// 	var params = {screen_name: screenName};//passed to twitter get function to specify that the search should be screen name
// 	client.get('statuses/user_timeline', params, function(error, tweets, response_tw) {
// 	  if (!error) {
// 	    for (var i = 0 ; i < tweets.length ; i++ ) {
// 	    	//creates a string to print to console
// 	    	var statement = "--------------------------------------";
// 	    	statement += "\nTweet # " + (i+1) + ":";
// 	    	statement += "\n" + tweets[i].created_at 
// 	    	statement += "\n" + tweets[i].text;
// 			console.log(statement);
// 	    }
// 	    doAnotherAction();//runs the function asking user if they want to do another action which then depending on answer will either quit program or run the user choice function again
// 	  } else {//if error, prints that the user does not exist - I like this more than the returned error from the get function
// 	  	console.log("Error: That user does not exist!");
// 	  	tweeter(1);
// 	  }	
// 	});
// }

// //function for searching by keyword
// function twittByKeyW(keyword){
// 	var params = {q: keyword};//passed to twitter get function to specify that the search should be keyword
// 	client.get("search/tweets",params,function(error, tweets, response_tw){
// 		var tweetArray = tweets.statuses;
// 		for ( var i = 0 ; i < tweetArray.length ; i++){
// 			var statement = "--------------------------------------";
// 			statement += "\nAt " + tweetArray[i].created_at;
// 			statement += "\n" + tweetArray[i].user.screen_name + " wrote: ";
// 			statement += "\n" + tweetArray[i].text;
// 			console.log(statement);
// 		}
// 		doAnotherAction();//runs the function asking user if they want to do another action which then depending on answer will either quit program or run the user choice function again
// 	})
// }

