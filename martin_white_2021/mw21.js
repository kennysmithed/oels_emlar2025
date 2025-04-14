/*
Based on Martin & White (2021) in Linguistic Inquiry - the sound files are 
theirs, I just grabbed a couple of random image stims from the web since 
I only needed a couple of trials for my demo.

Demo to show image+audio stimuli on a single trial - in this case I use 
a custom plugin, but it is also possible to smuggle the audio in via the prompt, 
see detailed discussion in comments at the end of this file.
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
/*** Random assignment to condition *******************************************/
/******************************************************************************/

var conditions = ["harmony", "disharmony"];
var assigned_condition = jsPsych.randomization.sampleWithoutReplacement(
  conditions,
  1
)[0];
console.log(assigned_condition);

/******************************************************************************/
/*** Training trials **********************************************************/
/******************************************************************************/

/*
The sequence is:

Show image in singular and play singular_label

Show image in plural and play one of the two plural label options (randomising order)

Make participant selet an option

Give feedback

*/

function make_training_trial(
  image,
  singular_label,
  correct_plural_label,
  incorrect_plural_label
) {
  //add additional bits and pieces to image and sound file names to include path info etc
  var singular_image_filename = "images/" + image + ".jpg";
  var plural_image_filename = "images/" + image + "_2.jpg";
  var singular_label_filename = "sounds/" + singular_label + ".wav";
  var correct_plural_filename = "sounds/" + correct_plural_label + ".wav";
  var incorrect_plural_filename = "sounds/" + incorrect_plural_label + ".wav";
  //generate a random order to present the two options
  var option_order = jsPsych.randomization.sampleWithoutReplacement(["correct_first", "correct_last"],1)[0];
  //assume correct_first, then change it if it's correct_last
  var option1_plural_filename = correct_plural_filename;
  var option2_plural_filename = incorrect_plural_filename;
  if (option_order == "correct_last") {
    var option1_plural_filename = incorrect_plural_filename;
    var option2_plural_filename = correct_plural_filename;
  }

  //present singular image, participant clicks to hear its label
  var singular_trial = {
    type: jsPsychImageButtonResponse,
    stimulus: singular_image_filename,
    choices: ["Click to listen"],
  };
  var singular_trial_audio = {
    type: jsPsychImageAudioButtonResponse,
    image_stimulus: singular_image_filename,
    audio_stimulus: singular_label_filename,
    response_ends_trial: false,
    trial_ends_after_audio: true,
    choices: ["Click to listen"], 
  };

  //same for option 1
  var option1_trial = {
    type: jsPsychImageButtonResponse,
    stimulus: plural_image_filename,
    choices: ["Click to listen to Option 1"],
  };
  var option1_trial_audio = {
    type: jsPsychImageAudioButtonResponse,
    image_stimulus: plural_image_filename,
    audio_stimulus: option1_plural_filename,
    choices: ["Click to listen to Option 1"],
    response_ends_trial: false,
    trial_ends_after_audio: true,
  };

  //and for option 2
  var option2_trial = {
    type: jsPsychImageButtonResponse,
    stimulus: plural_image_filename,
    choices: ["Click to listen to Option 2"],
  };
  var option2_trial_audio = {
    type: jsPsychImageAudioButtonResponse,
    image_stimulus: plural_image_filename,
    audio_stimulus: option2_plural_filename,
    choices: ["Click to listen to Option 2"],
    response_ends_trial: false,
    trial_ends_after_audio: true,
  };


  //prompt participant to select between options
  var final_choice = {
    type: jsPsychImageButtonResponse,
    stimulus: plural_image_filename,
    choices: ["Option 1", "Option 2"],
    on_finish: function (data) {
      //calculate whether they selected correctly - 
      //if we played the correct option first then they should give response 0 (the left button)
      //if we played the correct option last then they should give response 1 (the right button) 
      console.log(data.response);
      console.log(option_order);
      if ((data.response == 0) & (option_order == "correct_first")) {
        data.score = 1;
      } else if ((data.response == 1) & (option_order == "correct_last")) {
        data.score = 1;
      } else {
        data.score = 0;
      }
      console.log(data.score);
    },
  };
  //present feedback based on score from last trial
  var feedback_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "",
    choices: [],
    response_ends_trial: false,
    trial_duration: 2000,
    post_trial_gap: 500, //a little pause between trials
    stimulus: function () {
      //look up score from previous trial where they make their selection
      var last_trial_correct = jsPsych.data.get().last(1).values()[0].score;
      if (last_trial_correct == 1) {
        return "Correct!";
      } else if (option_order == "correct_first") {
        return "Incorrect! The correct response was Option 1.";
      } else if (option_order == "correct_last") {
        return "Incorrect! The correct response was Option 2.";
      }
    },
  };

  //stick it all together into an 8-step timeline for a single trial
  return {
    timeline: [
      singular_trial,
      singular_trial_audio,
      option1_trial,
      option1_trial_audio,
      option2_trial,
      option2_trial_audio,
      final_choice,
      feedback_trial,
    ],
  };
}

