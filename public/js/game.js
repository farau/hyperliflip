// Importation des modules
import { getVolumeDapp } from './hyperliquid.js';

// Sélection des éléments
const betButton = document.getElementById('betButton');

// Chargement de l'adresse du contrat et de l'ABI depuis le fichier de configuration
const contractAddress = config.hyperflipAddress;
const abi = config.hyperliflipAbi;
// Interface ABI
const iface = new ethers.Interface(abi);

const betButtons = document.querySelectorAll('.btn-custom2');


const hypeButton = document.getElementById('hype');
const coinButton = document.getElementById('coin');
const amountButtons = document.querySelectorAll('.btn-custom2');
let selectedCurrency = 'HYPE';

function updateAmounts() {
  amountButtons.forEach(button => {
    const amountDisplayed = button.querySelector('#amountDisplayed');
    if (selectedCurrency === 'HYPE') {
      amountDisplayed.textContent = button.getAttribute('data-eth') + ' HYPE';
    } else {
      amountDisplayed.textContent = button.getAttribute('data-coin') + ' KEI';
    }
  });
}

if(hypeButton) {
  hypeButton.addEventListener('click', function() {
    selectedCurrency = 'HYPE';
    updateAmounts();
  });
}

if (coinButton) {
  coinButton.addEventListener('click', function() {
    selectedCurrency = 'KEI';
    updateAmounts();
  });
}

// Initial update
updateAmounts();


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


  // Gestion de la sélection des boutons HEADS/TAILS et HYPE/COIN
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

  if (hypeButton) {
    hypeButton.addEventListener('click', () => {
      if (hypeButton.classList.contains('btn-selected')) {
          // Si le bouton est déjà sélectionné, le désélectionner
          hypeButton.classList.remove('btn-selected');
      } else {
          // Sélectionner le bouton HYPE et désélectionner COIN
          hypeButton.classList.add('btn-selected');
          coinButton.classList.remove('btn-selected');
        }
    });
  }

  if (coinButton) {
    coinButton.addEventListener('click', () => {
      if (coinButton.classList.contains('btn-selected')) {
          // Si le bouton est déjà sélectionné, le désélectionner
          coinButton.classList.remove('btn-selected');
      } else {
          // Sélectionner le bouton COIN et désélectionner HYPE
          coinButton.classList.add('btn-selected');
          hypeButton.classList.remove('btn-selected');
        }
    });
  }

  // Exemple d'appel pour récupérer les valeurs
  document.getElementById('place-bet').addEventListener('click', getSelectedValues);
}

// Récupérer les valeurs sélectionnées
async function getSelectedValues() {
  // Récupérer la mise sélectionnée
  const selectedBetButton = document.querySelector('.btn-custom2.btn-selected'); // Bouton avec la classe "btn-selected"
  // Récupérer le choix HEADS ou TAILS
  const selectedChoiceButton = document.querySelector('.btn-selected[id^="heads-btn"], .btn-selected[id^="tails-btn"]');
  let betAmount, choice;
  let addressReferee = ethers.ZeroAddress;
  try {
    if (selectedBetButton && selectedChoiceButton) {
      const selectedBetValue = selectedBetButton ? (selectedCurrency === 'HYPE' ? selectedBetButton.getAttribute('data-eth') : selectedBetButton.getAttribute('data-coin')) : null; // Récupérer la valeur "data-eth" ou "data-coin"
      const selectedChoiceValue = selectedChoiceButton.textContent ? (selectedChoiceButton.textContent == 'HEADS' ? 0 : 1 ) : null; // si HEADS on envoie 0 sinon on envoie 1
      // Set betAmount and choice
      betAmount = selectedBetValue;
      choice = selectedChoiceValue;
      if (document.getElementById('referralCodeInput').value.trim() == "") {
        // Adresse 0 si pas de code de parrainage
      } else {
        const referralCode = document.getElementById('referralCodeInput').value.trim();
        const response = await getAddressReferee(referralCode); // Appeler la fonction getAddressReferee pour récupérer l'adresse du parrain
        if (response === null) {
          addressReferee = -1;
          throw new Error('Failed to retrieve referee address.'); // Gérer l'erreur si l'adresse du parrain n'est pas récupérée
        }
        addressReferee = response;

      }
    } else {
        throw new Error('Please select a bet amount and a choice.');
    }
  } catch (error) {
    console.error("Error retrieving selected values :", error);
    document.getElementById("place-bet").innerHTML = error;
  } finally {
    return {
      betAmount: betAmount, // Correspond à `betAmount`
      choice: choice, // Correspond à `choice`
      referralCode: addressReferee // Correspond à l'adresse liée au `referralCode`
    };
  }
}

