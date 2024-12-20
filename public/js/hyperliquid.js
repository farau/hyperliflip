import * as hyperliquid from "https://esm.sh/jsr/@nktkas/hyperliquid@0.9.0";

let httpTransport, provider, signer, client, clientInfo;

// Fonction pour appeler le client info qui ne nécessite pas de connexion Metamask
async function initializeInfoClient() {
       // HTTP Transport
    httpTransport = new hyperliquid.HttpTransport({
        url: "https://api.hyperliquid-testnet.xyz",   // API base URL
        timeout: 10000,                       // Request timeout in ms
        fetchOptions: {},                // Additional fetch options
        retry: {
        maxAttempts: 0,                               // Maximum retry attempts
        delay: (attempt) => ~~(1 << attempt) * 150,   // Delay between retries in ms (default: Exponential backoff)
        shouldReattempt: (error) => error instanceof TypeError || (error instanceof HttpRequestError && error.response.status >= 500 && error.response.status < 600) // Custom retry logic (default: Retries on network errors and 5xx status codes)
        }
    }); 

    clientInfo = new hyperliquid.InfoClient(httpTransport);
    await getVolumeDapp();
}

export async function initializeClient() {
    
    // HTTP Transport
    httpTransport = new hyperliquid.HttpTransport({
        url: "https://api.hyperliquid-testnet.xyz",   // API base URL
        timeout: 10000,                       // Request timeout in ms
        fetchOptions: {},                // Additional fetch options
        retry: {
        maxAttempts: 0,                               // Maximum retry attempts
        delay: (attempt) => ~~(1 << attempt) * 150,   // Delay between retries in ms (default: Exponential backoff)
        shouldReattempt: (error) => error instanceof TypeError || (error instanceof HttpRequestError && error.response.status >= 500 && error.response.status < 600) // Custom retry logic (default: Retries on network errors and 5xx status codes)
        }
    });

    // Définition du fournisseur de signer (provider) Ethereum
    provider = new ethers.BrowserProvider(window.ethereum);

    // Récupération de l'adresse Ethereum actuellement connectée
    signer = await provider.getSigner();

    // Créer une instance du client Hyperliquid
    client = new hyperliquid.ExchangeClient(signer, httpTransport, true);
    await infosTokensEVM();


}

// Fonction pour récupérer le prix de l'ETH 
export async function getVolumeDapp() {
    try {
        const volumeDapp = await fetch('/volume-dapp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!volumeDapp.ok) {
            throw new Error('Error retrieving the volume of the dApp.');
        }

        // Extraire le JSON de la réponse
        const data = await volumeDapp.json();

        // Afficher la valeur sur l'élément volume
        const volumeDiv = document.getElementById("totalVolume");
        if (volumeDiv) {
            volumeDiv.innerHTML = data.value;
        }
    } catch (error) {
        console.error('Cannot retrieve Dapp Volume', error);
    }
}


// Fonction pour avoir la balance de l'user connecté
export async function balanceUser() {
    try {
        const address = await signer.getAddress();
        const balance = await clientInfo.spotClearinghouseState({
             "user": address
        }); 
        return balance;
     } catch (error) {
         console.error('Error:', error);
     }
 }

// Fonction pour récupérer la balance des tokens sur EVM
export async function getTokenBalanceEvm(tokenAddress) {
    // Définition du fournisseur de signer (provider) Ethereum
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    const tokenContract = new ethers.Contract(tokenAddress, config.erc20Abi, signer);

    // Addresse de l'user
    const userAddress = await signer.getAddress();
    let balance, adjustedBalance;
    if (tokenAddress == config.usdcAddressEvm) {
        balance = await tokenContract.balanceOf(userAddress);/// 10**8;
        const divisor = BigInt(10 ** 8); // Assurez-vous que le diviseur est aussi un BigInt
        const rawBalance = balance / divisor; // Division avec BigInt

        // Convertir en Number pour l'arrondi
        adjustedBalance = Math.round(Number(rawBalance) * 100) / 100;
    } else {
        balance = await tokenContract.balanceOf(userAddress);/// 10**18;
        const divisor = BigInt(10 ** 18); // Assurez-vous que le diviseur est aussi un BigInt
        const rawBalance = balance / divisor; // Division avec BigInt

        // Convertir en Number pour l'arrondi
        adjustedBalance = Math.round(Number(rawBalance) * 100) / 100;
    }
    return adjustedBalance;
}

