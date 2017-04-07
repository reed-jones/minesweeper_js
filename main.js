/**
 * @fileoverview A recreation of the classic game Minesweeper
 * @author reedjones@reedjones.com (Reed Jones)
 */

var height = 16;     //height of gameboard
var width = 30;      // width of gameboard
var maxBombs = 99;   // total number of bombs on screen

var boardArray; // array to store all the game tiles

var leftMouse = false;
var rightMouse = false;

var playing;    // "currently playing" boolean
var paused;
var time;
var difficulty = 2;
var score;      // game score (bombs remaining)
var seconds = document.getElementById("seconds");
setInterval(myTimer, 1000);

// press smiley
document.getElementById("newGame").addEventListener("mousedown", function(e) {
        document.getElementById("newGame").style.backgroundPosition = "-28px -40px";
});

document.getElementById("newGame").addEventListener("mouseup", function(e) {
    newGame();
});

document.getElementById("custDiffBtn").onclick = custSize;

var gameBoard = document.getElementById("gameBoard");

// disable default right click menu (for flags to function as expected)
gameBoard.oncontextmenu = function(){return false;};

window.addEventListener("load",  newGame, false);

var longtouch = false;
var touchStart;


gameBoard.ontouchstart = function(e) {
    longtouch = false;
    touchStart = setTimeout(function(){
        if ("vibrate" in navigator) {
            navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
            if (navigator.vibrate) {
                navigator.vibrate([15,15,15]);
            }
        }
        rightMouseClick(e);  
        longtouch = true;
    },500)
    //e.preventDefault();
}
gameBoard.ontouchend = function(e) {
    if(!longtouch){
        clearTimeout(touchStart);
        var clickX = parseInt(e.target.getAttribute("x"));
        var clickY = parseInt(e.target.getAttribute("y"));
        if (boardArray[clickY][clickX].isRevealed){
            doubleClick(e);
        } else {
            expandClick(e); 
        }    
    }
    longtouch = false;

    return false;

};

gameBoard.addEventListener("mousedown", function(e) {
    if(e.which == 1){
        leftMouse = true;
    }
    else if (e.which == 3){
        if(!leftMouse){
            rightMouseClick(e);
        }
        rightMouse = true;
    }
    if(playing) {
        document.getElementById("newGame").style.backgroundPosition = "-56px -40px";
    }
    showpress(e);
});

gameBoard.addEventListener("mouseup", function(e) {

    unpressTiles();
    if(leftMouse && rightMouse){
        leftMouse = false;
        rightMouse = false;

        doubleClick(e);
        // search nearby squares...
    }
    else if(leftMouse){
        expandClick(e);
        leftMouse = false;
    }
    else if (rightMouse) {
        
        rightMouse = false;
    }
    if (playing){
        document.getElementById("newGame").style.backgroundPosition = "0px -40px";
    }
});

/**
 * Tile Prototypes
 * @param {number} x axis on grid.
 * @param {number} y axis on grid,
 */
function Tile(x, y) {
    // coordinates
    this.X = x;
    this.Y = y;

    // nearby bomb count
    this.bombCount = 0;

    // drawing flags
    this.isBomb = false;

    // could use an enum instead. then could "rotate" through the stages
    this.isRevealed = false;
    this.isFlagged = false;
    this.isGuessed = false;
}

/********************** game setup *********************************/
/**
 * initialize gameBoard
 */
function newGame() {
    // hide custom board size (if shown)
    $('#custDiff').collapse('hide');


        // pull latest scoreboard incase someone beat you while you werent looking
    getScores();
    // get the desired difficulty

    // start playing
    playing = true;
    paused = true;

    // reset timer
    seconds.innerHTML = time = 0;

    // refresh scoreboard
    score = maxBombs;

    // initialize tiles & randomize mine layout
    makeBoard();

    // draw to screen
    displayBoard();

    // unpress all tiles when mouse leaves the game area
     var board = document.getElementById("gameBoard");
    board.onmouseleave = unpressTiles;
    board.style.width = width * 18 + 'px';
    document.getElementById("gameHeader").style.width = (width * 18) + 6 + 'px';

    document.getElementById("newGame").style.backgroundPosition = "0px -40px";
    // equation of a line
    document.getElementById("newGame").style.marginLeft = 0.48177*(width*18)-73 + 'px';
    // 30 tiles = 190px
    // 16 tiles = 60px
    // tile size = 18px
    document.getElementById("wholeGame").style.width = (width * 18) + 6 + 'px';
    // board.style.height = height * 18 + 'px';


}

/**
 * Generate game board array
 */
