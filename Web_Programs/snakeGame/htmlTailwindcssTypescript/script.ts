// 1️⃣ Tell TypeScript what type of element playBoard is
const playBoard = document.querySelector<HTMLDivElement>(".play-board");

let foodX: number = 13;
let foodY: number = 10;

// 2️⃣ Initialize the game
const initGame = (): void => {
    // Create the HTML string using template literals
    let htmlMarkup: string = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    // ⚠️ TypeScript needs to know playBoard exists
    if (playBoard) {
        playBoard.innerHTML = htmlMarkup;
    } else {
        console.error("Play board element not found!");
    }
}

// 3️⃣ Run the game initialization
initGame();
