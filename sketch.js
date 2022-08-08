//Key 459c4dd0-0719-45be-afdf-6e4a10e13b11
//<img src="assets/help.png" alt="helpMenu" id="helpImage">

//API URLs
var timeURL = "https://worldtimeapi.org/api/timezone/America/New_York"; 

//API Data
var time = "";
var date = "";
var realWords;
const wordSet = new Set();
var startDay = 0;
var dayOfYear;

//Todays Clue Vars
//ar word = "devil";
//var description = "The Duke University Blue Devil originally came from a nickname, “diables bleus” given to chasseurs alpins, an elite mountain warfare infantry unit that gained recognition during World War I for their skills.";
//var description = "short";
var word = "";
var description = "";

//DOM Reference Vars
var submit;
var input;
var guessColumns = [];
var winMenu;
var shareButton;
var canvas;
var chapelPic;
var countDown;
var gameBoard;
var keyboard = [];
var grid = [];
var kill;
var xButton;
var menuButton;
var helpMenu;

//Game Vars
var turn = 0;
var typeWord = "";
var inMenu = false;
var inHelp = false;
const greenLetters = new Set();
const yellowLetters = new Set();
const greyLetters = new Set();
var iteration = 0;
var myGuessData;
var gameWon = false;
var loadGuess1 = false;
var loadGuess2 = false;
var possibleWords = [];
const descs = new Map();
var isSet;
var possible;


//p5.js functions
function preload() {
  countDown = select("#timeUntil");
  createBoard();
  loadJSON(timeURL, gotTime);
  possible = loadStrings('answers.txt', loadPossibleWords);
  
  chapelPic = loadImage("assets/duke-chapel.jpg")

  helpMenu = select("#helpMenu");
  winMenu = select("#winMenu");
  helpMenu.hide()
  winMenu.hide();
  winMenu.position(width / 2 - winMenu.width / 2 ,height / 2 - winMenu.height / 2);
  helpMenu.position(width / 2 - helpMenu.width / 2 ,height / 2 - helpMenu.height / 2);

  realWords = loadStrings("words.txt");  

  //helpImage = loadImage("assets/help.jpg");
}

function setup() {
  for(var i = 0; i < realWords.length; i++) {
    wordSet.add(realWords[i].toLowerCase());
  }

  canvas = createCanvas(windowWidth,windowHeight);
  canvas.position(0,0);
  canvas.style("z-index", -1);

  submit = select("#submit");
  submit.mousePressed(submitGuess);
  submit.hide();
  input = select("#input");
  input.hide();
  
  assignGuessColumns();
  for(var i = 0; i < 6; i++) {
    guessColumns[i].hide();
  }

  shareButton = select("#share");
  shareButton.mousePressed(share);

  setInterval(updateTime, 500);
  

  
  setupKeyboard();

  kill = select("#kill");
  kill.style("opacity", "0");

  xButton = select("#menuButton3");
  menuButton = select("#menuButton1");
  xButton.mousePressed(closeMenu);
  menuButton.mousePressed(openMenu);
  var helpButton = select("#menuButton2");
  helpButton.mousePressed(openHelp);
  var xButton2 = select("#menuButton4");
  xButton2.mousePressed(closeMenu);

  //createImg("assets/help.jpg", "Help Page");
}

function draw() {
  
  //Take out when done testing
  //updateGuessText();

  imageMode(CENTER);
  input.value(typeWord);
  
  if(inMenu) {
    fill(250, 250, 250, 2);
    rect(0, 0, width, height);
    canvas.style("z-index", 1);
    
    winMenu.show();
    winMenu.position(width / 2 - winMenu.width / 2 ,height / 2 - winMenu.height / 2);
    
  }

  if(inHelp) {
    fill(250, 250, 250, 2);
    rect(0, 0, width, height);
    canvas.style("z-index", 1);
    
    helpMenu.show();
    helpMenu.position(width / 2 - helpMenu.width / 2 ,height / 2 - helpMenu.height / 2);
  }
}

//Game Functions
function updateGuessText() {
  for(var i = 0; i < 5; i++) {
    if(i < typeWord.length) {
      grid[5 * turn + i].html(typeWord.substr(i, 1));
    } else {
      grid[5 * turn + i].html("");
    }
  } 
}

