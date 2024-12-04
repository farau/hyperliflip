import { getEthBalanceEvm, getVolumeDapp } from './hyperliquid.js';

// Sélection des éléments
const betButton = document.getElementById('betButton');
const backgroundCanvas = document.getElementById('backgroundCanvas');
const gameCanvas = document.getElementById('gameCanvas');
const backgroundCtx = backgroundCanvas.getContext('2d');
const gameCtx = gameCanvas.getContext('2d');

// Définition du fournisseur de signer (provider) Ethereum
const provider = new ethers.BrowserProvider(window.ethereum);

// Chargement de l'adresse du contrat et de l'ABI depuis le fichier de configuration
const contractAddress = config.hyperliflipAddress;
const abi = config.hyperliflipAbi;
// Interface ABI
const iface = new ethers.Interface(abi);

// Récupération de l'adresse Ethereum actuellement connectée
const signer = await provider.getSigner();
// Instanciation du contrat intelligent PacBoom
const contract = new ethers.Contract(contractAddress, abi, signer);

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


async function placeBet() {
  if (!contract) {
    return;
  }

  const betAmount = document.getElementById("bet-amount").value;
  const choice = document.querySelector('input[name="choice"]:checked').value === "true";

  try {
    // Changement du texte pour indiquer que l'opération est en cours
    document.getElementById("place-bet").innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Waiting...';
    document.getElementById("transactionHash").innerHTML = "";
    document.getElementById("betAmt").innerHTML = "";
    document.getElementById("resultBet").innerHTML = "";
    document.getElementById("payout").innerHTML = "";
    // Envoyer la transaction
    const txResponse = await contract.play(0, {
      value: ethers.parseEther(betAmount), // Envoie ether
    });

    // Enregistrer immédiatement le hash dans la console
    console.log("Transaction sent:", txResponse.hash);
    const txLink = `<a href="https://testnet.purrsec.com/hyperliquid_testnet/tx/${txResponse.hash}" target="_blank">View Transaction</a>`;

    // Introduire un délai pour s'assurer que le message est visible (optionnel, pour UX)
    await new Promise(resolve => setTimeout(resolve, 100)); 

    // Attendre la confirmation de la transaction
    const receipt = await txResponse.wait();

    // Réinitialiser le bouton
    document.getElementById("place-bet").innerHTML = 'Bet!';

    // Rechercher et décoder l'événement
    const logs = receipt.logs;
    const betResultLog = logs.find(log => {
      try {
        const event = iface.parseLog(log);
        return event.name === "BetResult";
      } catch {
        return false;
      }
    });

    let betAmt, resultBet, payout;
    if (betResultLog) {
      const args = iface.parseLog(betResultLog).args;
      betAmt = args.amount;
      resultBet = args.won;
      payout = args.payout; // Utiliser le nom de l'argument défini dans Solidity
    } else {
      console.log("Event BetResult not found.");
    }

    // Mettre à jour l'interface utilisateur
    document.getElementById("transactionHash").innerHTML = txLink;
    document.getElementById("betAmt").innerHTML = "You bet " + Number(betAmt) / 10 ** 18 + ` <i class="fab fa-ethereum"></i>`;
    document.getElementById("resultBet").innerHTML = "The result is " + resultBet;
    document.getElementById("payout").innerHTML = "You received " + Number(payout) / 10 ** 18 + ` <i class="fab fa-ethereum"></i>`;
    
    fetchStatistics();
    fillBetModal(); // on met à jour la balance de l'user en ETH
    getVolumeDapp(); // on met à jour le volume de la dApp
  } catch (error) {
    console.error("Erreur lors du pari :", error);
    document.getElementById("place-bet").innerHTML = 'Error. Try again';
  }
}

async function fillBetModal() {
  const val = await getEthBalanceEvm();
  document.getElementById("testhModalBetBalanceEvm").innerHTML = Math.floor(val * 100) / 100;
}

// Récupérer les statistiques
async function fetchStatistics() {
    if (!contract) {
        return;
    }

    try {
        const totalBets = await contract.totalBets();
        const totalWins = await contract.totalWins();
        document.getElementById("totalBets").innerText = `Total Bets: ${totalBets}`;
        document.getElementById("totalWins").innerText = `Total Wins: ${totalWins}`;
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques :", error);
    }
}

// Fonction pour connaitre la valeur totale en ETH pour les bets réalisés
export async function getTotalBetsValue() {
  if (!contract) {
    return;
  }
  const value = await contract.totalBetsValue();
  const valueConvert = Number(value) / 10**18;
  return valueConvert;

}

  
// Ajouter les gestionnaires d'événements
document.getElementById("place-bet").addEventListener("click", placeBet);
// Initialiser le canvas vert avec la pièce
initializeGreenCanvas();
// On récupère les stats initialement
fetchStatistics();
fillBetModal();