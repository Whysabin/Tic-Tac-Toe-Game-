let gameMode = "single";
let currentPlayer = "x";
let gameState = Array(9).fill(null);
const winningCombinations = [
  [0, 1, 2], [3, 4, 5],
  [6, 7, 8], [0, 3, 6],
  [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

let player1Wins = 0;
let player2Wins = 0;
let computerWins = 0;
let ties = 0;

window.addEventListener("load", function() {
  setTimeout(() => {
    document.getElementById("preloader").style.display = "none";
  }, 3000);
});

let firstPlayer = "x"; // Track who starts the game

function startGame(mode) {
    gameMode = mode;
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "flex";
    
    // Set up visibility based on game mode
    document.getElementById("computerWinCounter").style.display = gameMode === "single" ? "inline" : "none";
    document.getElementById("player2WinCounter").style.display = gameMode === "multi" ? "inline" : "none";
  
    document.querySelectorAll(".cell").forEach((cell, index) => {
      cell.addEventListener("click", () => handleMove(cell, index));
      cell.setAttribute("data-index", index);
    });
  
    // Start the game, alternates who plays first based on game mode and last player
    if (gameMode === "single") {
      currentPlayer = firstPlayer; // AI or Player starts first based on the previous game
      if (currentPlayer === "o") {
        setTimeout(() => aiMove(), 500); // If AI plays first, make AI move immediately
      }
    } else {
      currentPlayer = firstPlayer; // In multi-player, always alternate
    }
  
    toggleTurn(currentPlayer === "x");
  }
  

// Handle the browser's back button
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.page === 'game') {
    // User clicked the back button from the game mode, so return to Choose Mode
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("startScreen").style.display = "block";

    // Reset game state and display styles
    resetGame();

    // Ensure any dynamically applied styles are reset
    document.getElementById("startScreen").style.display = "flex"; // reset the start screen display

    // Optional: Reset other styles that may have been changed during gameplay
    document.getElementById('player1WinCount').textContent = "0"; // reset counters
    document.getElementById('player2WinCount').textContent = "0"; // reset counters
    document.getElementById('computerWinCount').textContent = "0"; // reset counters
    
    // Reset any other UI components to match the original state
    document.getElementById("winPopup").style.display = "none"; // hide any popups
    // Add any additional reset styling here

    // Optionally, reset the game mode if needed
    gameMode = "single"; // or leave it as is if you want to preserve the previous mode
    console.log("Returning to Choose Mode screen.");
  }
});

function toggleTurn(isXTurn) {
  const playerElement = document.querySelector('.players');
  playerElement.classList.toggle('Xturn', isXTurn);
  playerElement.classList.toggle('Oturn', !isXTurn);
}

function handleMove(cell, index) {
  if (gameState[index] !== null || checkWin()) return;

  gameState[index] = currentPlayer;
  cell.textContent = currentPlayer.toUpperCase();
  cell.classList.add(currentPlayer);

  if (currentPlayer === "x") {
    xSound.currentTime = 0;
    xSound.play();
  } else {
    oSound.currentTime = 0;
    oSound.play();
  }

  setTimeout(() => {
    if (checkWin()) {
      displayWinMessage(currentPlayer);
      updateWinCount(currentPlayer);
      resetGame();
    } else if (!gameState.includes(null)) {
      displayWinMessage("tie");
      ties++;
      document.getElementById('tieCount').textContent = ties;
      resetGame();
    } else {
      currentPlayer = currentPlayer === "x" ? "o" : "x";
      toggleTurn(currentPlayer === "x");

      if (gameMode === "single" && currentPlayer === "o") {
        setTimeout(() => aiMove(), 500);
      }
    }
  }, 300);
}

function updateWinCount(winner) {
  if (winner === "x") {
    player1Wins++;
    document.getElementById('player1WinCount').textContent = player1Wins;
  } else if (winner === "o" && gameMode === "single") {
    computerWins++;
    document.getElementById('computerWinCount').textContent = computerWins;
  } else if (winner === "o" && gameMode === "multi") {
    player2Wins++;
    document.getElementById('player2WinCount').textContent = player2Wins;
  }
}

function aiMove() {
    const bestSpot = minimax(gameState, "o").index;
    gameState[bestSpot] = "o";
  
    const cell = document.querySelector(`.cell[data-index='${bestSpot}']`);
    cell.textContent = "O";
    cell.classList.add("o");
  
    oSound.currentTime = 0;
    oSound.play();
  
    setTimeout(() => {
      if (checkWin()) {
        displayWinMessage("o");
        updateWinCount("o");
        resetGame();
      } else if (!gameState.includes(null)) {
        displayWinMessage("tie");
        resetGame();
      } else {
        currentPlayer = "x";
        toggleTurn(true); // Switch turn back to X
      }
    }, 300);
  }

