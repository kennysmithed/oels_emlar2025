/******************************************************************************/
/*** Preamble ************************************************/
/******************************************************************************/

/*

This code is simplified from code from week 6 of my Online Experiments course, see e.g. 
https://kennysmithed.github.io/oels2022/. See there for a more thoroughly commented 
version of this code, and other example experiments.

The experiment features two main trial types - observation (training) and production (test)
Observation: see object for 1 second, then object plus label for 2 seconds
Production: object plus two labels, select label, confirms label choice, show label choice.

*/

/******************************************************************************/
/*** Initialise jspsych *******************************************************/
/******************************************************************************/

/*
We will dump all the trials on-screen at the end so you can see what's going on. 
*/

var jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData("csv"); //dump the data to screen
  },
});

/******************************************************************************/
/*** Observation trials ************************************************/
/******************************************************************************/

/*
make_observation_trial is a function that takes two arguments - an object name
(a string giving the name of a jpg file in the images folder) and a label to pair
it with.

I am using the image-button-response trial type, even though the participant doesn't
provide a response at all, just because it was the easiest way to make the layout
look similar to the production trial type.

Each observation trial consists of two trials: the initial presentation of the
object (for 1000ms) and then the object plus label (in the prompt) for 2000ms. The
initial 1000ms presentation contains some dummy text as the prompt - '&nbsp;' is
a special html space character.

*/

function make_observation_trial(object, label) {
  var object_filename = "images/" + object + ".jpg"; //build file name for the object
  trial = {
    type: jsPsychImageButtonResponse,
    stimulus: object_filename,
    choices: [],
    timeline: [
      {
        prompt: "&nbsp;", //dummy text
        trial_duration: 1000,
      },
      { prompt: label, trial_duration: 2000, post_trial_gap: 250 },
    ],
  };
  return trial;
}

/*
Now we can use this function to make some observation trials - object4 paired with
two non-word labels, buv and cal.
*/
var observation_trial_obj2_lem = make_observation_trial("object2", "lem");
var observation_trial_obj2_vit = make_observation_trial("object2", "vit");
var observation_trial_obj4_mig = make_observation_trial("object4", "mig");
var observation_trial_obj4_dap = make_observation_trial("object4", "dap");

/*
We are going to need several of these trials in training - we can do this using
the built-in function that jspsych provides for repeating trials, jsPsych.randomization.repeat.
I will have 3 occurences of object 2 + buv and 2 of object 2 + cal, plus 2 occurences each
of object 4 and mig/dap.
*/
var observation_trials = jsPsych.randomization.repeat(
  [
    observation_trial_obj2_lem,
    observation_trial_obj2_vit,
    observation_trial_obj4_mig,
    observation_trial_obj4_dap,
  ],
  [3, 1, 2, 2]
);

/******************************************************************************/
/*** Production trials ************************************************/
/******************************************************************************/

/*
make_production_trial is a function that takes two arguments - an object name
(a string giving the name of a jpg file in the images folder) and a list of labels
the participant must select among when labelling the object, which will appear as
clickable buttons.

Each production trial consists of three sub-trials: the object plus label choices presented 
as buttons, then a second subtrial where the participant clicks again on the label 
they selected on the second trial, to centre their mouse (i.e to prevent rapid clicking 
through on the left or right button), then a third trial where we show the participant's 
choice on-screen.

*/

