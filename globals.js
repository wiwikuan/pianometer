let midiSelectSlider;

// for piano visualizer
let nowPedaling = false; // is it pedaling?（不要動）
let isKeyOn = []; // what notes are being pressed (1 or 0)（不要動）
let isPedaled = []; // what notes are pedaled (1 or 0)（不要動）
let keyOnColor // set it in setup()
let pedaledColor // set it in setup()
let isBlack = [0, 11, 0, 13, 0, 0, 11, 0, 12, 0, 13, 0]; // 是黑鍵嗎？是的話，相對左方的白鍵位移多少？(default: {0, 11, 0, 13, 0, 0, 11, 0, 12, 0, 13, 0}）
let border = 3; // 左方留空幾個畫素？(default: 3)
let whiteKeyWidth = 20; // 白鍵多寬？(default: 20)
let whiteKeySpace = 1; // 白鍵間的縫隙多寬？(default: 1)
let blackKeyWidth = 17; // 黑鍵多寬？(default: 17)
let blackKeyHeight = 45; // 黑鍵多高？(default: 45)
let radius = 5; // 白鍵圓角(default: 5)
let bRadius = 4; // 黑鍵圓角(default: 4)
let keyAreaY = 3; // 白鍵從 Y 軸座標多少開始？(default: 3)
let keyAreaHeight = 70; // 白鍵多高？(default: 70)
let rainbowMode = false; // 彩虹模式 (default: false)
let cc64now = 0; // 現在的踏板狀態
let cc67now = 0;

let sessionStartTime = new Date();
let sessionTotalSeconds = 0;

let flatNames = false;

// note counter
let notesThisFrame = 0;
let totalNotesPlayed = 0;
let shortTermTotal = new Array(60).fill(0);
let legatoHistory = new Array(60).fill(0);
let notesSMax = 0;
let totalIntensityScore = 0;

// for key pressed counter
let notePressedCount = 0;
let notePressedCountHistory = [];

WebMidi.enable(function (err) { //check if WebMidi.js is enabled
    if (err) {
        console.log("WebMidi could not be enabled.", err);
    } else {
        console.log("WebMidi enabled!");
    }

    //name our visible MIDI input and output ports
    console.log("---");
    console.log("Inputs Ports: ");
    for (i = 0; i < WebMidi.inputs.length; i++) {
        console.log(i + ": " + WebMidi.inputs[i].name);
    }

    console.log("---");
    console.log("Output Ports: ");
    for (i = 0; i < WebMidi.outputs.length; i++) {
        console.log(i + ": " + WebMidi.outputs[i].name);
    }
    midiSelectSlider = select("#slider");
    midiSelectSlider.attribute("max", WebMidi.inputs.length - 1);
    midiSelectSlider.input(inputChanged);
    midiIn = WebMidi.inputs[midiSelectSlider.value()]
    inputChanged();
});

function inputChanged() {
    isKeyOn.fill(0);
    controllerChange(64, 0);
    controllerChange(67, 0);

    midiIn.removeListener();
    midiIn = WebMidi.inputs[midiSelectSlider.value()];
    midiIn.addListener('noteon', "all", function (e) {
        console.log("Received 'noteon' message (" + e.note.number + ", " + e.velocity + ").");
        noteOn(e.note.number, e.velocity);
    });
    midiIn.addListener('noteoff', "all", function (e) {
        console.log("Received 'noteoff' message (" + e.note.number + ", " + e.velocity + ").");
        noteOff(e.note.number, e.velocity);
    })
    midiIn.addListener('controlchange', 'all', function(e) {
        console.log("Received control change message:", e.controller.number, e.value);
        controllerChange(e.controller.number, e.value)
      });
    console.log(midiIn.name);
    select("#device").html(midiIn.name);
};

function noteOn(pitch, velocity) {
    totalNotesPlayed++;
    notesThisFrame++;
    totalIntensityScore += velocity;
    
    // piano visualizer
    isKeyOn[pitch] = 1;
    if (nowPedaling) {
      isPedaled[pitch] = 1;
    }
}

function noteOff(pitch, velocity) {
    isKeyOn[pitch] = 0;
}

function controllerChange(number, value) {
    // Receive a controllerChange
    if (number == 64) {
        cc64now = value; 

        if (value >= 64) {
          nowPedaling = true;
          for (let i = 0; i < 128; i++) {
            // copy key on to pedal
            isPedaled[i] = isKeyOn[i];
          }
        } else if (value < 64) {
          nowPedaling = false;
          for (let i = 0; i < 128; i++) {
            // reset isPedaled
            isPedaled[i] = 0;
          }
        }
    }

    if (number == 67) {
        cc67now = value;

    }
}

function toggleRainbowMode(cb) {
    rainbowMode = cb.checked;
    if (rainbowMode)
        select('#colorpicker').attribute('disabled', true)
    else
        select('#colorpicker').removeAttribute('disabled')
}

function changeColor() {
    keyOnColor = pedaledColor = color(select('#colorpicker').value());
    darkenedColor = keyOnColor.levels.map(x => floor(x * .7));
    pedaledColor = color(`rgb(${darkenedColor[0]}, ${darkenedColor[1]}, ${darkenedColor[2]})`)
    console.log(pedaledColor.levels);
}