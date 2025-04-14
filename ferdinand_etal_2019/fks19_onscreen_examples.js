//these are simplified bits of code for screenshots in the talk

var object2_show = {type:jsPsychImageButtonResponse,
                    stimulus:'object2.jpg',
                    trial_duration:1000,
                    choices:[]}

var object2_train = {type:jsPsychImageButtonResponse,
                     stimulus:'object2.jpg',
                     prompt: 'vit',
                     trial_duration:2000,
                     choices:[]}

var object4_show = {type:jsPsychImageButtonResponse,
                    stimulus:'object4.jpg',
                    trial_duration:1000,
                    choices:[]}

var object4_train = {type:jsPsychImageButtonResponse,
                     stimulus:'object4.jpg',
                     prompt: 'dap',
                     trial_duration:2000,
                     choices:[]}

var training_timeline = [object2_show,object2_train,object4_show,object4_train]

var object2_test = {type:jsPsychImageButtonResponse,
                    stimulus:'object2.jpg',
                    choices: ['lem','vit']}

var object2_confirm = {type:jsPsychImageButtonResponse,
                       stimulus:'object2.jpg',
                       choices: [],
                       on_start:function(trial) {
                         var last_trial_label = jsPsych.data.get().last(1).values()[0].label_selected
                         trial.choices=[last_trial_label]}}

var object2_display = {type:jsPsychImageButtonResponse,
                       stimulus:'object2.jpg',
                       on_start:function(trial) {
                        var last_trial_label = jsPsych.data.get().last(1).values()[0].label_selected
                        trial.prompt=last_trial_label}}

var object4_test = {type:jsPsychImageButtonResponse,
                    stimulus:'object4.jpg',
                    choices: ['mig','dap']}

var object4_confirm = {type:jsPsychImageButtonResponse,
                       stimulus:'object4.jpg',
                       choices: [],
                       on_start:function(trial) {
                        var last_trial_label = jsPsych.data.get().last(1).values()[0].label_selected
                        trial.choices=[last_trial_label]}}

var object4_display = {type:jsPsychImageButtonResponse,
                       stimulus:'object4.jpg',
                       trial_duration:2000,
                       choices:[],
                       on_start:function(trial) {
                        var last_trial_label = jsPsych.data.get().last(1).values()[0].label_selected
                        trial.prompt=last_trial_label}}
