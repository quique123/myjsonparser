'use strict';

process.env.DEBUG = 'actions-on-google:*';

let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');

let app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));

app.post('/', function (request, response) {
  console.log('headers: ' + JSON.stringify(request.headers));
  console.log('body: ' + JSON.stringify(request.body));

  const assistant = new Assistant({request: request, response: response});
  //response.sendStatus(200); // OK
  function generateAnswer(assistant) {
    console.log('check parameter');
    let guess = parseInt(assistant.getArgument('check_guess'));
    console.log(guess);
}
  
});

// Start the server
var server = app.listen(app.get('port'), function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