function makeBoard() {
    // generate full sized board without bombs
    boardArray = new Array(height);
    for (var y = 0; y < height; y++)
    {
        boardArray[y] = new Array(width);
        for (var x = 0; x < width; x++)
        {
            boardArray[y][x] = new Tile(x, y);
        }
    }
}

function addBombs(startX, startY) {
	// load up random bomb positions
    var bombs = 0;
    do
    {
        var y = Math.floor(Math.random() * height);
        var x = Math.floor(Math.random() * width);
        var t = boardArray[y][x];
		
		// check if its already a bomb, dont count it
        if (t.isBomb) {
			continue;
        }
        
		// if its too close to mouse pointer, dont count it
		if ((startX - x === 0) && (startY - y === 0)) {
			continue;
        }
		
		t.isBomb = true;
		bombs++;
		
		// increment bombcount of nearby tiles
		exploreNearbyTiles(countBombs, x,  y );
        
    } while (bombs < maxBombs);
}

/**
 * generate game board html
 */
function displayBoard() {
    // update scoreboard
    document.getElementById("score").innerHTML = score;

    var board = document.getElementById('gameBoard');
    
    var boardBuilder = [];
    var winCondition = 0;
    var h = boardArray.length;
    // itterate throught the board drawing each tile
    for (var y = 0; y < h; y++)
    {
        var w = boardArray[y].length;
        for (var x = 0; x < w; x++)
        {
            // current game tile
            var tile = boardArray[y][x];

            // add flag classes, to adjust css background
            var state = "";
            if(tile.isRevealed)
            {
                state = "show" + tile.bombCount;
                winCondition++;
            }
            else if (tile.isGuessed) 
                state = "guess";
            else if (tile.isFlagged)
                state = "flag";
            // add html to string
            boardBuilder.push('<div class="tile ' + state + '" x="' + x + '" y="' + y + '""></div>'); 
        }
    }

    // update gameBoard
    board.innerHTML = boardBuilder.join("");
    var tiles = document.getElementsByClassName("tile");
    for (var i = 0; i < tiles.length; i++)
    {
        tiles[i].onmousemove = showpress;
    }
    // check if player won the game
    if(winCondition == (width * height) - maxBombs)
        winGame();
}
/*************************** end of game setup ***************************/
function custSize(){
    // for(i = 0; i < document.getElementsByName("difficulty").length; i++) {
    //     document.getElementsByName("difficulty")[i].checked = false;
    // }
    var h = document.getElementById("height");
    var w = document.getElementById("width");
    var m = document.getElementById("mines");


    // validate length/width & push back validated sizes
    height = h.value = (h.value === "" || h.value < 1) ? 1 : parseInt(h.value);
    width = w.value = (w.value === "" || w.value < 9) ? 9 : parseInt(w.value);


    // validating minefield
    if (m.value > (h.value) * (w.value) - 1)
        m.value =  (h.value) * (w.value) - 1;

    maxBombs = m.value = (m.value === "" || m.value < 1) ? 1 : parseInt(m.value);
    difficulty = 3;
    newGame();
}
/********************************** Mouse Events **************************************/
/**
 * recursively search for bombs starting from the user selected tile
 * @param {EventTarget} mouse click event
 */
function expandClick(e) {
    //if (e.which != 1) return; // ensure its the leftMouse click

    // save tile location
    var clickX = parseInt(e.target.getAttribute("x"));
    var clickY = parseInt(e.target.getAttribute("y"));

    // check if it is actually on the game board
    if(isNaN(clickX || clickY)) return;

    // if not playing, exit
    if (!playing) return;

    if (paused) {
        addBombs(clickX, clickY);
        paused = false;
    }

    var t = boardArray[clickY][clickX];

    // check if it has already been processed
    if(t.isRevealed) return;

    // check if it has a "safety" flag turned on
    if(t.isFlagged) return;

    // check if its a bomb
    if(t.isBomb)
    {
        // if so, game game over
        gameOver(clickX, clickY);
        return;
    }

    // begin recursion, searching for more visible tiles
    findBombs(clickX, clickY);
    displayBoard();
}

/**
 * rightMouse click menu override
 * @param {EventTarget} mouse click event
 */
