// Sélection des éléments
const playButton = document.getElementById('playButton');
const betButton = document.getElementById('betButton');
const backgroundCanvas = document.getElementById('backgroundCanvas');
const gameCanvas = document.getElementById('gameCanvas');
const backgroundCtx = backgroundCanvas.getContext('2d');
const gameCtx = gameCanvas.getContext('2d');

// Fonction pour initialiser le canvas vert
function initializeGreenCanvas() {
    // Dessiner un fond vert sur le canvas de fond
    backgroundCtx.fillStyle = 'green';
    backgroundCtx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

    // Ajouter une pièce sur le canvas de jeu
    drawCoin();
}

// Fonction pour dessiner une pièce
function drawCoin() {
    const coinX = gameCanvas.width / 2;
    const coinY = gameCanvas.height / 3;
    const coinRadius = 40;

    // Dessiner un cercle pour représenter la pièce
    gameCtx.beginPath();
    gameCtx.arc(coinX, coinY, coinRadius, 0, Math.PI * 2);
    gameCtx.fillStyle = 'gold';
    gameCtx.fill();
    gameCtx.strokeStyle = 'darkgoldenrod';
    gameCtx.lineWidth = 5;
    gameCtx.stroke();

    // Ajouter un texte sur la pièce
    gameCtx.fillStyle = 'black';
    gameCtx.font = '20px Arial';
    gameCtx.textAlign = 'center';
    gameCtx.textBaseline = 'middle';
    gameCtx.fillText('Flip!', coinX, coinY);
}

// Ajouter un événement au clic sur le bouton "Play"
playButton.addEventListener('click', () => {
    // Masquer le bouton "Play"
    playButton.style.display = 'none';

    // Afficher le bouton "Bet"
    betButton.style.display = 'block';

    // Initialiser le canvas vert avec la pièce
    initializeGreenCanvas();
});