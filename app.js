'use strict';
require('dotenv').config();

const PythonShell = require('python-shell');
const fs = require('fs');
const express = require('express');
const bodyParser= require('body-parser');
const path = require('path')
const app = express();

process.env.DEBUG = 'actions-on-google:*';
let Assistant = require('actions-on-google').ApiAiAssistant;
//REMOVE let express = require('express');
//REMOVE let bodyParser = require('body-parser');
//REMOVE let app = express();
//REMOVE app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));

const GENERATE_ANSWER_ACTION = 'generate_answer';
const CHECK_GUESS_ACTION = 'check_guess';

// Switch states held in memory
const switches = [];

// Read state from saveState.json, populate switches array
var readableStream = fs.createReadStream('saveState.json');
var data = ''

readableStream.on('data', function(chunk) {
    data+=chunk;
});

readableStream.on('end', function() {
  var parsed = JSON.parse(data);
  for (var i=0;i<parsed.switches.length;i++){
    switches.push(new Switch(parsed.switches[i]))
  }
});




// Switch Model
// Expects an object:{ which is either passed inside of switchValues for existing or created with defaults using ||
  // id:"sw" + number,
  // state: "on" or "off",
  // name: any name you want to display. Defaults to "switch"
// }

function Switch(switchValues){
  this.id = switchValues.id || "sw"
  this.state = switchValues.state || "off"
  this.name = switchValues.name || "switch"
  this.toggle = function(){
    if(this.state === "on"){
      this.setState("off")
    } 
    else{
      this.setState("on");
    }
  }
//   this.setState = function(state,component){
//   var compNumberId = 0;
//   switch(component) {
//     case "lights":
//         compNumberId = 1;
//         break;
//     case "patio-lights":
//         compNumberId = 2;
//         break;
//     case "water":
//	   compNumberId = 3;
//	   break;
//     default:
//         console.log('Sorry, no component specified');
//	   Call assistant.ask('which component, which state');
//    }
// var str = state === "on" ? onString(compNumberId) : offString(compNumberId);
  this.setState = function(state){
    var str = state === "on" ? onString(this.id[2]) : offString(this.id[2]);
    console.log('setStateFunction');
    console.log(str);//ADDING NEW COMPONENTS...ADDING NEW COMPONENTS logs=./public/python/sw1_off.py
    PythonShell.run(str, function (err) {
      if (!process.env.DEV){
        if (err) throw err;
      } 
    });
    this.state = state
  }
  // Invokes setState on init to set the switch to its last recalled state.
  this.setState(this.state);
}    

// needed due to a quirk with PythonShell
function onString(number){
  return './public/python/sw' + number + '_on.py'
}
function offString(number){
  return './public/python/sw' + number + '_off.py'
}




// Switch Lookup
function getSwitch(string){
  return switches.filter(function(element){
    return element.id === string;
  })[0]
}

// Updates saveState.json
function saveState (){
  var formattedState = {
    switches: switches
  }
  fs.writeFile('./saveState.json', JSON.stringify(formattedState) )
}


//Server Configuration
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));

// If you have a frontend, drop it in the Public folder with an entry point of index.html
app.get('/', function(req, res){
  res.sendFile('index');
})

// Switch Routes for API
app.get('/api/switches', function(req, res){
  res.send(switches);
})

app.get('/api/switches/:id', function(req, res){
  var found = getSwitch(req.params.id);
  res.json(found);
})

// app.post('/', function (request, response) { //will cause issues

app.post('/api/switches/:id', function(req, res){
   console.log('headers: ' + JSON.stringify(req.headers));
   console.log('body: ' + JSON.stringify(req.body));
   console.log('params: ' + JSON.stringify(req.params));//ADDING NEW COMPONENTS...ADDING NEW COMPONENTS logs =params: {"id":"sw1"}

   const assistant = new Assistant({request: req, response: res});
   function generateAnswer(assistant) {
      console.log('genera answer');
//REMOVE    var answer = getRandomNumber(0, 100);
//REMOVE    assistant.data.answer = answer;
      assistant.ask('I\'m thinking of a number from 0 and 100. What\'s your first guess?');
   }
   
   function checkGuess(assistant) {
 	console.log('revisear guess');
 	let guess = parseInt(assistant.getArgument('check_guess')); //getArgument('state-of-component')
	console.log(guess);
 	if (guess === 65) {
 	   console.log('SUCCESS guess=65');
 	} else {
 	   assistant.tell('FAILURE Nothing yet');
 	}
    }
//   //MAP ACTIONS to functions
 	  let actionMap = new Map();
 	  actionMap.set(GENERATE_ANSWER_ACTION, generateAnswer);
 	  actionMap.set(CHECK_GUESS_ACTION, checkGuess);
 
 	  assistant.handleRequest(actionMap);

// Simple password query in the url string. Ex: POST to localhost:8000/API/switches/sw1?password=test
  if (req.query.password === process.env.PASS){
    var foundSwitch = getSwitch(req.params.id);
    console.log('theFoundSwitchIs: ');
    console.log(foundSwitch);//ADDING NEW COMPONENTS...ADDING NEW COMPONENTS logs=
//Switch {
//id: 'sw1',
//state: 'off',
//name: 'Koko\'s Lamp',
//toggle: [Function],
//setState: [Function] }

// THIS CODE WILL REPLACE THE foundSwitch.toggle() BELOW
//	if (guess === 99) {
//		foundSwitch.setState("on");
//	} else {
//		foundSwitch.setState("off");
//	}
// THIS CODE WILL REPLACE THE foundSwitch.toggle() BELOW
	  
    if(!(req.query.command === "on" || req.query.command === "off")){
      foundSwitch.toggle();
	    //THIS IS THE IF TO BE MODIFIED TO if req.query.command === "on" then console.log("ON WAS PASSED IN"); 
    } else {
      // foundSwitch.setState(soc,comp)
      foundSwitch.setState(req.query.command)
    }

    saveState();
    console.log("postSwitch "+JSON.stringify(foundSwitch));
    res.json(foundSwitch);
  }
  else {
    console.log("invalid password")
    res.send("try again")
  }
  
})

app.listen(process.env.PORT, function(){
 console.log('Listening on port ' + process.env.PORT);
})