function rightMouseClick(event) {
    
    // get x and y coordinates of clicked tile
    var clickX = parseInt(event.target.getAttribute("x"));
    var clickY = parseInt(event.target.getAttribute("y"));
    
    // clicked outside the game board?
    if(isNaN(clickX ||clickY)) return;

    // check if game is in progress
    if (!playing) return;
    if (paused) {
        addBombs(clickX, clickY);
        paused = false;
    }

    var here = boardArray[clickY][clickX];

    // dont process if its already been clicked
    if(here.isRevealed) return;

    // rotate through rightMouse click flag states
    if(here.isGuessed)  // question mark
    {
        here.isGuessed = false;
        here.isFlagged = false;
    }
    else if (here.isFlagged) // mine flag
    {
        here.isGuessed = true;
        here.isFlagged = false;
        score++;
    }
    else // blank
    {
        here.isFlagged = true;
        here.isGuessed = false;
        score--;
    }

    // update game board
    displayBoard();

    return;     // cancel default menu
}

/**
 * if the correct number of flags have been selected around the clicked tile
 * then double click will reveal all remaining tiles
 * @param {event} tile on which the mouse clicked
 */
function doubleClick(e){
    // get x and y coordinates of clicked tile
    var x = parseInt(e.target.getAttribute("x"));
    var y = parseInt(e.target.getAttribute("y"));
    var t = boardArray[y][x];

    if(!t.isRevealed) return;

    var flags = 0;
    
    flags  = exploreNearbyTiles(countFlags, x, y);
            
    if (flags != t.bombCount) return;

    // returns true true if dead
    if(!exploreNearbyTiles(cleanTiles, x, y)){
        displayBoard();
    }
    else {
        multiDead(x, y);
    }
}

/**
 * adds css class to display tile as pressed down
 * @param {event} tile being pressed down 
 */
function showpress(event){
    // ensure it was the left mouse, and a game 
    if (!playing) return;
    unpressTiles();
    var e = event.target;
    var x = parseInt(e.getAttribute("x"));
    var y = parseInt(e.getAttribute("y"));
    var b = boardArray[y][x];
    if(leftMouse && rightMouse) {
        if(b.isGuessed && !b.isRevealed){
            e.classList.add("guessPress");
        }
        else if (!b.isRevealed){
            e.classList.add("pressed");
        }
        exploreNearbyTiles(pressSquare,x, y);
    }
    else if (leftMouse && !b.isRevealed){
        if(b.isGuessed){
            e.classList.add("guessPress");
        }
        else{
            e.classList.add("pressed");
        }
    }
    // else if (rightMouse && !b.isRevealed){
    //     e.classList.add("flagPress");
    // }
}

/**
 * remove all pressed classes, effectively unpressing all the tiles
 */
function unpressTiles(){
    var pressed = document.getElementsByClassName("tile");
    for (var i = 0; i < pressed.length; i++) {
        //if (event.target != tiles[i])
        pressed[i].classList.remove("pressed");
        pressed[i].classList.remove("flagPress");
        pressed[i].classList.remove("guessPress");
    }
}

function pressSquare(x, y){
        var cc = gameBoard.querySelector('[x="' + x + '"][y="' + y + '"]');
        var t = boardArray[y][x];

        if (t.isRevealed) return;

        if(t.isGuessed){
            cc.classList.add("guessPress");
        }
        else{
            cc.classList.add("pressed");
        }
}
/*********************************end of mouse events ****************************/

/************************* tile exploration and helper functions *****************/
/**
 * recursively call fundBombs in every direction from given tile
 * @param {Object.<number, number>}  coordinates of the given tile
 */
function exploreNearbyTiles(func, Xaxis, Yaxis){
    var result = 0;
    for (var x = Xaxis - 1; x <= Xaxis + 1; x++){
        for(var y = Yaxis - 1; y <= Yaxis + 1; y++){
            // dont process center tile
            if (x == Xaxis && y == Yaxis){
                continue;
            }
            // ensure tile is within boarder
            if (x < 0 || y < 0 || x >= width || y >= height){
                continue;
            }
            // save return value; but leave rest of error checking to function
            result += func(x, y);
        }
    }
    return result;
}

/**
 * increases current tiles bomb count. Is called on every tile surrounding a bomb during
 * board creation.
 * @param {Object.<number, number>} accepts X and Y points of a tile 
 */
function countBombs(x, y){
    boardArray[y][x].bombCount++;
}

/**
 * count nearby bombs, and move neighbour squares for checking
 * uses recursion
 * @param {Object.<number, number>}  coordinates of the given tile
 */
function findBombs(x, y) {
    
    var t = boardArray[y][x];
    
    if (t.isBomb) return;

    // if its already been revealed
    if(t.isRevealed) return;

    // if its got a safety flag on
    if (t.isFlagged) return;

    // survived the gauntlet. Reveal the tile.
    t.isRevealed = true;  

    // dont explore past tiles with a bomb count
    if(t.bombCount !== 0) return;
        
    // if no bombs found, explore outwards in every direction
    exploreNearbyTiles(findBombs, x, y);
}

