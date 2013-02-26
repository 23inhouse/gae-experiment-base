// participant variables
var subjectID;
var condition;
var demographics;

// experimental variables 
var currTrainTrial = 0;
var currTestTrial = 0;
var currBlock = 0;

var maxTrainTrial = 5;
var maxTestTrial = 5;
var maxBlock = 3;

// TODO: fill in numbers
var trainTrialStimuli = [130, -130, -20, 50, -10, -20, 70, 170, 120, 100, -120, 10, -30, 160, 140];
var testTrialStimuli = [160, -150, 120, -50, -150, 130, -80, -10, -40, 170, -120, 20, 20, -50, -170];

// experimental conditions
var colourCondition;

// canvas cariables
var width = 800;
var height = 400;
var context;
var canvas;

// this function runs automatically when the page is loaded
$(document).ready(function() {
    // initialize canvas drawing
    canvas = document.getElementById("drawing");
    canvas.width = width;
    canvas.height = height;
    context = canvas.getContext("2d");
    
    // hide canvas drawing for now, otherwise it takes up space
    $('#drawing').hide();

    // hide buttons
    $('#blue').hide();
    $('#green').hide();

    // generate a subject ID by generating a random number between 1 and 1000000
    subjectID = Math.round(Math.random()*1000000);

    // randomize experimental conditions
    // TODO: fix colour/buttons etc.
    r = Math.ceil(Math.random()*2); // generate random number
    if(r == 1) {
	colourCondition = 'red';
    }
    else if(r == 2) {
	colourCondition = 'blue';
    }

    // after initializating variables above, display the experiment instructions
    // showDemographics(); TODO: put this back later

    showInstructions();
})

function showDemographics() {
    $('#next').unbind();

    // modify here if you want to get different demographic information
    // DEFAULT: username, age, gender, country
    $('#demographics').html('<form><label for="user">Unique User ID:</label><input name="user" /><br /><br />\
<label for="age">Age:</label><input name="age" /><br /><br />\
<label for="gender">Gender:</label><input type="radio" name="gender" value="male" /> Male &nbsp; <input type="radio" name="gender" value="female" /> Female<br /><br />\
<label for="country">Country:</label><input name="country" /></form>');

    $('#next').click(validateDemographics)
    
}

function validateDemographics() {
    $('#next').unbind();

    demographics = $('form').serializeArray();

    var ok = true;
    for (var i = 0; i < demographics.length; i++) {
	// test to only include alphanumeric characters
	if( /[^a-zA-Z0-9]/.test( demographics[i]["value"] ) ) {
	    alert('Please only use alphanumeric characters.');
	    ok = false;
	}

	// TODO: validate age

	// test for empty answers
	if (demographics[i]["value"] == "") {
	    alert('Please fill out all fields.'); // TODO: make alert only pop-up once
	    ok = false;
	}
    }
    
    if (!ok) {
	showDemographics();
    }
    else {
	$('#demographics').hide();
	showInstructions();
    }
}

// experiment functions

// TODO: input options

// displays experiment instructions
function showInstructions() {
    $('#next').unbind();

    $('#instructions').text('Here are the experiment instructions.');

    $('#next').click(trainTrial)
}

function trainTrial() {
    imageClear();

    // unbind buttons
    $('#next').unbind();
    $('#blue').unbind();
    $('#green').unbind();

    // hide response buttons
    $('#blue').hide();
    $('#green').hide();

    // show next button
    $('#next').show();

    // display training trial instructions
    $('#instructions').text('Here are some lines.');

    // draw training stimuli in canvas
    $('#drawing').show();
    // TODO: add line parameters
    var currAngle = trainTrialStimuli[5*currBlock + currTrainTrial];

    if(currAngle > 0 && currAngle < 90 || currAngle > -180 && currAngle < -90)
	drawLine(currAngle, colourCondition);
    else
	drawLine(currAngle, 'green');
    
    // increment training trial counter
    currTrainTrial++;

    if(currTrainTrial < maxTrainTrial)
	$('#next').click(trainTrial) // go to next training trial
    else
	$('#next').click(testTrial) // proceed to test trial
}

function testTrial() {
    imageClear();

    // unbind buttons, necessary to do so otherwise multiple calls will be made each time the button is clicked!
    $('#next').unbind();
    $('#blue').unbind();
    $('#green').unbind();

    // hide next button

    $('#next').hide();

    // show response buttons
    $('#blue').show();
    $('#green').show();

    // display test trial instructions
    $('#instructions').text('What colour should this line be?');

    // TODO: draw test stimuli in canvas
    var currAngle = testTrialStimuli[5*currBlock + currTestTrial];
    drawLine(currAngle, 'black');

    // TODO: response option

    // TODO: save experiment data

    // increment test trial counter
    currTestTrial++;
    
    // TODO: embed this inside the next click function?
    if(currTestTrial < maxTestTrial) {
	$('#blue').click(testTrial);
	$('#green').click(testTrial);
    }
    else {
	// increment block 
	currBlock++;

	if(currBlock < maxBlock) {
	    currTrainTrial = 0;
	    currTestTrial = 0;
	    $('#blue').click(trainTrial);
	    $('#green').click(trainTrial);
	}
	else {
	    finishExperiment();
	}
    }
}

function finishExperiment() {
    // hide canvas element
    $('#drawing').hide();

    // hide buttons
    $('#next').hide(); 
    $('#blue').hide();
    $('#green').hide();

    $('#instructions').text('You have completed the experiment! If you are doing the experiment from Mechanical Turk, please enter the code 92nF72zm0 to complete the HIT.');
}

// save experiment data with ajax
function saveData(args) {
    var data = args;

    // TODO: add demographics info to data

    // TODO: fill in details here, i.e. database table information (replace "experiment" with your own database table name in the data section)
    $.ajax({
	type: 'post',
	cache: false,
	url: 'submit_data_mysql.php',
	data: {"table": "experiment", "json": JSON.stringify(data)},
	success: function(data) { console.log(data); }
    });
}

// canvas functions

// clears the whole canvas area
function imageClear() {
    context.fillStyle = '#ffffff'; // work around for Chrome
    context.fillRect(0, 0, canvas.width, canvas.height); // fill in the canvas with white
    canvas.width = canvas.width; // clears the canvas 
}

// draw experimental stimuli using canvas functions
function drawLine(degrees, colour) {
    var radians = degrees * (Math.PI/180)
    var length = 200;

    // set width of line
    context.lineWidth = 5;
    
    // set line colour
    context.strokeStyle = colour;

    // draw line
    context.beginPath();
    context.moveTo(width/2 - length*Math.cos(radians), height/2 - length*Math.sin(radians));
    context.lineTo(width/2 + length*Math.cos(radians), height/2 + length*Math.sin(radians));
    context.closePath();
    context.stroke();
}