// Gestionnaire d'événements pour le bouton de pari
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
    const tokenContract = new ethers.Contract(config.erc20TokenAddress, [
      "function approve(address spender, uint256 amount) public returns (bool)",
      "function allowance(address owner, address spender) public view returns (uint256)"
  ], signer);

    if (!contract) {
      throw new Error('Contract not found.');
    }
    // Récupérer l'adresse du compte
    const address = await signer.getAddress(); 
    // Vérifier la balance du compte
    const balance = await provider.getBalance(address);
    const balanceInHype = ethers.formatEther(balance);

    // Vérifier si la balance est inférieure à 0.25 hype
    if (selectedCurrency == 'HYPE' && parseFloat(balanceInHype) < 0.25) {
      throw new Error('Insufficient balance. Minimum 0.25 HYPE required.');
    }


    // On récupère les trois valeurs via la fonction getSelectedValues et on stocke dans les variables
    const { betAmount, choice, referralCode } = await getSelectedValues();

    if (betAmount == null || choice == null) {
      throw new Error('Please select a bet amount and a choice.');
    }

    if (referralCode == -1) {
      throw new Error('Please input a correct referral.');
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

    let txResponse;
    // Envoyer la transaction
    if (selectedCurrency == 'HYPE') {
      txResponse = await contract.play(choice, referralCode, {
        value: ethers.parseEther(betAmount.toString()), // Envoie hype
      });
    } else {
      // Vérifier l'allowance pour le token ERC20 et appeler la fonction playWithToken
      const allowance = await tokenContract.allowance(address, config.erc20TokenAddress);
      if (ethers.toBigInt(allowance) < ethers.parseEther(betAmount)) {
          // Définir le montant maximum à approuver
          const amountToApprove = 10000;

          // Envoyer la transaction d'approbation
          const approveTx = await tokenContract.approve(config.hyperflipAddress, amountToApprove);

          // Attendre que la transaction soit confirmée
          await approveTx.wait();
      } 
      txResponse = await contract.playWithToken(config.erc20TokenAddress, ethers.parseEther(betAmount) , choice, referralCode);
    }
    // Enregistrer immédiatement le hash dans la console
    console.log("Transaction sent:", txResponse.hash);
    const txLink = `<a href="https://purrsec.com/hyperliquid_testnet/tx/${txResponse.hash}" target="_blank">View Transaction</a>`;
    
    // Mettre à jour l'interface utilisateur
    document.getElementById("result-div").style.display = 'block';
    document.getElementById("betAmt").innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Waiting...';
    document.getElementById("coinWait").innerHTML = `<img src="./img/logo.jpg" alt="Flip coin" class="rounded-circle rotating-image">`;

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

    let betAmt, resultBet, payout, points, refereePoints;
    if (betResultLog) {
      const args = iface.parseLog(betResultLog).args;
      betAmt = args.amount;
      resultBet = args.won;
      payout = args.payout;
      points = args.points;
      refereePoints = args.refereePoints;
    } 
    // Mettre à jour l'interface utilisateur
    document.getElementById("result-div").style.display = 'block';
    //document.getElementById("transactionHash").innerHTML = txLink;
    document.getElementById("betAmt").innerHTML = "You bet " + Number(betAmt) / 10 ** 18 + ` ${selectedCurrency}.`;
    if (resultBet) {
      document.getElementById("resultBet").innerHTML = "You WON!";
    } else {
      document.getElementById("resultBet").innerHTML = "You LOSE!"; 
    }
    document.getElementById("payout").innerHTML = "You received " + Number(payout) / 10 ** 18 + ` ${selectedCurrency}.`;
    if (refereePoints == 0) {
      document.getElementById("points").innerHTML = "You received " + Number(points) + ` points!<br/><br/> Thanks for participating in our game!`;
    } else {
      document.getElementById("points").innerHTML = "You received " + Number(points) + ` points!<br/> Your referee received ` + Number(refereePoints) + ` points!<br/><br/> Thanks for participating in our game!`;
    }

    getVolumeDapp(); // on met à jour le volume de la dApp

    // Réinitialiser le bouton Bet
    document.getElementById("place-bet").innerHTML = 'FLIP COIN';
  } catch (error) {
    console.error("Error when betting :", error);
    document.getElementById("result-div").style.display = 'none';
    document.getElementById("place-bet").innerHTML = error;
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

    const contract = new ethers.Contract(contractAddress, abi);
    if (!contract) {
        return;
    }
    const addressUser = await signer.getAddress();
    const value = await contract.connect(signer).getPointsPlayer(addressUser);
    const valueConvert = Number(value);
    return valueConvert.toString();
  } catch (error) {
    console.error("Erreur lors de la récupération de getPointsPlayer :", error);
  }
}

// Fonction pour récupérer l'adresse du referee
async function getAddressReferee(referralCode) {
  try {
      const response = await fetch('getAddressReferee', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json', // Correction du format d'en-tête
          },
          body: JSON.stringify({ code : referralCode})
      });

      if (!response.ok) {
          console.error(`Failed to fetch address of the referee. HTTP Status: ${response.status}`);
          return null;
      }

      // Vérifie que la réponse est bien au format JSON attendu
      const result = await response.json();
      if (result && result.wallet_address) {
          return result.wallet_address;
      } else {
          console.error("Invalid response format or missing wallet address.");
          return null;
      }
  } catch (error) {
      console.error("Error during retrieval of wallet address:", error);
      return null;
  }
}