
function setup() {
    createCanvas(1098, 118).parent('piano-visualizer');
    colorMode(HSB, 360, 100, 100, 100);
    keyOnColor = color(326, 100, 100, 100); // <---- 編輯這裡換「按下時」的顏色！[HSB Color Mode] 
    pedaledColor = color(326, 100, 70, 100); // <---- 編輯這裡換「踏板踩住」的顏色！[HSB Color Mode]
    smooth(2);
    frameRate(60);
    initKeys();

}

function draw() {
    background(0, 0, 20, 100);
  pushHistories();
    drawWhiteKeys();
    drawBlackKeys();
    // drawPedalLines();
    // drawNotes();
    
    drawTexts();
}

function calculateSessionTime() {
  let currentTime = new Date();
  let timeElapsed = currentTime - sessionStartTime;
  // Convert time elapsed to hours, minutes, and seconds
  let seconds = Math.floor((timeElapsed / 1000) % 60);
  let minutes = Math.floor((timeElapsed / (1000 * 60)) % 60);
  let hours = Math.floor((timeElapsed / (1000 * 60 * 60)) % 24);
  sessionTotalSeconds = Math.floor(timeElapsed / 1000);
  // Pad minutes and seconds with leading zeros
  let paddedMinutes = String(minutes).padStart(2, '0');
  let paddedSeconds = String(seconds).padStart(2, '0');
  let timeText = `${hours}:${paddedMinutes}:${paddedSeconds}`;
  return timeText;
}

function initKeys() {
    for (i = 0; i<128; i++) {
      isKeyOn[i] = 0;
      isPedaled[i] = 0;
    }
}

function drawWhiteKeys() {
    let wIndex = 0; // white key index
    stroke(0, 0, 0);
    strokeWeight(1);
    for (let i = 21; i < 109; i++) {
      if (isBlack[i % 12] == 0) {
        // it's a white key
        if (isKeyOn[i] == 1 && !rainbowMode) {
          fill(keyOnColor); // keypressed
        } else if (isKeyOn[i] == 1 && rainbowMode) {
          fill(map(i, 21, 108, 0, 1080)%360, 100, 100, 100); // rainbowMode
        } else if (isPedaled[i] == 1 && !rainbowMode) {
          fill(pedaledColor); // pedaled
        } else if (isPedaled[i] == 1 && rainbowMode) {
          fill(map(i, 21, 108, 0, 1080)%360, 100, 70, 100); // pedaled rainbowMode
        } else {
          fill(0, 0, 100); // white key
        }
        let thisX = border + wIndex*(whiteKeyWidth+whiteKeySpace);
        rect(thisX, keyAreaY, whiteKeyWidth, keyAreaHeight, radius);
        // println(wIndex);
        wIndex++;
      }
    }
}

function drawBlackKeys() {
    let wIndex = 0; // white key index
    stroke(0, 0, 0);
    strokeWeight(1.5);
    for (let i = 21; i < 109; i++) {
      if (isBlack[i % 12] == 0) {
        // it's a white key
        wIndex++;
      }
  
      if (isBlack[i % 12] > 0) {
        // it's a black key
        if (isKeyOn[i] == 1 && !rainbowMode) {
          fill(keyOnColor); // keypressed
        } else if (isKeyOn[i] == 1 && rainbowMode) {
          fill(map(i, 21, 108, 0, 1080)%360, 100, 100, 100); // rainbowMode
        } else if (isPedaled[i] == 1 && !rainbowMode) {
          fill(pedaledColor); // pedaled
        } else if (isPedaled[i] == 1 && rainbowMode) {
          fill(map(i, 21, 108, 0, 1080)%360, 100, 70, 100); // pedaled rainbowMode
        } else {
          fill(0, 0, 0); // white key
        }
   
        let thisX = border + (wIndex-1)*(whiteKeyWidth+whiteKeySpace) + isBlack[i % 12];
        rect(thisX, keyAreaY-1, blackKeyWidth, blackKeyHeight, bRadius);
      }
    }
}