/**
 * error checks and reveals a tile
 * @param {Object.<number, number>} x/y point of a tile
 */
function revealAdjacent(x, y){
    if (boardArray[y][x].isFlagged) return;

    boardArray[y][x].isRevealed = true;
}

/******************* end of tile exploration and helper functions ****************/

/**
 * counts nearby flags and returns value
 */
function countFlags(x, y){
    var count = 0;

    if (boardArray[y][x].isFlagged) {
        count++;
    }

    return count;
}

/**
 * reveals tiles. Used so that double click begins recursion also
 * @param {Object.<number, number>} x/y point of a tile 
 */
function cleanTiles(x, y){

    if(boardArray[y][x].isFlagged) return 0;

    if(boardArray[y][x].isBomb) return 1;

    // begin recursion from here
    findBombs(x, y);

    return 0;
    
}

/******************** endgame conditions ***********************/
/**
 * Reveal entire board when win condition is met
 */
function winGame(){
    var bombsFound = width * height;
    for(var y = 0; y < height; ++y) {
        for (var x = 0; x < width; ++x) {
            if (boardArray[y][x].isRevealed)
                bombsFound--;
        }
    }

    if(bombsFound != maxBombs)
    {
        alert("Quit trying to cheat! ;)");
        return;
    }

    // stop playing. You won!
    playing = false;
    paused = true;

    var board = document.getElementById('gameBoard');
    var boardBuilder = '';
    var h = boardArray.length;

    for (var y = 0; y < h; y++)
    {
        var w = boardArray[y].length;
        for (var x = 0; x < w; x++)
        {
            var tile = boardArray[y][x];

            // ensure that if only mines are remaining, they all get a flag.
            var state = tile.isRevealed ? "show" + tile.bombCount : "flag";
            
            boardBuilder += '<div class="tile ' + state + '" x="' + x + '" y="' + y + '""></div>'; 
        }
    }

    // update scoreboard (0 becuase you won)
    document.getElementById("score").innerHTML = score = 0;

    document.getElementById("newGame").style.backgroundPosition = "-112px -40px";
    // redraw board
    board.innerHTML = boardBuilder;
    setTimeout(addScores, 500);
}

/**
 * get game difficulty for next game
 * @param {number}  x - coordinate of mouse click that found the bomb
 * @param {number}  y coordinate of the mouse click that found the bomb
 */
function gameOver(X, Y) {
    // stop playing. You lost!
    playing = false;
    paused = true;

    var board = document.getElementById('gameBoard');
    var boardBuilder = '';

    for (var y = 0; y < boardArray.length; y++)
    {
        var row = boardArray[y];
        for (var x = 0; x < row.length; x++)
        {
            var tile = boardArray[y][x];
            var state = "";

            // if this was the tile that killed you
            if (x == X && y == Y)
                state = "killer";
            
            // show tiles you have already revealed
            else if(tile.isRevealed)
                state = "show" + tile.bombCount;
            // good flagging!
            else if (tile.isFlagged && tile.isBomb) 
                state = "flag";
            // thats a bomb...
            else if (tile.isBomb)
                state = "bomb";
            // why you flagging non-bombs?
            else if (tile.isFlagged)
                state = "badGuess";
            
            boardBuilder += '<div class="tile ' + state + '" x="' + x + '" y="' + y + '""></div>'; 
        }
    }
    board.innerHTML = boardBuilder;

    document.getElementById("newGame").style.backgroundPosition = "-84px -40px";
}

/**
 * double click kills can result in multiple death bombs per click
 * @param {number} X axis
 * @param {number} Y axis
 */
function multiDead(X,Y){
    // reveal all adjacent tiles.
    exploreNearbyTiles(revealAdjacent,X, Y);

    playing = false;
    paused = true;

    var board = document.getElementById('gameBoard');
    var boardBuilder = '';

    for (var y = 0; y < boardArray.length; y++)
    {
        var row = boardArray[y];
        for (var x = 0; x < row.length; x++)
        {
            var tile = boardArray[y][x];
            var state = "";
            
            if ((Math.abs(x - X) <= 1 && Math.abs(y - Y) <= 1) && boardArray[y][x].isBomb && !boardArray[y][x].isFlagged) {
                state = "killer";
            }
            
            // show tiles you have already revealed
            else if(tile.isRevealed)
                state = "show" + tile.bombCount;
            // good flagging!
            else if (tile.isFlagged && tile.isBomb) 
                state = "flag";
            // thats a bomb...
            else if (tile.isBomb)
                state = "bomb";
            // why you flagging non-bombs?
            else if (tile.isFlagged)
                state = "badGuess";
            
            boardBuilder += '<div class="tile ' + state + '" x="' + x + '" y="' + y + '""></div>'; 
        }
    }
    board.innerHTML = boardBuilder;

    document.getElementById("newGame").style.backgroundPosition = "-84px -40px";
}
/*********************** end of endgame conditions ********************/

