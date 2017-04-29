process.env.DEBUG = 'actions-on-google:*';
let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');
let app = express();
app.use(bodyParser.json({type: 'application/json'}));
const assistant = new Assistant({request: request, response: response});

function generateAnswer(assistant) {
console.log('check parameter');
let guess = parseInt(assistant.getArgument('check_guess'));
console.log(guess);
}
