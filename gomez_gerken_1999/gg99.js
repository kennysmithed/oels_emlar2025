//Loosly based on Experiment 2 from Gomez & Gerken 1999

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
/*** Training trials **********************************************************/
/******************************************************************************/
/*
Play each word from word_sequence in turn, with 0ms between words and 1500ms at 
the end of the sequence (using post_trial_gap).

word_sequence is an array of names of sound files (minus path), e.g. 
["vot","pel","rud"]
*/
function make_training_trial(word_sequence) {
  training_trial_timeline = [];
  for (var i = 0; i < word_sequence.length; i++) {
    var this_word = word_sequence[i];
    var this_gap = 0;
    if (i == word_sequence.length - 1) {
      //long gap after last word in sequence
      this_gap = 1500;
    }
    var this_trial = {
      type: jsPsychAudioKeyboardResponse,
      stimulus: "sounds/" + this_word + ".mp3",
      choices: "NO_KEYS", //no response allowed
      trial_ends_after_audio: true,
      post_trial_gap: this_gap,
    };
    training_trial_timeline.push(this_trial);
  }
  return { timeline: training_trial_timeline };
}

/******************************************************************************/
/*** Test trials **********************************************************/
/******************************************************************************/
/*
Play each word from word_sequence in turn, then prompt 
for grammaticality judgment. Using html-keyboard-response for the test prompt - 
could have been another audio-keyboard-response which also played the last word, but 
that would have been more complicated to code.
*/
function make_test_trial(word_sequence) {
  test_trial_timeline = [];
  for (var i = 0; i < word_sequence.length; i++) {
    var this_word = word_sequence[i];
    var this_trial = {
      type: jsPsychAudioKeyboardResponse,
      stimulus: "sounds/" + this_word + ".mp3",
      choices: "NO_KEYS",
      trial_ends_after_audio: true,
    };
    test_trial_timeline.push(this_trial);
  }
  var test_trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "Was that sequence grammatical? Press y or n.",
    choices: ["y", "n"],
  };
  test_trial_timeline.push(test_trial);
  return { timeline: test_trial_timeline };
}

/******************************************************************************/
/*** Consent, instruction trials etc ******************************************/
/******************************************************************************/

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

var instruction_screen_training = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Training Instructions</h3>\
  <p style='text-align:left'>Instructions for the training stage. Each stage will start with instructions\
  explaining to participants what they are doing. This is a placeholder for that information.</p>",
  choices: ["Continue"],
};

var instruction_screen_test = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Test Instructions</h3>\
  <p style='text-align:left'>Instructions for the test phase. Each stage will start with instructions\
  explaining to participants what they are doing. This is a placeholder for that information.</p>",
  choices: ["Continue"],
};

var final_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Finished!</h3>\
  <p style='text-align:left'>Experiments often end with a final screen, e.g. that contains a completion \
  code so the participant can claim their payment. This is a placeholder for that information.</p>",
  choices: ["Finish"],
};

var preload = {
  type: jsPsychPreload,
  auto_preload: true,
};

/******************************************************************************/
/*** Build the timeline *******************************************************/
/******************************************************************************/

/*
Note no randomisation of sequence of training or test items here.

These notes are me digging out the stimuli lists from the Gomez & Gerken paper!

Training
vot pel jic
pel tam pel jic
pel tam jic rud tam rud 
pel tam jic rud tam jic 
vot pel pel jic rud tam
pel tam rud rud
vot jic rud tam jic 
vot jic rud tam rud 
vot pel jic rud tam 
pel tam pel pel pel jic

Grammatical
vot jic rud tam
vot pel pel jic
pel tam jic rud tam 
vot pel jic rud tam jic 
pel tam pel jic rud tam
pel tam rud
pel tam pel pel jic
vot pel pel pel jic
vot jic rud tam rud rud 
vot pel jic rud tam rud

Ungrammatical
vot*tam pel*rud*jic 
vot*rud*pel jic 
pel*rud*jic*pel tam 
vot*tam pel jic*pel*rud 
pel*rud*jic*jic*tam*tam
pel*vot*tam 
pel*rud*jic*pel tam 
vot*rud tam*tam 
pel*vot*rud*pel jic*jic 
vot*rud*pel tam pel jic
*/

var full_timeline = [
  consent_screen, 
  preload,
  instruction_screen_training,
  make_training_trial(["vot", "pel", "jic"]),
  make_training_trial(["pel", "tam", "pel", "jic"]),
  make_training_trial(["pel", "tam", "jic", "rud", "tam", "rud"]),
  make_training_trial(['pel','tam','jic','rud','tam','jic']),
  make_training_trial(['vot','pel','pel','jic','rud','tam']),
  instruction_screen_test,
  make_test_trial(["vot", "jic", "rud", "tam"]), //grammatical
  make_test_trial(["vot", "tam", "pel", "rud", "jic"]), //ungrammatical
  final_screen,
];

/******************************************************************************/
/*** Run the timeline *******************************************************/
/******************************************************************************/

jsPsych.run(full_timeline);
