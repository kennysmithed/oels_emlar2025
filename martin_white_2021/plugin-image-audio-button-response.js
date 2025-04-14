/*
Created by Kenny Smith, 19/4/2023
A mash-up of jsPsych 7.3.2 image-button-response and image-audio-response.
*/

var jsPsychImageAudioButtonResponse = (function (jspsych) {
  'use strict';

  const info = {
      name: "image-audio-button-response",
      parameters: {
          /** The audio to be played. */
          audio_stimulus: {
              type: jspsych.ParameterType.AUDIO,
              pretty_name: "Audio Stimulus",
              default: undefined,
          },
          image_stimulus: {
              type: jspsych.ParameterType.IMAGE,
              pretty_name: "Image Stimulus",
              default: undefined,
          },
          /** Set the image height in pixels */
          image_stimulus_height: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Image height",
              default: null,
          },
          /** Set the image width in pixels */
          image_stimulus_width: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Image width",
              default: null,
          },
          /** Array containing the label(s) for the button(s). */
          choices: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Choices",
              default: undefined,
              array: true,
          },
          /** The HTML for creating button. Can create own style. Use the "%choice%" string to indicate where the label from the choices parameter should be inserted. */
          button_html: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Button HTML",
              default: '<button class="jspsych-btn">%choice%</button>',
              array: true,
          },
          /** Maintain the aspect ratio after setting width or height */
          maintain_aspect_ratio: {
            type: jspsych.ParameterType.BOOL,
            pretty_name: "Maintain aspect ratio",
            default: true,
        },
        /** How long to show the image_stimulus. */
        image_stimulus_duration: {
            type: jspsych.ParameterType.INT,
            pretty_name: "Image Stimulus duration",
            default: null,
        },
          /** Any content here will be displayed below the image stimulus. */
          prompt: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Prompt",
              default: null,
          },
          /** The maximum duration to wait for a response. */
          trial_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Trial duration",
              default: null,
          },
          /** Vertical margin of button. */
          margin_vertical: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Margin vertical",
              default: "0px",
          },
          /** Horizontal margin of button. */
          margin_horizontal: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Margin horizontal",
              default: "8px",
          },
          /** If true, the trial will end when user makes a response. */
          response_ends_trial: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Response ends trial",
              default: true,
          },
          /** If true, then the trial will end as soon as the audio file finishes playing. */
          trial_ends_after_audio: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Trial ends after audio",
              default: false,
          },
          /**
           * If true, then responses are allowed while the audio is playing.
           * If false, then the audio must finish playing before a response is accepted.
           */
          response_allowed_while_playing: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Response allowed while playing",
              default: true,
          },
      },
  };
  /**
   * **image-audio-button-response**
   *
   * jsPsych plugin for showing an image, playing an audio file, and getting a button response
   *
   * @author Kenny Smith
   */
  class ImageAudioButtonResponsePlugin {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }
      trial(display_element, trial, on_load) {
          // hold the .resolve() function from the Promise that ends the trial
          let trial_complete;
          // setup audio_stimulus
          var context = this.jsPsych.pluginAPI.audioContext();
          // store response
          var response = {
              rt: null,
              button: null,
          };
          // record webaudio context start time
          var startTime;
          // load audio file
          this.jsPsych.pluginAPI
              .getAudioBuffer(trial.audio_stimulus)
              .then((buffer) => {
              if (context !== null) {
                  this.audio = context.createBufferSource();
                  this.audio.buffer = buffer;
                  this.audio.connect(context.destination);
              }
              else {
                  this.audio = buffer;
                  this.audio.currentTime = 0;
              }
              setupTrial();
          })
              .catch((err) => {
              console.error(`Failed to load audio file "${trial.audio_stimulus}". Try checking the file path. We recommend using the preload plugin to load audio files.`);
              console.error(err);
          });
          const setupTrial = () => {
              // set up end event if trial needs it
              if (trial.trial_ends_after_audio) {
                  this.audio.addEventListener("ended", end_trial);
              }
              // enable buttons after audio ends if necessary
              if (!trial.response_allowed_while_playing && !trial.trial_ends_after_audio) {
                  this.audio.addEventListener("ended", enable_buttons);
              }

              ///big block of code from image-button-response inserted here
            var height, width;
          var html;


          if (trial.render_on_canvas) {
              var image_drawn = false;
              // first clear the display element (because the render_on_canvas method appends to display_element instead of overwriting it with .innerHTML)
              if (display_element.hasChildNodes()) {
                  // can't loop through child list because the list will be modified by .removeChild()
                  while (display_element.firstChild) {
                      display_element.removeChild(display_element.firstChild);
                  }
              }
              // create canvas element and image
              var canvas = document.createElement("canvas");
              canvas.id = "jspsych-image-audio-button-response-stimulus";
              canvas.style.margin = "0";
              canvas.style.padding = "0";
              var ctx = canvas.getContext("2d");
              var img = new Image();
              img.onload = () => {
                  // if image wasn't preloaded, then it will need to be drawn whenever it finishes loading
                  if (!image_drawn) {
                      getHeightWidth(); // only possible to get width/height after image loads
                      ctx.drawImage(img, 0, 0, width, height);
                  }
              };
              img.src = trial.image_stimulus;
              // get/set image height and width - this can only be done after image loads because uses image's naturalWidth/naturalHeight properties
              const getHeightWidth = () => {
                  if (trial.image_stimulus_height !== null) {
                      height = trial.image_stimulus_height;
                      if (trial.image_stimulus_width == null && trial.maintain_aspect_ratio) {
                          width = img.naturalWidth * (trial.image_stimulus_height / img.naturalHeight);
                      }
                  }
                  else {
                      height = img.naturalHeight;
                  }
                  if (trial.image_stimulus_width !== null) {
                      width = trial.image_stimulus_width;
                      if (trial.image_stimulus_height == null && trial.maintain_aspect_ratio) {
                          height = img.naturalHeight * (trial.image_stimulus_width / img.naturalWidth);
                      }
                  }
                  else if (!(trial.image_stimulus_height !== null && trial.maintain_aspect_ratio)) {
                      // if image_stimulus width is null, only use the image's natural width if the width value wasn't set
                      // in the if statement above, based on a specified height and maintain_aspect_ratio = true
                      width = img.naturalWidth;
                  }
                  canvas.height = height;
                  canvas.width = width;
              };
              getHeightWidth(); // call now, in case image loads immediately (is cached)
              // create buttons
              var buttons = [];
              if (Array.isArray(trial.button_html)) {
                  if (trial.button_html.length == trial.choices.length) {
                      buttons = trial.button_html;
                  }
                  else {
                      console.error("Error in image-audio-button-response plugin. The length of the button_html array does not equal the length of the choices array");
                  }
              }
              else {
                  for (var i = 0; i < trial.choices.length; i++) {
                      buttons.push(trial.button_html);
                  }
              }
              var btngroup_div = document.createElement("div");
              btngroup_div.id = "jspsych-image-audio-button-response-btngroup";
              html = "";
              for (var i = 0; i < trial.choices.length; i++) {
                  var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
                  html +=
                      '<div class="jspsych-image-audio-button-response-button" style="display: inline-block; margin:' +
                          trial.margin_vertical +
                          " " +
                          trial.margin_horizontal +
                          '" id="jspsych-image-audio-button-response-button-' +
                          i +
                          '" data-choice="' +
                          i +
                          '">' +
                          str +
                          "</div>";
              }
              btngroup_div.innerHTML = html;
              // add canvas to screen and draw image
              display_element.insertBefore(canvas, null);
              if (img.complete && Number.isFinite(width) && Number.isFinite(height)) {
                  // if image has loaded and width/height have been set, then draw it now
                  // (don't rely on img onload function to draw image when image is in the cache, because that causes a delay in the image presentation)
                  ctx.drawImage(img, 0, 0, width, height);
                  image_drawn = true;
              }
              // add buttons to screen
              display_element.insertBefore(btngroup_div, canvas.nextElementSibling);
              // add prompt if there is one
              if (trial.prompt !== null) {
                  display_element.insertAdjacentHTML("beforeend", trial.prompt);
              }
          }
          else {
              // display image_stimulus as an image element
              html = '<img src="' + trial.image_stimulus + '" id="jspsych-image-audio-button-response-stimulus">';
              //display buttons
              var buttons = [];
              if (Array.isArray(trial.button_html)) {
                  if (trial.button_html.length == trial.choices.length) {
                      buttons = trial.button_html;
                  }
                  else {
                      console.error("Error in image-audio-button-response plugin. The length of the button_html array does not equal the length of the choices array");
                  }
              }
              else {
                  for (var i = 0; i < trial.choices.length; i++) {
                      buttons.push(trial.button_html);
                  }
              }
              html += '<div id="jspsych-image-audio-button-response-btngroup">';
              for (var i = 0; i < trial.choices.length; i++) {
                  var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
                  html +=
                      '<div class="jspsych-image-audio-button-response-button" style="display: inline-block; margin:' +
                          trial.margin_vertical +
                          " " +
                          trial.margin_horizontal +
                          '" id="jspsych-image-audio-button-response-button-' +
                          i +
                          '" data-choice="' +
                          i +
                          '">' +
                          str +
                          "</div>";
              }
              html += "</div>";
              // add prompt
              if (trial.prompt !== null) {
                  html += trial.prompt;
              }
              // update the page content
              display_element.innerHTML = html;
              // set image dimensions after image has loaded (so that we have access to naturalHeight/naturalWidth)
              var img = display_element.querySelector("#jspsych-image-audio-button-response-stimulus");
              if (trial.image_stimulus_height !== null) {
                  height = trial.image_stimulus_height;
                  if (trial.image_stimulus_width == null && trial.maintain_aspect_ratio) {
                      width = img.naturalWidth * (trial.image_stimulus_height / img.naturalHeight);
                  }
              }
              else {
                  height = img.naturalHeight;
              }
              if (trial.image_stimulus_width !== null) {
                  width = trial.image_stimulus_width;
                  if (trial.image_stimulus_height == null && trial.maintain_aspect_ratio) {
                      height = img.naturalHeight * (trial.image_stimulus_width / img.naturalWidth);
                  }
              }
              else if (!(trial.image_stimulus_height !== null && trial.maintain_aspect_ratio)) {
                  // if image_stimulus width is null, only use the image's natural width if the width value wasn't set
                  // in the if statement above, based on a specified height and maintain_aspect_ratio = true
                  width = img.naturalWidth;
              }
              img.style.height = height.toString() + "px";
              img.style.width = width.toString() + "px";
          }

          ///end of insertion



              if (trial.response_allowed_while_playing) {
                  enable_buttons();
              }
              else {
                  disable_buttons();
              }
              // start time
              startTime = performance.now();
              // start audio
              if (context !== null) {
                  startTime = context.currentTime;
                  this.audio.start(startTime);
              }
              else {
                  this.audio.play();
              }
              // hide image if timing is set
          if (trial.image_stimulus_duration !== null) {
            this.jsPsych.pluginAPI.setTimeout(() => {
                display_element.querySelector("#jspsych-image-audio-button-response-stimulus").style.visibility = "hidden";
            }, trial.image_stimulus_duration);
        }
              // end trial if time limit is set
              if (trial.trial_duration !== null) {
                  this.jsPsych.pluginAPI.setTimeout(() => {
                      end_trial();
                  }, trial.trial_duration);
              }
              on_load();
          };
          // function to handle responses by the subject
          function after_response(choice) {
              // measure rt
              var endTime = performance.now();
              var rt = Math.round(endTime - startTime);
              if (context !== null) {
                  endTime = context.currentTime;
                  rt = Math.round((endTime - startTime) * 1000);
              }
              response.button = parseInt(choice);
              response.rt = rt;
              // disable all the buttons after a response
              disable_buttons();
              if (trial.response_ends_trial) {
                  end_trial();
              }
          }
          // function to end trial when it is time
          const end_trial = () => {
              // kill any remaining setTimeout handlers
              this.jsPsych.pluginAPI.clearAllTimeouts();
              // stop the audio file if it is playing
              // remove end event listeners if they exist
              if (context !== null) {
                  this.audio.stop();
              }
              else {
                  this.audio.pause();
              }
              this.audio.removeEventListener("ended", end_trial);
              this.audio.removeEventListener("ended", enable_buttons);
              // gather the data to store for the trial
              var trial_data = {
                  rt: response.rt,
                  image_stimulus: trial.image_stimulus,
                  audio_stimulus: trial.audio_stimulus,
                  response: response.button,
              };
              // clear the display
              display_element.innerHTML = "";
              // move on to the next trial
              this.jsPsych.finishTrial(trial_data);
              trial_complete();
          };
          function button_response(e) {
              var choice = e.currentTarget.getAttribute("data-choice"); // don't use dataset for jsdom compatibility
              after_response(choice);
          }
          function disable_buttons() {
              var btns = document.querySelectorAll(".jspsych-image-audio-button-response-button");
              for (var i = 0; i < btns.length; i++) {
                  var btn_el = btns[i].querySelector("button");
                  if (btn_el) {
                      btn_el.disabled = true;
                  }
                  btns[i].removeEventListener("click", button_response);
              }
          }
          function enable_buttons() {
              var btns = document.querySelectorAll(".jspsych-image-audio-button-response-button");
              for (var i = 0; i < btns.length; i++) {
                  var btn_el = btns[i].querySelector("button");
                  if (btn_el) {
                      btn_el.disabled = false;
                  }
                  btns[i].addEventListener("click", button_response);
              }
          }
          return new Promise((resolve) => {
              trial_complete = resolve;
          });
      }
      simulate(trial, simulation_mode, simulation_options, load_callback) {
          if (simulation_mode == "data-only") {
              load_callback();
              this.simulate_data_only(trial, simulation_options);
          }
          if (simulation_mode == "visual") {
              this.simulate_visual(trial, simulation_options, load_callback);
          }
      }
      create_simulation_data(trial, simulation_options) {
          const default_data = {
              audio_stimulus: trial.audio_stimulus,
              rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
              response: this.jsPsych.randomization.randomInt(0, trial.choices.length - 1),
          };
          const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
          this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
          return data;
      }
      simulate_data_only(trial, simulation_options) {
          const data = this.create_simulation_data(trial, simulation_options);
          this.jsPsych.finishTrial(data);
      }
      simulate_visual(trial, simulation_options, load_callback) {
          const data = this.create_simulation_data(trial, simulation_options);
          const display_element = this.jsPsych.getDisplayElement();
          const respond = () => {
              if (data.rt !== null) {
                  this.jsPsych.pluginAPI.clickTarget(display_element.querySelector(`div[data-choice="${data.response}"] button`), data.rt);
              }
          };
          this.trial(display_element, trial, () => {
              load_callback();
              if (!trial.response_allowed_while_playing) {
                  this.audio.addEventListener("ended", respond);
              }
              else {
                  respond();
              }
          });
      }
  }
  ImageAudioButtonResponsePlugin.info = info;

  return ImageAudioButtonResponsePlugin;

})(jsPsychModule);