function share() {
  var ret = "Dukle " + date + " ";
  var gameTrack = "";
  
  var guesses = 0;
  for(var i = 0; i < 7; i++) {
    if(i == 6) {
      ret += "X/6";
      break;
    } 

    gameTrack += "\n" + guessColumns[i].html();
    
    guesses++;
    if(guessColumns[i].html() == "🟩🟩🟩🟩🟩") {
      ret += guesses.toString() + "/6";
      break;
    }

    //console.log(guessColumns[i].html());
  }
  ret += '\n' + gameTrack;

  //console.log(ret);
  copyToClipboard(ret);

  //kill.style("animation", "shareAnimate 3s ease-in-out 0s 1 forwards");
  //kill.style("animation", "shareAnimate 3s ease-in-out 0s 1 forwards");
  kill.style("opacity", "1");
  setTimeout(turnOff, 2000);

}

function turnOff () {
  kill.style("opacity", "0");
}

function submitGuess() {
  if(input.value().length != 5 || turn >= 6 || !wordSet.has(input.value().toLowerCase())) {
    return;
  }

  guessData = checkGuess(input.value(), word);
  //console.log(guessData);

  myGuessData = guessData;
  flipGrid();

  guessColumns[turn].html(guessData[0] + guessData[1] + guessData[2] + guessData[3] + guessData[4]);

  //updateKeyboardColors(guessData);

  //typeWord = "";
  //turn++;
}

function updateKeyboardColors(guessData) {
  for(var i = 0; i < guessData.length; i++) {
    if(guessData[i] == "🟩") {
      greenLetters.add(typeWord.charAt(i));
    }
    if(guessData[i] == "🟨") {
      yellowLetters.add(typeWord.charAt(i));
    }
    if(guessData[i] == "⬜") {
      greyLetters.add(typeWord.charAt(i));
    }
  }
  
  for(var i = 0; i < keyboard.length; i++) {
    if(greenLetters.has(keyboard[i].html().toUpperCase())) {
      keyboard[i].style("background-color", "rgb(0, 48, 135)");
    } else if(yellowLetters.has(keyboard[i].html().toUpperCase())) {
      keyboard[i].style("background-color", "rgb(0, 120, 233)");
    } else if(greyLetters.has(keyboard[i].html().toUpperCase())) {
      keyboard[i].style("background-color", "rgb(70, 70, 70)");
    }
  }
}

function checkGuess (guess, word) {
  word = word.toLowerCase();
  guess = guess.toLowerCase();
  
  var ret = ["⬜","⬜","⬜","⬜","⬜"];
  var d = new Map();

  for(var i = 0; i < guess.length; i++) {
    if(guess.charAt(i) == word.charAt(i)) {
      ret[i] = "🟩";
    } else {
      if(!d.has(word.charAt(i))) {
        d.set(word.charAt(i), 0);
      }
      d.set(word.charAt(i), d.get(word.charAt(i)) + 1);
    }
  }

  var hasWon = true;
  for(var i = 0; i < guess.length; i++) {
    if(ret[i] != "🟩") {
      hasWon = false;
      if(d.has(guess.charAt(i)) && d.get(guess.charAt(i)) > 0) {
        ret[i] = "🟨";
        d.set(guess.charAt(i), d.get(guess.charAt(i)) - 1);
      }
    }
  }

  if(hasWon) {
    gameWon = true;
  }

  return ret;
}

function win() {
  inMenu = true;
  select("#answer").html(word.toUpperCase());
  select("#description").html(description);
}


//Background Functions
function closeMenu() {
  inMenu = false;
  inHelp = false;
  winMenu.hide();
  helpMenu.hide();
  canvas.style("z-index", -1);
}

function openMenu() {
  if(gameWon == true || turn >= 6) {
    inMenu = true;
    select("#answer").html(word.toUpperCase());
    select("#description").html(description);
  }
}

function openHelp() {
  inHelp = true;
}