/********************** scoreboard functionality ****************************/
/**
 * simple timer function to keep track of gametime
 */
function myTimer(){
    if(time >= 999)
    {
        seconds.innerHTML = time = 999;
        return;
    }
    if (!paused){
        seconds.innerHTML = ++time;
    }
}

/**
 * retrieve latest list of high scores and update table
 */
function getScores() {
    $.get("getHighScores.php", function(data) {
        document.getElementById("highScores").innerHTML = data;

        switch(difficulty){
            case 0:
                document.getElementById("diffEasy").style.display = "block";
                document.getElementById("diffMedium").style.display = "none";
                document.getElementById("diffHard").style.display = "none";
                break;
            case 1:
                document.getElementById("diffEasy").style.display = "none";
                document.getElementById("diffMedium").style.display = "block";
                document.getElementById("diffHard").style.display = "none";
                break;
            case 2:
                document.getElementById("diffEasy").style.display = "none";
                document.getElementById("diffMedium").style.display = "none";
                document.getElementById("diffHard").style.display = "block";
                break;
            case 3:
                document.getElementById("diffEasy").style.display = "none";
                document.getElementById("diffMedium").style.display = "none";
                document.getElementById("diffHard").style.display = "none";
                break;
        }
    });


    
}

/**
 * posts score to database after win
 * @param {string} name 
 * @param {number} time 
 * @param {number} 0, 1, or 2 {easy, medium, hard} 
 */
function postScore(name, time, difficulty) {
    $.post("addHighScores.php", {
        n: name,
        t: time,
        d: difficulty
    });
    setTimeout(getScores, 500);
}

/**
 * get usersname, calculate difficulty, and save time
 */
function addScores() {
    var difficulty = 0;

    if(height == 9 && width == 9 && maxBombs == 10) {
        difficulty = 0;
    }
    else if (height == 16 && width == 16 && maxBombs == 40) {
        difficulty = 1;
    }
    else if (height == 16 && width == 30 && maxBombs == 99) {
        difficulty = 2;
    }
    else {
        //console.log("Not playing default difficulty");
        return;
    }

    //time = parseInt(seconds.innerHTML);
    var s = prompt("Congratulations, you finished in " + time + " seconds!\nEnter your name if you wish to be added to the High score table:");

    if (s !== null){
        postScore(s, time, difficulty);
    }
}
/********************** end of scoreboard functionality **********************/

/************************* Menus *******************************************/
var gameMenu = [{
        name: 'New Game',
        // img: 'images/create.png',
        title: 'Start A New Game',
        fun: function () {
            newGame();
        }
    }, {
        name: 'Easy',
        // img: 'images/update.png',
        title: 'Easy Difficulty',
        fun: function () {
            height = 9;
            width = 9;
            maxBombs = 10;
            difficulty = 0;
            newGame();
        }
        
    }, {
        name: 'Medium',
        // img: 'images/update.png',
        title: 'Medium Difficulty',
        fun: function () {
            height = 16;
            width = 16;
            maxBombs = 40;
            difficulty = 1;
            newGame();
        }
        
    },{
        name: 'Hard',
        // img: 'images/update.png',
        title: 'Hard Difficulty',
        fun: function () {
            height = 16;
            width = 30;
            maxBombs = 99;
            difficulty = 2;
            newGame();
        }
    },{
        name: 'Custom',
        // img: 'images/update.png',
        title: 'Not Yet Implemented',
        disable: false,
        fun: function () {
            $('#custDiff').collapse('show');
        }
    }];
     
//Calling context menu
$('#gameMenu').contextMenu(gameMenu);

var helpMenu = [{
        name: 'About',
        // img: 'images/create.png',
        title: 'About',
        fun: function () {
            // alert();
        }
    }];
     
//Calling context menu
$('#helpMenu').contextMenu(helpMenu);
/********************** End Of Menus *********************************/

$(function() {
  $("#instructions").draggable();
  $('[name="newFolder"]').draggable();
  $("#wholeGame").draggable({ handle: "#titleBar" });
});