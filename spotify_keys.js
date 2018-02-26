var SpotifyWebApi = require('spotify-web-api-node');
 
// credentials are optional
var spotifykeys = new SpotifyWebApi({
  clientId : 'b4d1e75c17c940be898b93be7f757584',
  clientSecret : '7629d7c321154ed3a4d576008ddfb291'
});

module.exports = spotifykeys;