var training_trials;
//training trials depend on condition
if (assigned_condition == "harmony") {
  training_trials = [
    make_training_trial("badger", "dopo", "dopofu", "dopofi"),
    make_training_trial("cat", "geni", "genibe", "genibo"),
    make_training_trial("fast", "fast", "blue", "slow"), //one of their catch trials - see paper
  ];
} else if (assigned_condition == "disharmony") {
  training_trials = [
    make_training_trial("badger", "dopo", "dopofi", "dopofu"),
    make_training_trial("cat", "geni", "genibo", "genibe"),
    make_training_trial("fast", "fast", "blue", "slow"), //one of their catch trials - see paper
  ];
}

/******************************************************************************/
/*** Consent, instruction trials etc ******************************************/
/******************************************************************************/

var consent_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Welcome to the experiment</h3>\
  <p style='text-align:left'>Experiments begin with an information sheet that explains to the participant\
  what they will be doing, how their data will be used, and how they will be remunerated.</p>\
  <p style='text-align:left'>This is a placeholder for that information, which is normally reviewed\
  as part of the ethical review process.</p>",
  choices: ["Yes, I consent to participate"],
};

var final_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Finished!</h3>\
  <p style='text-align:left'>Experiments often end with a final screen, e.g. that contains a completion\
  code so the participant can claim their payment, or that redirects them back to a crowdsourcing site.</p>\
  <p style='text-align:left'>This is a placeholder for that information.</p>",
  choices: ["Click to finish the experiment"],
};

var preload = {
  type: jsPsychPreload,
  auto_preload: true,
};

/******************************************************************************/
/*** Build and run the timeline *******************************************************/
/******************************************************************************/

var full_timeline = [].concat(
  consent_screen,
  preload,
  training_trials,
  final_screen
);

jsPsych.run(full_timeline);

/******************************************************************************/
/*** Notes on adding audio via the prompt **********************************************/
/******************************************************************************/

/*
Since the prompt of e.g. image-button-response trials can be any html, and html 
can include audio, it is possible to smuggle audio into a non-audio plugin trial
e.g. like this

var singular_trial_audio = {
    type: jsPsychImageButtonResponse,
    stimulus: singular_image_filename,
    prompt: //this is how we sneak audio into the prompt
      "<audio autoplay=true>\
      <source src='" +
      singular_label_filename +
      "'>\
      </audio>",
    ...
  };

but the problem is that the audio won't be preloaded, which could be important if 
the sound files are large and/or your participants have low-speed connections. I
played around with this a bit and came up with this work-around, which involves
accessing the audio buffers which jsPsych uses for preloaded audio.

//Function to play pre-loaded audio
function play_preloaded_audio(audio_file) {
  var context = jsPsych.pluginAPI.audioContext();
  jsPsych.pluginAPI.getAudioBuffer(audio_file)
  .then(function(buffer){
    console.log(buffer)
    if (context !== null) {
      this.audio = context.createBufferSource();
      this.audio.buffer = buffer;
      this.audio.connect(context.destination);
      audio.start(context.currentTime);
    }
    else {
      this.audio = buffer;
      this.audio.play()
    }
  })
};

This can then be used to play the audio on_start of the trial where you want the audio, e.g. 

var singular_trial_audio = {
    type: jsPsychImageButtonResponse,
    stimulus: singular_image_filename,
    on_start: function(trial) {
        play_preloaded_audio(sound_filename)}
    };
    ...
  };

This feels a bit of a hack to me though, so I am working on a more elegant solution!
*/