function make_production_trial(object, label_choices) {
  var object_filename = "images/" + object + ".jpg";
  var trial = {
    type: jsPsychImageButtonResponse,
    stimulus: object_filename,
    timeline: [
      //subtrial 1: show the two labelled buttons and have the participant select
      {
        choices: [label_choices],
        prompt: "&nbsp;", //dummy text
        //at the start of the trial, randomise the left-right order of the labels
        //and note that randomisation in data
        on_start: function (trial) {
          var shuffled_label_choices =
            jsPsych.randomization.shuffle(label_choices);
          trial.choices = shuffled_label_choices;
          trial.data = { label_choices: shuffled_label_choices };
        },

        //at the end, use data.response to figure out
        //which label they selected, and add that to data
        on_finish: function (data) {
          var button_number = data.response; 
          data.label_selected = data.label_choices[button_number];
        },
      },
      //subtrial 2: confirm choice to center cursor
      {
        choices: [],
        prompt: "&nbsp;", //dummy text
        on_start: function (trial) {
          //get the last trial response (the data generated by the button-click)
          var last_trial_data = jsPsych.data.get().last(1).values()[0];
          //look up the label_selected on that last trial
          var last_trial_label = last_trial_data.label_selected;
          trial.choices = [last_trial_label]; //this is your only choice
        },
      },
      //substrial 3 - show it in the prompt, keep the buttons in place to stop
      //the layout changing but make them invisible and unclickable!
      {
        trial_duration: 2000,
        choices: label_choices, //these buttons are invisible and unclickable!
        button_html:
          '<button style="visibility: hidden;" class="jspsych-btn">%choice%</button>',
        post_trial_gap: 250,
        on_start: function (trial) {
          //get the last trial response (the data generated by the button-click)
          var last_trial_data = jsPsych.data.get().last(2).values()[0];
          //look up the label_selected on that last trial
          var last_trial_label = last_trial_data.label_selected;
          trial.prompt = last_trial_label; //this is your only choice
        },
      },
    ],
  };
  return trial;
}

/*
Use the same procedure as for observation trials to generate repeated production trials, 2 for each object
*/
var production_trial_obj2 = make_production_trial("object2", ["lem", "vit"]);

var production_trial_obj4 = make_production_trial("object4", ["mig", "dap"]);

var production_trials = jsPsych.randomization.repeat(
  [production_trial_obj2, production_trial_obj4],
  2
);

/******************************************************************************/
/*** Instruction trials *******************************************************/
/******************************************************************************/

/*
As usual, your experiment will need some instruction screens.
*/

var consent_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Welcome to the experiment</h3> \
  <p style='text-align:left'>Experiments begin with an information sheet that explains to the participant \
  what they will be doing, how their data will be used, and how they will be \
  remunerated.</p> \
  <p style='text-align:left'>This is a placeholder for that information, which is normally reviewed \
  as part of the ethical review process.</p>",
  choices: ["Yes, I consent to participate"],
};

var instruction_screen_observation = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Observation Instructions</h3>\
  <p>Instructions for the observation stage.</p>",
  choices: ["Continue"],
};

var instruction_screen_production = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Production Instructions</h3>\
  <p>Instructions for the production phase.</p>",
  choices: ["Continue"],
};

var final_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Finished!</h3>\
  <p style='text-align:left'>Experiments often end with a final screen, e.g. that contains a completion\
  code so the participant can claim their payment.</p>\
  <p style='text-align:left'>Click Continue to see your raw data.</p>",
  choices: ["Continue"],
};

/******************************************************************************/
/*** Demographics *******************************************************/
/******************************************************************************/

var demographics_questionnaire = {
  type: jsPsychSurveyHtmlForm,
  preamble:
    "<h3>Post-experiment questionnaire</h3>\
              <p style='text-align:left'> We would like to collecting some basic \
              information about you, and also give you a chance to tell us what you \
              thought of the experiment and how you approached it!",
  html: "<p style='text-align:left'>Are you a native speaker of English?<br>  \
        <input type='radio' name='english' value='yes'>yes<br>\
        <input type='radio' name='english' value='no'>no<br></p> \
        <p style='text-align:left'>How old are you (in years)? <br> \
        <input name='age' type='number'></p> \
        <p style='text-align:left'>Any other comments on the experiment?<br> \
        <textarea name='comments' rows='10' cols='100'></textarea></p>",
};

/******************************************************************************/
/*** Build the timeline *******************************************************/
/******************************************************************************/

var preload = {
  type: jsPsychPreload,
  auto_preload: true,
};

/*
I am using concat here to make sure the timeline is a flat list - just doing
timeline=[consent_screen,instruction_screen_observation,observation_trials,...]
would produce something with a nested structure (observation_trials is itself a
list) that jspsych can't handle.
*/
var full_timeline = [].concat(
  consent_screen,
  preload,
  instruction_screen_observation,
  observation_trials,
  instruction_screen_production,
  production_trials,
  demographics_questionnaire,
  final_screen
);

/******************************************************************************/
/*** Run the timeline *******************************************************/
/******************************************************************************/

jsPsych.run(full_timeline);