function minimax(newBoard, player) {
  const emptySpots = newBoard.filter(s => s === null);
  if (checkWinState(newBoard, "x")) return { score: -1 };
  if (checkWinState(newBoard, "o")) return { score: 1 };
  if (emptySpots.length === 0) return { score: 0 };

  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (newBoard[i] === null) {
      const move = { index: i };
      newBoard[i] = player;
      move.score = minimax(newBoard, player === "o" ? "x" : "o").score;
      newBoard[i] = null;
      moves.push(move);
    }
  }
  return player === "o"
    ? moves.reduce((best, move) => (move.score > best.score ? move : best))
    : moves.reduce((best, move) => (move.score < best.score ? move : best));
}

function checkWin() {
  return winningCombinations.some(combination =>
    combination.every(index => gameState[index] === currentPlayer)
  );
}
function resetGame() {
    gameState.fill(null);  // Reset the game state
    
    // Determine who starts based on the previous game outcome or reset to "x" first
    if (gameMode === "single") {
      // Alternate first player between "x" and "o" on each game
      firstPlayer = (player1Wins + computerWins) % 2 === 0 ? "x" : "o"; 
    } else {
      firstPlayer = (player1Wins + player2Wins) % 2 === 0 ? "x" : "o"; // For multiplayer, alternate
    }
    
    currentPlayer = firstPlayer; // Set the current player to the updated first player
    
    // Reset the game board display
    document.querySelectorAll(".cell").forEach(cell => {
      cell.className = "cell";  // Reset class
      cell.textContent = "";    // Clear text (X or O)
    });
    
    // Toggle turn (True means it's X's turn, False means it's O's turn)
    toggleTurn(currentPlayer === "x");
    
    // Hide win popup if it was shown
    document.getElementById("winPopup").style.display = "none";
    
    // If it's the AI's turn (O), make the move automatically after a short delay
    if (gameMode === "single" && currentPlayer === "o") {
      setTimeout(() => aiMove(), 500);  // Allow AI time to move after reset
    }
  }
  
  
  
  
  // Handle the player's turn and check if the game is over
  function handleMove(cell, index) {
    if (gameState[index] !== null || checkWin()) return;
  
    gameState[index] = currentPlayer;
    cell.textContent = currentPlayer.toUpperCase();
    cell.classList.add(currentPlayer);
  
    if (currentPlayer === "x") {
      xSound.currentTime = 0;
      xSound.play();
    } else {
      oSound.currentTime = 0;
      oSound.play();
    }
  
    setTimeout(() => {
      if (checkWin()) {
        displayWinMessage(currentPlayer);
        updateWinCount(currentPlayer);
        resetGame();
      } else if (!gameState.includes(null)) {
        displayWinMessage("tie");
        ties++;
        document.getElementById('tieCount').textContent = ties;
        resetGame();
      } else {
        currentPlayer = currentPlayer === "x" ? "o" : "x";
        toggleTurn(currentPlayer === "x");
  
        if (gameMode === "single" && currentPlayer === "o") {
          setTimeout(() => aiMove(), 500);
        }
      }
    }, 300);
  }
  

function displayWinMessage(winner) {
  const winMessage = document.getElementById("winMessage");
  const winPopup = document.getElementById("winPopup");

  if (winner === "tie") {
    winMessage.textContent = "It's a Draw!";
  } else if (winner === "x") {
    winMessage.textContent = "Player 1 Wins! 🎉";
  } else if (winner === "o" && gameMode === "multi") {
    winMessage.textContent = "Player 2 Wins! 🎉!";
  } else if (winner === "o" && gameMode === "single") {
    winMessage.textContent = "Computer Wins!";
  }

  // Ensure styles apply with a delay
  setTimeout(() => {
    winPopup.style.display = "flex";
    winPopup.classList.add("fade-in");
    console.log("Win popup display after delay:", winPopup.style.display);
  }, 200);  // Small delay to ensure the element is updated
}

function restartGame() {
  resetGame();
  // Hide the win popup when restarting the game
  document.getElementById("winPopup").style.display = "none";
  // Optional: remove the fade-in class so the popup can fade in next time
  document.getElementById("winPopup").classList.remove("fade-in");
}

function checkWinState(board, player) {
  return winningCombinations.some(combo =>
    combo.every(index => board[index] === player)
  );
}

// Audio elements
const oSound = document.getElementById('oSound');
const xSound = document.getElementById('xSound');
xSound.volume = 0.15;
oSound.volume = 0.15;