function flipGrid() {
  if(myGuessData[iteration] == "🟩" && iteration < 5) {
    grid[turn * 5 + iteration].style("animation", "flipGreen 0.4s ease-in-out 0s 1 forwards");
  }
  if(myGuessData[iteration] == "🟨" && iteration < 5) {
    grid[turn * 5 + iteration].style("animation", "flipYellow 0.4s ease-in-out 0s 1 forwards");
  }
  if(myGuessData[iteration] == "⬜" && iteration < 5) {
    grid[turn * 5 + iteration].style("animation", "flipGrey 0.4s ease-in-out 0s 1 forwards");
  }

  if(iteration == 5) {
    updateKeyboardColors(myGuessData);
    iteration = 0;
    turn++;
    typeWord = "";
    if(gameWon || turn >= 6) {
      win();
    }
  } else {
    iteration++;
    setTimeout(flipGrid, 400);
  }
}


function clickKey() {
  if(this.html().toLowerCase() == "del") {
    typeWord = typeWord.slice(0, -1);
    updateGuessText();
    return;
  }
  if(this.html() == "Enter") {
    submitGuess();
    updateGuessText();
    return;
  } 
  if(gameWon == false) {
    typeWord += this.html().toUpperCase();
  }
  updateGuessText();
  
}

function setupKeyboard() {
  keyboard = selectAll(".key");
  keyboard.push(selectAll(".wideButton")[0]);
  keyboard.push(selectAll(".wideButton")[1]);
  for(var i = 0; i < keyboard.length; i++) {
    keyboard[i].mouseClicked(clickKey);
  }
}

function createBoard() {
  gameBoard = select('#gameBoard');

  for(var i = 0; i < 30; i++) {
    let square = createDiv();
    square.class("square");
    square.id("square" + i.toString());
    gameBoard.child(square);
    grid[i] = square;
  }
}

function copyToClipboard(text) {
  var dummy = document.createElement("textarea");
  dummy.value = text;
  document.body.appendChild(dummy);
  dummy.select();
  document.execCommand('copy');
  document.body.removeChild(dummy);
}

function assignGuessColumns() {
  for(var i = 0; i < 6; i++) {
    guessColumns[i] = select("#dis" + i);
  }
}

function updateTime() {
  loadJSON(timeURL, gotTime);
}

function gotTime(data) {
  var temp = data.datetime;
  var dateTemp;
  dayOfYear = data.day_of_year;
  
  dateTemp = temp.split("T")[0];
  temp = temp.split("T")[1];
  dateTemp = dateTemp.split("-");
  time = temp.split(".")[0];
  var temp2 = temp.split(":");
  //console.log(temp)
  temp2[0] = (23 - parseInt(temp2[0])).toString();
  temp2[1] = (59 - parseInt(temp2[1])).toString();
  temp2[2] = (59 - parseInt(temp2[2])).toString();

  for(var i = 0; i < 3; i++) {
    if(temp2[i].length < 2) {
      temp2[i] = "0" + temp2[i]; 
    }
  } 

  time = temp2[0] + ":" + temp2[1] + ":" + temp2[2];
  date = dateTemp[1] + "/" + dateTemp[2] + "/" + dateTemp[0].substr(2, 2);
  countDown.html(time);

  if(loadGuess2) {
    setWord();
  } else {
    loadGuess1 = true;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  winMenu.position(width / 2 - winMenu.width / 2 ,height / 2 - winMenu.height / 2);
}

function keyPressed() {
  //console.log(String.fromCharCode(keyCode) + keyCode);

  

  if(keyCode >= 65 && keyCode <= 90 && typeWord.length < 5 && gameWon == false) {
    typeWord += String.fromCharCode(keyCode);
  }

  if(keyCode == 8) {
    typeWord = typeWord.slice(0, -1);
    updateGuessText();
  }

  if(keyCode == 13) {
    submitGuess();
  }

  if(keyCode == 27) {
    inMenu = false;
    inHelp  = false; 
    winMenu.hide();
    helpMenu.hide();
    canvas.style("z-index", -1);
  }

  updateGuessText();
}

function loadPossibleWords() {
  
  //console.log("possible + ", possible);

  for(var i = 0; i < possible.length; i++) {
    var temp = possible[i].split(":");
    //console.log(possible);
    possibleWords.push(temp[0]);
    descs.set(temp[0], temp[1]);
  }

  if(loadGuess1) {
    setWord();
  } else {
    loadGuess2 = true;
  }
}

function setWord() {
  if(isSet) {
    return;
  }
  var sel = dayOfYear - startDay;
  word = possibleWords[sel];
  description = descs.get(word);
  //console.log(possibleWords);
  isSet = true;
}
