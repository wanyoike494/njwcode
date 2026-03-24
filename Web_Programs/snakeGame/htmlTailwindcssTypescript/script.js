// 1️⃣ Tell TypeScript what type of element playBoard is
var playBoard = document.querySelector(".play-board");
var foodX = 13;
var foodY = 10;
// 2️⃣ Initialize the game
var initGame = function () {
    // Create the HTML string using template literals
    var htmlMarkup = "<div class=\"food\" style=\"grid-area: ".concat(foodY, " / ").concat(foodX, "\"></div>");
    // ⚠️ TypeScript needs to know playBoard exists
    if (playBoard) {
        playBoard.innerHTML = htmlMarkup;
    }
    else {
        console.error("Play board element not found!");
    }
};
// 3️⃣ Run the game initialization
initGame();
