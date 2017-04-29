'use strict';

process.env.DEBUG = 'actions-on-google:*';

let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');

let app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));

const GENERATE_ANSWER_ACTION = 'generate_answer';
const CHECK_GUESS_ACTION = 'check_guess';

app.post('/', function (request, response) {
  console.log('headers: ' + JSON.stringify(request.headers));
  console.log('body: ' + JSON.stringify(request.body));

  const assistant = new Assistant({request: request, response: response});
  //response.sendStatus(200); // OK
  
   function generateAnswer(assistant) {
     console.log('checkea parameter');
     // var answer = getRandomNumber(0, 100);
     //	assistant.data.answer = answer;
     let guess = parseInt(assistant.getArgument('check_guess'));
     console.log(guess);
     assistant.ask('I\'m thinking of a number from 0 and 100. What\'s your first guess?');
   }
  
   function checkGuess(assistant) {
		  console.log('checkGuess');
		  let answer = assistant.data.answer;
		  let guess = parseInt(assistant.getArgument('guess')); //getArgument('state-of-component')
		  if (answer > guess) {
		   assistant.ask('It\'s higher than ' + guess + '. What\'s your next guess?');
		  } else if (answer < guess) {
		   assistant.ask('It\'s lower than ' + guess + '. Next guess?');
		  } else {
			assistant.tell('Congratulations, that\'s it! I was thinking of ' + answer);
		  }
 	  }
  //MAP ACTIONS to functions
	  let actionMap = new Map();
	  actionMap.set(GENERATE_ANSWER_ACTION, generateAnswer);
	  actionMap.set(CHECK_GUESS_ACTION, checkGuess);

	  assistant.handleRequest(actionMap);
});

// Start the server
var server = app.listen(app.get('port'), function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
