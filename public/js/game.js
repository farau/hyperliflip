import { getVolumeDapp } from './hyperliquid.js';

// Sélection des éléments
const betButton = document.getElementById('betButton');

// Chargement de l'adresse du contrat et de l'ABI depuis le fichier de configuration
const contractAddress = config.hyperflipAddress;
const abi = config.hyperliflipAbi;
// Interface ABI
const iface = new ethers.Interface(abi);

const betButtons = document.querySelectorAll('.btn-custom2');

// Listeners sur les boutons de jeu
if (betButtons.length > 0) {

  // Gestion de la sélection des boutons de mise
  betButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (button.classList.contains('btn-selected')) {
            // Si le bouton est déjà sélectionné, le désélectionner
            button.classList.remove('btn-selected');
        } else {
            // Retirer la sélection des autres boutons
            betButtons.forEach(btn => btn.classList.remove('btn-selected'));
            // Ajouter la classe "btn-selected" au bouton sélectionné
            button.classList.add('btn-selected');
        }
    });
  });


  // Gestion de la sélection des boutons HEADS/TAILS
  const headsButton = document.getElementById('heads-btn');
  const tailsButton = document.getElementById('tails-btn');

  if (headsButton) {
    headsButton.addEventListener('click', () => {
      if (headsButton.classList.contains('btn-selected')) {
          // Si le bouton est déjà sélectionné, le désélectionner
          headsButton.classList.remove('btn-selected');
      } else {
          // Sélectionner le bouton HEADS et désélectionner TAILS
          headsButton.classList.add('btn-selected');
          tailsButton.classList.remove('btn-selected');
        }
    });
  }

  if (tailsButton) {
    tailsButton.addEventListener('click', () => {
      if (tailsButton.classList.contains('btn-selected')) {
          // Si le bouton est déjà sélectionné, le désélectionner
          tailsButton.classList.remove('btn-selected');
      } else {
          // Sélectionner le bouton TAILS et désélectionner HEADS
          tailsButton.classList.add('btn-selected');
          headsButton.classList.remove('btn-selected');
      }
  });
  }

  // Exemple d'appel pour récupérer les valeurs
  document.getElementById('place-bet').addEventListener('click', getSelectedValues);
}

// Récupérer les valeurs sélectionnées
function getSelectedValues() {

  // Récupérer la mise sélectionnée
  const selectedBetButton = document.querySelector('.btn-custom2.btn-selected'); // Bouton avec la classe "btn-selected"
  // Récupérer le choix HEADS ou TAILS
  const selectedChoiceButton = document.querySelector('.btn-selected[id^="heads-btn"], .btn-selected[id^="tails-btn"]');

  if (selectedBetButton && selectedChoiceButton) {
    const selectedBetValue = selectedBetButton ? selectedBetButton.getAttribute('data-eth') : null; // Récupérer la valeur "data-eth"
    const selectedChoiceValue = selectedChoiceButton.textContent ? (selectedChoiceButton.textContent == 'HEADS' ? 0 : 1 ) : null; // si HEADS on envoie 0 sinon on envoie 1

    return {
      betAmount: selectedBetValue, // Correspond à `betAmount`
      choice: selectedChoiceValue, // Correspond à `choice`
    };
  } else {
    return {
      betAmount: null, // Correspond à `betAmount`
      choice: null, // Correspond à `choice`
    };
  }
}

/*
  if (selectedBet && selectedChoice) {
    let betValue;
    const choiceValue = selectedChoice.textContent ? (selectedChoice == 'HEADS' ? 0 : 1 ) : null; // si HEADS on envoie 0 sinon on envoie 1

    // Retourner avec les clés adaptées
    return {
      betAmount: betValue, // Correspond à `betAmount`
      choice: choiceValue, // Correspond à `choice`
    };
  } else {
    return {
      betAmount: null, // Correspond à `betAmount`
      choice: null, // Correspond à `choice`
    };
  }
}*/

