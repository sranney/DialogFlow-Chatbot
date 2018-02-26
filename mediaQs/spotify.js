var spotify = require('spotify-web-api-node');
var spotifyAPI = require("../spotify_keys.js");

module.exports = {
    spotifySongSearch: (songName,socket)=>{
        var searchedSong = songName;
        var songs = [];//for pushing found songs to 
        var songIDs = [];//for pushing ids of songs to - for same purpose as albums above
        spotifyAPI.clientCredentialsGrant()
        .then(function(data) {
            // Save the access token so that it's used in future calls
            spotifyAPI.setAccessToken(data.body['access_token']);
            return spotifyAPI.searchTracks(searchedSong)//search for song
        }, function(err) {
            console.log('Something went wrong when retrieving an access token', err.message);
        }).then(function(data){//for data returned from searchTracks above
            var musicData = data.body.tracks.items;
            socket.emit("music",{musicData,type:"song"});
        });
    },
    spotifyBandSearch: (bandName,socket)=>{
        spotifyAPI.clientCredentialsGrant()
        .then(function(data) {
            // Save the access token so that it's used in future calls
            spotifyAPI.setAccessToken(data.body['access_token']);
            return spotifyAPI.searchArtists(bandName)//performs api search for band name
        }, function(err) {
            console.log('Something went wrong when retrieving an access token', err.message);
        }).then(function(data){
            var artistResults = data.body.artists.items;
            var artists = [];//often times the result of the search will return multiple bands with the name
            //for instance, if you search for saxophonist Charlie Parker, you'd get Charlie Parker, Charlie Parker Quintet, Charlie Parker Quartet and a bunch of other names
            //so I'm building this so that the user can specify the specific result that they want
            //I do this by passing all of the results to an artists array, which I then present as an inquirer prompt list
            var selectedAlbum,selectedArtist;
    
            for ( var i = 0 ; i < artistResults.length ; i++ ) {
                artists.push(artistResults[i].name);
            }
            socket.emit("music",{musicData,type:"band"})
        });
    }
}