import { getVolumeDapp } from './hyperliquid.js';

// Sélection des éléments
const betButton = document.getElementById('betButton');

// Chargement de l'adresse du contrat et de l'ABI depuis le fichier de configuration
const contractAddress = config.hyperliflipAddress;
const abi = config.hyperliflipAbi;
// Interface ABI
const iface = new ethers.Interface(abi);

const betButtons = document.querySelectorAll('#bet-buttons button');
const currencySelect = document.getElementById('currency-select');

// Listeners sur les boutons de jeu
if (betButtons && currencySelect) {
  // Fonction pour mettre à jour les textes des boutons en fonction de la devise sélectionnée
  currencySelect.addEventListener('change', () => {
      const selectedCurrency = currencySelect.value;

      betButtons.forEach(button => {
          ethValue = button.getAttribute('data-eth');
          usdValue = button.getAttribute('data-usd');

          if (selectedCurrency === 'ETH') {
            button.innerHTML = `${ethValue} <i class="fab fa-ethereum"></i>`;
          } else {
            button.innerHTML = `$${usdValue}`;
          }
      });
  });

  // Gestion de la sélection des boutons de mise
  betButtons.forEach(button => {
      button.addEventListener('click', () => {
          // Retirer la sélection des autres boutons
          betButtons.forEach(btn => btn.classList.remove('btn-selected'));
          // Ajouter la classe "btn-selected" au bouton sélectionné
          button.classList.add('btn-selected');
      });
  });

  // Gestion de la sélection des boutons HEADS/TAILS
  const headsButton = document.getElementById('heads-btn');
  const tailsButton = document.getElementById('tails-btn');

  headsButton.addEventListener('click', () => {
      // Retirer la sélection des autres boutons
      headsButton.classList.add('btn-selected');
      tailsButton.classList.remove('btn-selected');
  });

  tailsButton.addEventListener('click', () => {
      // Retirer la sélection des autres boutons
      tailsButton.classList.add('btn-selected');
      headsButton.classList.remove('btn-selected');
  });

  // Exemple d'appel pour récupérer les valeurs
  document.querySelector('.flip-button button').addEventListener('click', getSelectedValues);
}

// Récupérer les valeurs sélectionnées
function getSelectedValues() {
  const selectedBet = document.querySelector('.bet-buttons .btn-selected');
  const selectedChoice = document.querySelector('.choice-buttons .btn-selected');
  const selectedCurrency = document.getElementById('currency-select');

  if (selectedBet && selectedChoice && selectedCurrency) {
    let betValue;
    if (selectedCurrency.value == 'ETH') {
      betValue = selectedBet ? selectedBet.dataset.eth : null;
    } else {
      betValue = selectedBet ? selectedBet.dataset.usd : null;
    }

    const choiceValue = selectedChoice.textContent ? (selectedChoice == 'HEADS' ? 0 : 1 ) : null; // si HEADS on envoie 0 sinon on envoie 1

    // Retourner avec les clés adaptées
    return {
      betAmount: betValue, // Correspond à `betAmount`
      choice: choiceValue, // Correspond à `choice`
      currency: selectedCurrency // Correspond à `currency`
    };
  } else {
    return {
      betAmount: null, // Correspond à `betAmount`
      choice: null, // Correspond à `choice`
      currency: null // Correspond à `currency`
    };
  }
}

if (document.getElementById("place-bet")) {
  // Ajouter les gestionnaires d'événements
  document.getElementById("place-bet").addEventListener("click", placeBet);
}

document.getElementById('close-btn').addEventListener('click', function() {
  document.getElementById('result-div').style.display = 'none';
});