if (document.getElementById("place-bet")) {
  // Ajouter les gestionnaires d'événements
  document.getElementById("place-bet").addEventListener("click", placeBet);
}

if (document.getElementById("close-btn")) {
  document.getElementById('close-btn').addEventListener('click', function() {
    document.getElementById('result-div').style.display = 'none';
  });
}

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
    const {betAmount, choice } = getSelectedValues();
    // On indique une erreur si un des éléments de getSelectedValues est null
    if (betAmount == null || choice == null) {
      document.getElementById("place-bet").innerHTML = 'Please select a Bet!';
      return;
    }

    // Changement du texte pour indiquer que l'opération est en cours et rendre le bouton impossible à cliquer
    // On remet la div result invisible
    document.getElementById("result-div").style.display = 'none';
    document.getElementById("coinWait").innerHTML = "";
    document.getElementById("place-bet").disabled = true;
    document.getElementById("place-bet").innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Waiting...';
    document.getElementById("betAmt").innerHTML = "";
    document.getElementById("resultBet").innerHTML = "";
    document.getElementById("payout").innerHTML = "";
    document.getElementById("points").innerHTML = "";
    // Envoyer la transaction
    const txResponse = await contract.play(choice, {
      value: ethers.parseEther(betAmount.toString()), // Envoie ether
    });

    // Enregistrer immédiatement le hash dans la console
    console.log("Transaction sent:", txResponse.hash);
    const txLink = `<a href="https://testnet.purrsec.com/hyperliquid_testnet/tx/${txResponse.hash}" target="_blank">View Transaction</a>`;
    
    // Mettre à jour l'interface utilisateur
    document.getElementById("result-div").style.display = 'block';
    document.getElementById("betAmt").innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Waiting...';
    document.getElementById("coinWait").innerHTML = `<img src="./img/logo.jpg" alt="Flip coin" class="rounded-circle rotating-image">`;
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

    let betAmt, resultBet, payout, points;
    if (betResultLog) {
      const args = iface.parseLog(betResultLog).args;
      betAmt = args.amount;
      resultBet = args.won;
      payout = args.payout;
      points = args.points;
    } else {
      console.log("Event BetResult not found.");
    }

    // Mettre à jour l'interface utilisateur
    document.getElementById("result-div").style.display = 'block';
    //document.getElementById("transactionHash").innerHTML = txLink;
    document.getElementById("betAmt").innerHTML = "You bet " + Number(betAmt) / 10 ** 18 + ` <img src="img/hype-small.png" height="17" style="margin-bottom: 2px;">.`;
    if (resultBet) {
      document.getElementById("resultBet").innerHTML = "You WON!";
    } else {
      document.getElementById("resultBet").innerHTML = "You LOSE!"; 
    }
    document.getElementById("payout").innerHTML = "You received " + Number(payout) / 10 ** 18 + ` <img src="img/hype-small.png" height="17" style="margin-bottom: 2px;">.`;
    document.getElementById("points").innerHTML = "You received " + Number(points) + ` points!<br/><br/> Thanks for participating to the game!`;
    //fetchStatistics();
    getVolumeDapp(); // on met à jour le volume de la dApp

    // Réinitialiser le bouton Bet
    document.getElementById("place-bet").innerHTML = 'FLIP COIN';
  } catch (error) {
    console.error("Erreur lors du pari :", error);
    document.getElementById("place-bet").innerHTML = 'Error. Try again';
    document.getElementById("result-div").display.style = 'none';
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


// Fonction pour connaitre la valeur totale en ETH pour les bets réalisés
export async function getPointsPlayer() {
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
    const addressUser = await signer.getAddress();
    const value = await contract.getPointsPlayer(addressUser);
    const valueConvert = Number(value);
    return valueConvert.toString();
  } catch (error) {
    console.error("Erreur lors de la récupération de getPointsPlayer :", error);
  }
}