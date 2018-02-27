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
    spotifyBandSearch_partOne: (bandName,socket)=>{
        console.log(bandName);
        spotifyAPI.clientCredentialsGrant()
        .then(function(data) {
            // Save the access token so that it's used in future calls
            spotifyAPI.setAccessToken(data.body['access_token']);
            return spotifyAPI.searchArtists(bandName)//performs api search for band name
        }, function(err) {
            console.log('Something went wrong when retrieving an access token', err.message);
        }).then(function(data){
            var artistResults = data.body.artists.items;
            var musicData = [];//often times the result of the search will return multiple bands with the name
            //for instance, if you search for saxophonist Charlie Parker, you'd get Charlie Parker, Charlie Parker Quintet, Charlie Parker Quartet and a bunch of other names
            //so I'm building this so that the user can specify the specific result that they want
            //I do this by passing all of the results to an artists array, which I then present as an inquirer prompt list
            var selectedAlbum,selectedArtist;
    
            for ( var i = 0 ; i < artistResults.length ; i++ ) {
                musicData.push(artistResults[i].name);
            }
            console.log(musicData);
            socket.emit("music",{musicData,type:"band"})
        });
    },
    spotifyBandSearch_partTwo: (bandName,socket)=>{
        console.log(bandName);
        spotifyAPI.clientCredentialsGrant()
        .then(function(data) {
            // Save the access token so that it's used in future calls
            spotifyAPI.setAccessToken(data.body['access_token']);
            return spotifyAPI.searchAlbums("artist:" + bandName)
        }).then(function(data2){
			var artistDisco = data2.body.albums.items;
			var albums = artistDisco.map(album=>{
                const url = album.external_urls.spotify.replace(".com",".com/embed");
                const image = album.images[0].url
                return {artist: bandName,albumName:album.name,albumId:album.id,url,image}
            });
            socket.emit("music",{musicData:albums,type:"album",artistDisco,data2});

        })
    },
    spotifyAlbumSearch: (albumName,socket)=>{
        spotifyAPI.clientCredentialsGrant()//send credentials and perform a spotify search on album
        .then(function(data) {
            // Save the access token so that it's used in future calls
            spotifyAPI.setAccessToken(data.body['access_token']);
            return spotifyAPI.searchAlbums(albumName)
        }, function(err) {
            console.log('Something went wrong when retrieving an access token', err.message);
        }).then(function(data){
            var albumResults = data.body.albums.items;
            console.log(albumResults[0].artist[0].name);
			// var albums = albumResults.map(album=>{
            //     const url = album.external_urls.spotify.replace(".com",".com/embed");
            //     const image = album.images[0].url
            //     return {artist: album.artist[0].name,albumName:album.name,albumId:album.id,url,image}
            // });    
            // socket.emit("music",{musicData:albums,type:"album",albumResults,data});        
            socket.emit("music",{musicData:albumResults,type:"album",albumResults,data});        
        })            
    }    
}