gae-experiment-base
==================

Base experiment code for web experiments hosted on Google App Engine For Python (2.7)

### Requires:

- Python 2.7
- Google AppEngineLauncher for Python: [here](https://developers.google.com/appengine/downloads#Google_App_Engine_SDK_for_Python)
- Google App command line tools (for downloading data from server). This must be done when starting Google AppEngineLauncher

### Files and what they do:

- In exp folder:  
   - app.yaml: (often needs to be changed - app name and version number)
      - defines app name and version number (along with what version of python to use)
      - Handlers section - specify how URLs should be routed to the files in your folder (can be left alone)
      - Libraries section - which libraries are used (can be left alone)
      - Builtins - turns remote_api on (necessary for data download)
   - backend.py: (can be left alone in most cases)
      - loads index.html (via JINJA) and displays it
      - defines the structure of the data to save (DataObject section)
      - is the code that first gets called when people go to the experiment page
   - backend.pyc: is automatically generated by python based on backend.py
   - bulkloader.yaml: (can be left alone)
      - tells the data downloader how the data from Google will be formatted
      - must match backend.py
   - index.html: actual html of the experiment that is loaded by backend.py (often will be changed to add new buttons/sliders/etc)
- In css folder:
   - style.css: specifies css for index.html and experiment.s (usually can be left alone)
- In html folder:
   - many files that are loaded by experiment.js during the experiment
- In js folder:
   - init_exp.js: only javascript file loaded by index.html (except for JQuery), loads all other javascript files. This file is unlikely to require changes.
   - support_fcns.js: routine javascript functions to handle loading and reading the demographics information, loading the instructions, checking the instruction comprehension questions, writing the data to the server, and clearing/displaying the canvas and buttons. This file is unlikely to require changes.
   - exp_logic.js: guts of the experiment. Will need to be changed for your experiment, see details below.
      
- In analysis folder:
   - read.R: read in the raw file downloaded from App Engine and parse the JSON to create (and save) an RData object (calls parser.py). You might need to change input_file (line 2) to match the name of the file you download it from Google App Engine if the name gets changed.
   - parser.py: parses raw GAE result (it assumes a tab-delimited file) into CSV file suitable to be read into R (by read.R). Takes two parameters: the file to read and the name of the file to write the results to.


# Notes about the experiment code

### How is the experiment structured:

The structure of the code:  

1. When a user goes to index.html a few things happen  
   - a number of html divs and buttons are added to the screen  
   - some support js files (jquery especially) are loaded  
   - the js file js/init_exp.js is loaded  
2. js/init_exp.js loads all other js files needed  
   - when they are finished loading, it calls the function start (which is in js/exp_logic.js)  
3. the function start sets up many things for the experiment:  
   - it builds the canvas the experiment draws stimuli on,  
   - it builds the slider,  
   - it generates a random subjectID for this user  
   - it determines which random condition this subject is in  
4. when done initializing everything, start calls showIntro (which is in js/support_fcns.js  
5. showIntro displays the experiment introduction (html/intro.html) and calls the function  showDemographics when the user clicks next.  
6. showDemographics displays a form on the screen (html/demographics.html) and calls the function validateDemographics when the user clicks next  
7. validateDemographics checks that the user wrote reasonable things for their demographics information. If they did it calls showInstructions, if they did not give reasonable info, it alerts the user and calls showDemographics again.  
8. showInstructions displays the experiment instructions (one of 2 files) and calls the function showInstructionChecks when the user clicks next  
9. showInstructionChecks displays a form on the screen (html/instruction-checks.html) and calls the function validateInstructionChecks when the user clicks next.  
10. validateInstructionChecks checks if the user answered all questions correctly, if they did it calls the function trainTrial (js/exp_logic.js), if they did not it calls showInstructions again  
11. trainTrial does multiple things:  
   - it determines which line to draw (based on the current trial, block number, and trainTrialStimuli)  
   - calls the function drawLine to draw that line  
      - the function drawLine draws a line on the canvas  
   - displays the next button  
   - increases the trial number (currTrial variable)  
   - when the user clicks next either  
      - calls testTrial if all training trials are done (maxTrainTrial)  
      - or calls trainTrial (to show the next training trial)  
12. testTrial does multiple things also:  
   - it determines which line to draw (based on current trial, block number, and testTrialStimuli)  
   - calls the function drawLine to draw that line  
   - displays the next button and either two button options or the slider (depending on which block the user is in)  
   - increases the trial number (currTrial variable)  
   - starts a timer to measure RT  
   - records what response the user makes  
   - calls the function saveTestTrial  
13. saveTestTrial does multiple things:  
   - computes the RT of the subject  
   - builds an object (exp_data) which contains all demographic data of the user, condition info, trial and block number, stimuli info, and response information  
   - calls the function saveData  
      - the function saveData takes the data passed to it and writes it to the server  
   - determines what should happen next:  
      - if all blocks have been completed, call funishExperiment function  
         - the function finishExperiment removes all buttons and displays the final thankyou message (html/instruction-finish.html)  
      - if all trials in the current block have been completed, call trainTrial (to start the next block)  
      - otherwise call testTrial to do the next trial in this block  

### To modify this code for your own experiment:

This project is designed so you need to modify the fewest number of files to change the experiment for your own task. These files will likely need to be changed:
   - most files in the html folder to reflect your instructions, conditions, thanks, etc.
   - the file js/exp_logic.js
      - you will likely need to change some of the global variables at the top of the file
      - you will likely need to change the functions testTrial and trainTrial
      - you will probably need to replace drawLine with a function to draw your stimuli
      - you might need to add different information being written to the data in the saveTestTrial function  
   - you might need to modify index.html if you add new buttons or input types

Notes: 
   - all locations in the javascript files where the slider is referenced are marked with a comment SLIDER comment.
   - all locations in the javascript files where between-subject conditions are referenced are marked with CONDITION comment.


# Running the experiment code:

### How to run locally for testing (in Chrome):

1. Open Google AppEngineLauncher
2. File -> Add Existing Application
3. Navigate to this folder
4. Click Add
5. Click Run in AppEngineLauncher
6. Navigate in browser to localhost:8080
7. Generate some data
7. To inspect the data you created, in the App Engine Launcher click on SDK Console and then on Datastore Viewer

### How to upload your experiment to the google server

1. Go to https://appengine.google.com/ and click Create Application
2. Application Identifier - only you use it but you need to know it for later
3. Application Title - this will appear as the label on the tab in the web browser of your experiment
4. Edit the first line of app.yaml to match your Application Identifier
5. In Google App Engine, click on Deploy and then enter the necessary credentials

### How to upload a new version of your experiment

1. change whatever you needed to change in the experiment
2. Edit app.yaml to have a new version number (usually by adding one)
3. In Google App Engine, click Deploy
4. click Dashboard
5. On the dashboard, click Versions (under Main in the left bar)
6. Set your new version as Default

### How to check on the data once deployed to the web

1. Open the dashboard for your experiment (via Google App Engine)
2. Click Datastore Viewer (under Data in the left bar)
3. Enjoy

# After running the experiment:

### How to download data from the GAE webpage:

enter this at the command line:  

```
appcfg.py download_data --config_file=bulkloader.yaml --filename=data.csv --kind=DataObject --url=http://<app_name>.appspot.com/_ah/remote_api
```

Note: The local testing in Google App Engine currently doesn't support batch download

#### If you change the data being written:

- you'll have to re-create the download data file (bulkloader.yaml)

```
appcfg.py create_bulkloader_config --filename=bulkloader.yaml --url=http://<app_name>.appspot.com/_ah/remote_api
```

- Then set the line in the new bulkloader.yaml `connector:` to `connector: csv` and set the delimiter to tab-based.
 
