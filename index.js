'use strict';
const http = require('http');
const host = 'api.openweathermap.org';
const openWeatherMapAPIKey = API_KEY;
exports.weatherWebhook = (req, res) => {
  // Get the city and date from the request
  let city = req.body.result.parameters['geo-city']; // city is a required param
  // Get the date for the weather forecast (if present)
  let date = '';
  if (req.body.result.parameters['date']) {
    date = req.body.result.parameters['date'];
    console.log('Date: ' + date);
  }
  // Call the weather API
  callWeatherApi(city, date).then((output) => {
    // Return the results of the weather API to Dialogflow
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ 'speech': output, 'displayText': output }));
  }).catch((error) => {
    // If there is an error let the user know
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ 'speech': error, 'displayText': error }));
  });
};
function callWeatherApi (city, date) {
  return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the weather
    let path = '/data/2.5/weather?q='+city+'&units=imperial&APPID='+openWeatherMapAPIKey;
    // Make the HTTP request to get the weather
    http.get({host: host, path: path}, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        let response = JSON.parse(body);
        let location = city;
        let conditions = response['data']['weather'][0]["description"];
        let currTempF = response['data']["main"]["temp"];
        let maxtempF = response['data']["main"]["temp_max"];
        let mintempF = response['data']["main"]["temp_min"];
        // Create response
        let output = `Weather conditions in ${location}. 
        ${conditions} with a current temperature of ${currTempF}°F. 
        Forecasted high of ${maxtempF}°F and a low of ${mintempF}°F.`;
        // Resolve the promise with the output text
        resolve(output);
      });
      res.on('error', (error) => {
        reject(error);
      });
    });
  });
}