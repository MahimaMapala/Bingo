document.addEventListener("DOMContentLoaded", () => {
    const numbersPanel = document.getElementById("numbers");
    const bingoBoard = document.getElementById("bingo-board");
    const autoFillBtn = document.getElementById("auto-fill");
    const resetBtn = document.getElementById("reset");
    const startGameBtn = document.getElementById("start-game");
    const gameStatus = document.getElementById("game-status");
    const winPopup = document.getElementById("win-popup");
    const closePopupBtn = document.getElementById("close-popup");
    let gameStarted = false;
    let previousSelectedNumber = null;


    function createNumberElements() {
        let numberSelection = document.getElementById("numbers");
        numberSelection.innerHTML = ""; // Clear previous numbers
     //   winPopup.style.display = "flex"; // Show pop-up

        for (let i = 1; i <= 25; i++) {
            let number = document.createElement("div");
            number.textContent = i;
            number.draggable = true;
            number.addEventListener("dragstart", dragStart);
            number.addEventListener("touchstart", touchStart);  
            numberSelection.appendChild(number);
            }
    }
    

    
    function createBoard() {
        let bingoBoard = document.getElementById("bingo-board"); // Ensure board is selected
        bingoBoard.innerHTML = ""; // Clear existing board
    
        for (let i = 0; i < 25; i++) {
            checkBoardFull(); 
            const cell = document.createElement("div");
            cell.classList.add("board-cell");
    
            // Allow drop for empty cells only
            cell.addEventListener("dragover", dragOver);
            cell.addEventListener("drop", drop);
    
            // Mobile touch support
            cell.addEventListener("touchmove", touchMove);
            cell.addEventListener("touchend", touchEnd);
    
            // Clicking to mark numbers in game phase
            cell.addEventListener("click", markNumber);


            cell.addEventListener("dblclick", removeNumber);
            cell.addEventListener("touchend", (event) => simulateDoubleClick(event, removeNumber)); // Mobile Double-Tap
            // Allow removing before game starts
    
            bingoBoard.appendChild(cell);
        }
        
        checkBoardFull(); // Ensure Start Button only activates when board is full
    }
    

    function dragStart(event) {
        if (gameStarted) return;
        if (previousSelectedNumber) removeSelected();
        event.dataTransfer.setData("text", event.target.textContent);
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        if (gameStarted) return;
        let draggedNumber = event.dataTransfer.getData("text");
        let targetCell = event.target;

        if (targetCell.textContent === "") {
            targetCell.textContent = draggedNumber;

            // Remove the dragged number from the selection panel
            let draggedElement = Array.from(numbersPanel.children).find(el => el.textContent === draggedNumber);
            if (draggedElement) draggedElement.remove();
        }
        selectedNumber.remove(); // Remove from selection
        selectedNumber = null;
        checkBoardFull();
    }

    // Allow Drop (For Desktop)
function allowDrop(event) {
    event.preventDefault();
}

// Variable to track the previously selected element

function removeSelected(){
    previousSelectedNumber.classList.remove("picked-up");
    previousSelectedNumber = null;
    selectedNumber = null;

}


function touchStart(event) {
    // If there was a previously selected element, reset it
    if (previousSelectedNumber) removeSelected();


    // Set the newly selected element
    selectedNumber = event.target;

    // Add the 'picked-up' class to the new selected element
    selectedNumber.classList.add("picked-up");

    // Update the reference to the current selected element
    previousSelectedNumber = selectedNumber;
}


// Touch Move (Prevent Default Scroll)
function touchMove(event) {
    event.preventDefault();
}


function updateGameStatus(message) {
    let gameStatus = document.getElementById("game-status");
    gameStatus.textContent = message; // This replaces the old text
}



// Touch End (For Mobile Drop)
function touchEnd(event) {
    let touch = event.changedTouches[0];
    let targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

    if (targetElement && targetElement.textContent === "") {
        targetElement.textContent = selectedNumber.textContent;
        selectedNumber.classList.remove("picked-up");
        selectedNumber.remove(); // Remove from selection
        selectedNumber = null;
        previousSelectedNumber = null;
        checkBoardFull();
    }
}

    function removeNumber(event) {
        if (gameStarted) return;

        if (previousSelectedNumber) { removeSelected();
        }

        let removedNumber = event.target.textContent;
        if (removedNumber) {
            event.target.textContent = "";
            createNumberElement(removedNumber);
        }
        autoFillBtn.style.display = 'inline-block';
        checkBoardFull();
    }

    function markNumber(event) {
        if (!gameStarted) return; // Ensure game has started
    
        let cell = event.target;
    
        if (!cell.classList.contains("marked") && cell.textContent !== "") {
            cell.classList.add("marked"); // Just add the class
            checkBingo();
        }
    }
    
    function resetGame() {
        location.reload(); // Refresh the page
    }
    

    

    function checkBingo() {
        let board = Array.from(bingoBoard.children);
        let rows = [], cols = [], diag1 = [], diag2 = [];

        for (let i = 0; i < 5; i++) {
            rows.push(board.slice(i * 5, i * 5 + 5));
            cols.push([board[i], board[i + 5], board[i + 10], board[i + 15], board[i + 20]]);
            diag1.push(board[i * 6]);
            diag2.push(board[i * 4 + 4]);
        }

        let allLines = [...rows, ...cols, diag1, diag2];
        let completedLines = allLines.filter(line => line.every(cell => cell.classList.contains("marked"))).length;
        highlightBingo(completedLines);
    }

    function highlightBingo(completedLines) {
        let bingoLetters = document.querySelectorAll(".bingo-labels div");
        for (let i = 0; i < completedLines; i++) {
            if (i < 5) bingoLetters[i].classList.add("highlight");
        }
        if (completedLines >= 5) {
            setTimeout(() => {
                winPopup.style.display = "flex"; // Show pop-up
            }, 200);
        }
    }
    


    function createNumberElement(number) {
        const numberDiv = document.createElement("div");
        numberDiv.textContent = number;
        numberDiv.draggable = true;
        numberDiv.addEventListener("dragstart", dragStart);
        numberDiv.addEventListener("touchstart", touchStart);
        numbersPanel.appendChild(numberDiv);
    }


    function checkBoardFull() {
        let allFilled = Array.from(bingoBoard.children).every(cell => cell.textContent !== "");
        startGameBtn.disabled = !allFilled;
        startGameBtn.classList.toggle("active", allFilled); // Change color when active
        autoFillBtn.style.display = allFilled ? 'none' : 'inline-block';
        allFilled ? updateGameStatus("Click On Start Game to Begin") : updateGameStatus("Drag-Drop the Numbers or Autofill");
        numbersPanel.style.display = allFilled ? "none" : "flex";

    }
        

    autoFillBtn.addEventListener("click", () => {
        if (gameStarted) return;
        let allNumbers = Array.from({ length: 25 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
        let cells = bingoBoard.children;
        numbersPanel.innerHTML = "";
        for (let i = 0; i < 25; i++) {
            cells[i].textContent = allNumbers[i];
        }
        autoFillBtn.style.display = "none";

        checkBoardFull();
    });


    startGameBtn.addEventListener("click", () => {
        gameStarted = true;
        autoFillBtn.style.display = "none";
        //resetBtn.style.display = "none"; // Hide reset button after game starts
        updateGameStatus("Game Started! Mark Your Numbers!");
        startGameBtn.style.display = "none"; // Hide "Select Numbers" heading
    });

    // Close pop-up and reset the game
    closePopupBtn.addEventListener("click", () => {
        winPopup.style.display = "none"; // Hide pop-up
        resetGame(); // Reset the game
    });

    createNumberElements();
    createBoard();
    updateGameStatus("Drag-Drop the Numbers or Autofill");

});