async function placeBet() {
  try {

    // Définition du fournisseur de signer (provider) Ethereum
    const provider = new ethers.BrowserProvider(window.ethereum);
    // Récupération de l'adresse Ethereum actuellement connectée
    const signer = await provider.getSigner();
    // Instanciation du contrat intelligent PacBoom
    const contract = new ethers.Contract(contractAddress, abi, signer);

    if (!contract) {
      return;
    }

    // On récupère les trois valeurs via la fonction getSelectedValues et on stocke dans les variables
    const {betAmount, choice, currency } = getSelectedValues();

    // On indique une erreur si un des éléments de getSelectedValues est null
    if (betAmount == null || choice == null ||  currency == null) {
      document.getElementById("place-bet").innerHTML = 'Please select a Bet!';
      return;
    }

    // Changement du texte pour indiquer que l'opération est en cours et rendre le bouton impossible à cliquer
    // On remet la div result invisible
    document.getElementById("result-div").style.display = 'none';
    document.getElementById("place-bet").disabled = true;
    document.getElementById("place-bet").innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Waiting...';
    document.getElementById("betAmt").innerHTML = "";
    document.getElementById("resultBet").innerHTML = "";
    document.getElementById("payout").innerHTML = "";
    // Envoyer la transaction
    const txResponse = await contract.play(choice, {
      value: ethers.parseEther(betAmount.toString()), // Envoie ether
    });

    // Enregistrer immédiatement le hash dans la console
    console.log("Transaction sent:", txResponse.hash);
    const txLink = `<a href="https://testnet.purrsec.com/hyperliquid_testnet/tx/${txResponse.hash}" target="_blank">View Transaction</a>`;

    // Introduire un délai pour s'assurer que le message est visible (optionnel, pour UX)
    await new Promise(resolve => setTimeout(resolve, 100)); 

    // Attendre la confirmation de la transaction
    const receipt = await txResponse.wait();

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
    document.getElementById("result-div").style.display = 'block';
    //document.getElementById("transactionHash").innerHTML = txLink;
    document.getElementById("betAmt").innerHTML = "You bet " + Number(betAmt) / 10 ** 18 + ` <i class="fab fa-ethereum"></i>`;
    if (resultBet) {
      document.getElementById("resultBet").innerHTML = "You WON!";
    } else {
      document.getElementById("resultBet").innerHTML = "You LOSE!"; 
    }
    document.getElementById("payout").innerHTML = "You received " + Number(payout) / 10 ** 18 + ` <i class="fab fa-ethereum"></i>`;
    
    fetchStatistics();
    getVolumeDapp(); // on met à jour le volume de la dApp

    // Réinitialiser le bouton Bet
    document.getElementById("place-bet").innerHTML = 'FLIP COIN';
  } catch (error) {
    console.error("Erreur lors du pari :", error);
    document.getElementById("place-bet").innerHTML = 'Error. Try again';
  } finally {
    // On réactive le bouton Bet quelque soit l'issue
    document.getElementById("place-bet").disabled = false;
  }
}


// Récupérer les statistiques
export async function fetchStatistics() {
    try {
        // Définition du fournisseur de signer (provider) Ethereum
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        // Instanciation du contrat intelligent PacBoom
        const contract = new ethers.Contract(contractAddress, abi, signer);
        if (!contract) {
            return;
        }
        const totalBets = await contract.totalBets();
        const totalWins = await contract.totalWins();
        if (document.getElementById("totalBets")) {
          document.getElementById("totalBets").innerText = `Total Bets: ${totalBets}`;
          document.getElementById("totalWins").innerText = `Total Wins: ${totalWins}`;
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques :", error);
    }
}

// Fonction pour connaitre la valeur totale en ETH pour les bets réalisés
export async function getTotalBetsValue() {
  try {
    // Définition du fournisseur de signer (provider) Ethereum
    const provider = new ethers.BrowserProvider(window.ethereum);
    // Récupération de l'adresse Ethereum actuellement connectée
    const signer = await provider.getSigner();
    // Instanciation du contrat intelligent PacBoom
    const contract = new ethers.Contract(contractAddress, abi, signer);
    if (!contract) {
        return;
    }
    if (!contract) {
      return;
    }
    const value = await contract.totalBetsValue();
    const valueConvert = Number(value) / 10**18;
    return valueConvert;
  } catch (error) {
    console.error("Erreur lors de la récupération de total bet value :", error);
  }
}