function drawTexts() {
  stroke(0, 0, 10, 100);
  fill(0, 0, 100, 90)
  textFont('Monospace');
  textStyle(BOLD);
  textSize(14); 
  textAlign(LEFT, TOP);

  // TIME
  let timeText = "TIME" + "\n" + calculateSessionTime();
  text(timeText, 5, 79);

  // PEDAL
  let pedalText = "PEDALS" + "\nL " + convertNumberToBars(cc67now) + "  R " + convertNumberToBars(cc64now)
  text(pedalText, 860, 79);

  // NOTES
  let notesText = "NOTE COUNT" + "\n" + totalNotesPlayed;
  text(notesText, 95, 79);

  // CALORIES
  let caloriesText = "CALORIES" + "\n" + (totalIntensityScore/250).toFixed(3); // 250 Intensity = 1 kcal.
  text(caloriesText, 350, 79);

  // SHORT-TERM DENSITY
  let shortTermDensity = shortTermTotal.reduce((accumulator, currentValue) => accumulator + currentValue, 0); // Sum the array.
  let shortTermDensityText = "NOTES/S" + "\n" + shortTermDensity;
  text(shortTermDensityText, 200, 79);

  // LEGATO SCORE
  let legatoScore = legatoHistory.reduce((accumulator, currentValue) => accumulator + currentValue, 0) 
  legatoScore /= 60;
  let legatoText = "LEGATO" + "\n" + legatoScore.toFixed(2);
  text(legatoText, 280, 79);
  
  // NOW PLAYING
  let nowPlayingText = "KEYS" + "\n" + truncateString(getPressedKeys(), 47);
  text(nowPlayingText, 440, 79);
}

function pushHistories() {
  shortTermTotal.push(notesThisFrame);
  shortTermTotal.shift();
  notesThisFrame = 0;
  

  legatoHistory.push(isKeyOn.reduce((accumulator, currentValue) => accumulator + currentValue, 0));
  legatoHistory.shift();
  

}

function convertNumberToBars(number) {
  if (number < 0 || number > 127) {
    throw new Error('Number must be between 0 and 127');
  }

  const maxBars = 10;
  const scaleFactor = 128 / maxBars;

  // Calculate the number of bars
  const numberOfBars = Math.ceil(number / scaleFactor);

  // Create a string with the calculated number of "|" characters
  const barString = '|'.repeat(numberOfBars);

  // Calculate the number of "." characters required to fill the remaining space
  const numberOfDots = maxBars - numberOfBars;

  // Create a string with the calculated number of "." characters
  const dotString = '.'.repeat(numberOfDots);

  // Combine the "|" and "." strings
  const combinedString = barString + dotString;

  return combinedString;
}

function getPressedKeys() {
  let pressedOrPedaled = [];

  for (let i = 0; i < isKeyOn.length; i++) {
    pressedOrPedaled[i] = isKeyOn[i] === 1 || isPedaled[i] === 1 ? 1 : 0;

  } 



  let noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']; // default if sharp
  if ([0, 1, 3, 5, 8, 10].includes(pressedOrPedaled.indexOf(1) % 12)) {
    // flat
    noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']; 
  } 

  const pressedKeys = [];

  for (let i = 0; i < pressedOrPedaled.length; i++) {
    if (pressedOrPedaled[i] === 1) {
      const noteName = noteNames[i % 12];
      const octave = Math.floor(i / 12) - 1;
      pressedKeys.push(`${noteName}${octave}`);
    }
  }

  return pressedKeys.join(' ');
}

function truncateString(str, maxLength = 40) {
  if (str.length <= maxLength) {
    return str;
  }

  return str.slice(0, maxLength - 3) + '...';
}

function mouseClicked() {
  // Save the canvas content as an image file
  if (mouseX < 50 && mouseY < 50) {
    saveCanvas('nicechord-pianometer', 'png');
  }
}