// Fonction pour récupérer la balance ETH
export async function getEthBalanceEvm() {
    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        // Récupération du signer
        signer = await provider.getSigner();

        const userAddress = await signer.getAddress();
        // Récupérer la balance native brute
        const balance = await provider.getBalance(userAddress);
        const ethBalance = ethers.formatEther(balance);
        const adjustedBalance = Math.round(Number(ethBalance) * 100) / 100;
        return adjustedBalance;
    } catch (error) {
        console.error("Erreur lors de la récupération de la balance ETH :", error);
    }
}

// Fonction pour avoir les infos de tous les tokens
async function infosTokensEVM() {
    try {
        const infos = await clientInfo.spotMeta(); 
        const req = await clientInfo.metaAndAssetCtxs();
        return infos;
     } catch (error) {
         console.error('Error:', error);
     }
 }


// Fonction pour transférer des fonds de Spot vers HyperEVM
async function transferSpot(value) {
   try {
        const valueInString = value.toString();

        await client.spotSend({
            "hyperliquidChain": "Testnet",
            "signatureChainId": "3e6", //testnet HL
            "destination": "0x2222222222222222222222222222222222222222",
            "token": config.hype_tokenid,
            "amount": valueInString,
            "time": Date.now()
        });
        transferButton.innerHTML = `Transfer successful!`;

    } catch (error) {
        console.error('Error:', error);
        transferButton.innerHTML = `User rejected transfer`;
    }
}

// --------- LISTENERS -------------

// Sélectionner le bouton par son ID
const sendSpotButton = document.getElementById('sendSpot');
let balanceData;

// Ajouter un gestionnaire d'événement
if (sendSpotButton) {
    sendSpotButton.addEventListener('click', function() {
        // Fonction déclenchée lorsqu'on clique sur le bouton Transfer et que la modal s'ouvre
        fillTransferModal();
    });
}

// Fonction qui remplit les infos dans la modal transfer
async function fillTransferModal() {

    // Récupération des balances
    balanceData = await balanceUser();
    // Récupération de la balance HYPE
    const testh = balanceData.balances.find(b => b.token === config.hypeTokenId);
    const testhBalance = testh ? testh.total : 'err';

    // Mise à jour des éléments DOM
    document.getElementById("testhModalBalance").innerHTML = Math.floor(testhBalance * 100) / 100;

    const testhBalanceEvm = await getEthBalanceEvm();
    document.getElementById("testhModalBalanceEvm").innerHTML = Math.floor(testhBalanceEvm * 100) / 100;
}

// Présence de cet élément nécessaire pour créer le listener
const transferButton = document.getElementById("transferButton");

if (transferButton) {
    transferButton.addEventListener("click", async () => {
        try {
            const ethAmount = parseFloat(document.getElementById("transferAmount").value); // Convert to float

            // Check for invalid ETH amount 
            if (isNaN(ethAmount)) {
                transferButton.innerText = 'Value must be > 0';
                return; // Exit early if invalid input
            }
            // Récupération des balances
            balanceData = await balanceUser();
            const testh = balanceData.balances.find(b => b.token === config.hypeTokenId);
            const testhBalance = testh ? testh.total : 'err';
            const testhBalanceFormatted = Math.floor(testhBalance * 100) / 100;

            if (ethAmount > testhBalanceFormatted) {
                transferButton.innerText = `Value must be lower than ${testhBalanceFormatted}`;
                return; // Exit early if invalid input
            }
            // Valid input: proceed with transaction
            transferButton.disabled = true;
            transferButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span> Waiting...`;

            const tx = await transferSpot(ethAmount);


        } catch (error) {
            console.error('Error during the transfer of token: ', error);
            transferButton.innerHTML = error.data?.message || 'Transfer failed';    
        } finally {
            transferButton.disabled = false;
        }
    });
}

// On initialise infoClient au démarrage
initializeInfoClient();