import { balanceUser, initializeClient, getEthBalanceEvm, getTokenBalanceEvm } from './hyperliquid.js';

const connectWallet = document.getElementById('connectWallet')

// Définition du fournisseur de signer (provider) Ethereum
const provider = new ethers.BrowserProvider(window.ethereum);

// Chargement de l'adresse du contrat du NFT PacNUB et de l'ABI depuis le fichier de configuration
const contractAddress = config.hyperliflipAddress; 
const abi = config.hyperliflipAbi;

// Instanciation du contrat intelligent Hyperliflip
const contract = new ethers.Contract(contractAddress, abi, provider);

// Récupération de l'adresse Ethereum actuellement connectée
const signer = await provider.getSigner();
const signerAddress = await signer.getAddress();

// Vérification si l'adresse est connectée
if (!signerAddress) {
    console.error("No Ethereum address connected. Please connect with your wallet.");
}

// Fonction pour écouter les changements de compte MetaMask
async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // L'utilisateur s'est déconnecté de MetaMask
        // Mettez à jour l'état de votre application en conséquence
        signOutOfMetaMask();
    } else {
        // L'utilisateur s'est connecté ou a changé de compte
        // Mettez à jour l'état de votre application si nécessaire
        signOutOfMetaMask();
        //await connectWalletwithMetaMask();
    }
}

function checkInstalled() {
    if (typeof window.ethereum == 'undefined') {
      connectWallet.innerText = 'MetaMask isnt installed, please install it';
      connectWallet.classList.remove();
      connectWallet.classList.add();
      return false;
    }
    connectWallet.addEventListener('click', connectWalletwithMetaMask);
    return true;
}

// Fonction pour vérifier si l'utilisateur est déjà connecté
export async function checkIfUserConnected() {
    const transactionButtonElement = document.getElementById('betButton');
    const spotSendElement = document.getElementById('sendSpot');
    const userAddress = localStorage.getItem('userAddress');
    const connectWalletButton = document.getElementById('connectWallet');

    if (userAddress) {
        try {
            // Envoyer une requête au serveur pour vérifier le JWT
            const response = await fetch('/verify-jwt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userAddress : userAddress})
            });

            if (response.ok) {
                // Convertir la réponse en JSON
                const data = await response.json();
                if (data && data.userAddress) {
                    // Afficher les informations de l'utilisateur
                    connectWalletButton.innerHTML = `${data.userAddress.substring(0, 4)}...${data.userAddress.substring(data.userAddress.length - 4)}`;
                    
                    // Activer d'autres fonctionnalités, etc.

                    // Désactiver l'écouteur de clic pour connecter le portefeuille
                    connectWalletButton.removeEventListener('click', connectWalletwithMetaMask);

                    // Ajouter un écouteur de clic sur connectWalletButton pour afficher/masquer le dropdown
                    connectWalletButton.addEventListener('click', toggleWalletInfo);


                    // Activer l'écouteur de clic pour se déconnecter du portefeuille
                    document.getElementById('logoutWallet').addEventListener('click', signOutOfMetaMask);
                    
                    // Vérifier le réseau et activer le bouton de transaction si valide
                    if (checkNetwork() && transactionButtonElement) {
                        transactionButtonElement.innerHTML = "Bet!";
                        transactionButtonElement.disabled = false;
                        spotSendElement.disabled = false;
                    }

                    // On initialise le client qui sera utilisé pour faire les appels API sur Hyperliquid testner
                    await initializeClient();

                    return true; // L'utilisateur est connecté
                } else {
                    // Gérer les erreurs si le champ address est manquant
                    console.error('Adresse not found in the response.');
                    return false; // L'utilisateur n'est pas connecté
                }
            } else {
                // Gérer les erreurs de réponse non OK
                const errorText = await response.text();
                console.error('Error during processing of JWT:', errorText);
                return false; // L'utilisateur n'est pas connecté
            }
        } catch (error) {
            // Gérer les erreurs de la requête fetch
            console.error('Error during processing of JWT:', error);
            return false; // L'utilisateur n'est pas connecté
        }
    } else {
        if (transactionButtonElement) {
            transactionButtonElement.innerHTML = "Connect your wallet";
            transactionButtonElement.disabled = true;
            spotSendElement.disabled = true; //on désactive le bouton spotSend aussi
        }
        return false; // L'utilisateur n'est pas connecté
    }
}


// Génére le JWT en appelant la route /loginUser sur le serveur
async function loginUser(address) {
    return fetch('/loginUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userAddress: address })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la génération du JWT');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Erreur lors de la génération du JWT :', error);
        // Gérer les erreurs si nécessaire
    });
}

// Détruit le JWT en appelant la route /logout sur le serveur
async function logoutUser() {
    return fetch('/logoutUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error.');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error during the process of logout:', error);
        // Gérer les erreurs si nécessaire
    });
}

// Fonction pour signer un message
async function signMessage(welcomeMessage) {
    try {
        // Obtenir le signer
        const signer = await provider.getSigner();

        // Signer le message
        const signature = await signer.signMessage(welcomeMessage);

        console.log("Signature:", signature);
        return signature;
    } catch (error) {
        console.error("Erreur lors de la signature du message :", error);
        throw error;
    }
}

// Fonction qui vérifie la connexion via le wallet 
async function connectWalletwithMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Vérifier si l'utilisateur est déjà connecté en consultant le stockage local
            const isUserConnected = localStorage.getItem('isUserConnected');
            const userSignature = localStorage.getItem('userSignature');
 
            // Demander l'autorisation d'accéder au compte Ethereum
            const accounts = await provider.send("eth_requestAccounts", []);

            if (!accounts) { return; }

            const address = accounts[0];

            // Message à signer
            const welcomeMessage = "Welcome to Hyperliflip! Play and gamble your token to earn more on HyperEVM!";
            const signature = await signMessage(welcomeMessage);

            // Si le message n'est pas signé, on quitte la fonction
            if (!signature) {
                throw new Error("La signature n'est pas valide.");
            }

            // Génère le jwt, enregistre l'utilisateur en BDD et attend la réponse
            const result = await loginUser(address);

            // On enregistre l'adresse Metamask de l'utilisateur courant dans le localStorage
            localStorage.setItem("userAddress", address);

            // Tronquer l'adresse pour afficher seulement les 3 premiers et 4 derniers caractères
            const truncatedAddress = `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
            connectWallet.innerHTML = truncatedAddress;


            // Désactiver l'écouteur de clic pour connecter le portefeuille
            connectWallet.removeEventListener('click', connectWalletwithMetaMask);

            // Activer l'écouteur de clic pour se déconnecter du portefeuille après la signature
            setTimeout(() => {
                document.getElementById('logoutWallet').addEventListener('click', signOutOfMetaMask);
            }, 200);

            // Ajouter un écouteur de clic sur connectWalletButton pour afficher/masquer le dropdown
            connectWallet.addEventListener('click', toggleWalletInfo);

            // Enregistrer dans le stockage local pour indiquer que l'utilisateur est connecté
            localStorage.setItem('isUserConnected', 'true');

            // Enregistrer la signature dans le stockage local
            localStorage.setItem('userSignature', signature);

            // Vous pouvez maintenant utiliser la signature comme nécessaire dans votre application
            checkUserSignatureDeleted(); // Attendre la réponse

            // On initialise le client qui sera utilisé pour faire les appels API sur Hyperliquid testner
            await initializeClient();

        } catch (error) {
            console.error(error.message);
            signOutOfMetaMask();
            // Rejeter la promesse avec l'erreur
            return Promise.reject(error);
        }
    }
    return new Promise((resolve) => {
        // Simulation d'une attente de 2 secondes
        setTimeout(() => {
            resolve(); // Résoudre la promesse lorsque la connexion est réussie
        }, 2000);
    });
}


// Gestion de la déconnexion
async function signOutOfMetaMask() {
    try {
        // Appeler la route pour se logout
        const result = await logoutUser(); // Assurez-vous que logoutUser retourne une Promise

        // Vérifiez si la réponse est OK
        if (!result.ok) {
            throw new Error('Error during logout.');
        }

        if (result.ok) {
            document.getElementById('logoutWallet').removeEventListener('click', signOutOfMetaMask);
            connectWallet.removeEventListener('click', toggleWalletInfo); // on supprime l'event affichage du toggle si on se déco
            setTimeout(() => {
                connectWallet.addEventListener('click', connectWalletwithMetaMask);
            }, 200);

            // Supprimer l'indicateur de connexion et l'adresse dans le stockage local
            localStorage.removeItem('isUserConnected');
            localStorage.removeItem('userAddress');
            // Il faut aussi supprimer la signature de l'user et le jwt token
            localStorage.removeItem('userSignature');
            localStorage.removeItem('username');

            // Réinitialiser le bouton connectWallet pour qu'il demande la connexion la prochaine fois
            connectWallet.innerHTML = 'Connect Wallet';

            // On rend invisible l'onglet coulissant contenant les infos de l'user
            document.getElementById('walletInfo').style.display = 'none'; // Affiche le bouton de déconnexion
            

            // Activer l'écouteur de clic pour connecter le portefeuille
            connectWallet.addEventListener('click', connectWalletwithMetaMask);

            // Vérifiez que la signature utilisateur est supprimée
            checkUserSignatureDeleted();

            // On MAJ les éléments réactifs
            await checkIfUserConnected();


        }
    } catch (error) {
        console.error('Error during logout process:', error);
        // Gérer les erreurs si nécessaire
    }
}

// Fonction pour changer de réseau
async function switchNetwork(provider, chainId) {
    try {
        await provider.send("wallet_switchEthereumChain", [
            { chainId }, // ID de la chaîne en hexadécimal, exemple : '0x3e6'
        ]);
        // Recharger la page après avoir changé de réseau
        //window.location.reload();
    } catch (switchError) {
        if (switchError.code === 4902) {
            // Si la chaîne n'est pas ajoutée dans MetaMask
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: config.chain_id, // ID de la chaîne (hexadécimal)
                            chainName: 'HyperEVM Testnet', // Nom lisible de la chaîne
                            nativeCurrency: {
                                name: 'TESTH', // Nom de la monnaie native
                                symbol: 'TESTH', // Symbole abrégé de la monnaie native
                                decimals: 18, // Décimales (généralement 18 pour Ethereum)
                            },
                            rpcUrls: [config.rpc_url], // URL de l'endpoint RPC
                            blockExplorerUrls: [], // URL de l'explorateur (optionnel)
                        },
                    ],
                });
                // Réessayer de basculer sur la chaîne nouvellement ajoutée
                await provider.send("wallet_switchEthereumChain", [
                    { chainId }, // ID de la chaîne en hexadécimal, exemple : '0x3e6'
                ]);
                window.location.reload();
            } catch (addError) {
                console.error('Erreur lors de l\'ajout du réseau:', addError);
            }
        } else {
            console.error('Erreur lors du changement de réseau:', switchError);
        }
    }
}

// Gestion de la chain sélectionnée
function checkNetwork() {
    // Vérifier si MetaMask est installé et disponible
    const transactionButtonElement = document.getElementById('betButton');

    if (typeof window.ethereum !== 'undefined') {
        const ethereum = window.ethereum;

        // Vérifier le réseau au chargement de la page
        ethereum.request({ method: 'eth_chainId' })
            .then(chainId => {
                if (chainId !== config.chain_id) { // Vérifier si le chainId correspond à HyperEVM 
                    // Afficher un message d'erreur ou désactiver les boutons de transaction
                    document.getElementById('networkModal').style.display = 'block';
                    // Ajouter un écouteur pour le bouton de changement de réseau
                    document.getElementById('changeNetworkButton').addEventListener('click', async () => {
                    await switchNetwork(provider, config.chain_id);
                    });
                    
                    return false;
                } else {

                    return true;
                }
            })
            .catch(error => {
                console.error('Error during retrieval of the network :', error);
            });
    } else {
        // MetaMask n'est pas installé ou n'est pas disponible
        console.error('MetaMask isnt installed.');
        if (transactionButtonElement) {
            transactionButtonElement.disabled = false;
        }
        return false;
    }
}


// Fonction pour vérifier si userSignature est supprimé de la mémoire locale
function checkUserSignatureDeleted() {
    const userSignature = localStorage.getItem('userSignature');
    const transactionButtonElement = document.getElementById('betButton');
    const spotSendElement = document.getElementById('sendSpot');
    if (!userSignature) {
        // Désactiver le bouton de transaction si userSignature est supprimé
        if (transactionButtonElement) {
            transactionButtonElement.innerHTML = "Connect your wallet";
            transactionButtonElement.disabled = true;
            spotSendElement.disabled = true;
        }
    } else {
        // Activer le bouton de transaction si userSignature est présent
        if (transactionButtonElement) {
            transactionButtonElement.innerHTML = "Bet!";
            transactionButtonElement.disabled = false;
            spotSendElement.disabled = false;
        }
    }
}

// Fonction pour afficher/masquer le menu déroulant au clic sur walletAddress
export async function toggleWalletInfo() {
    const walletInfo = document.getElementById('walletInfo');
    const logoutWalletButton = document.getElementById('logoutWallet');
    const usdcBalanceElement = document.getElementById('usdcBalance');
    const testhBalanceElement = document.getElementById('testhBalance');

    try {

        // Toggle affichage walletInfo
        if (walletInfo.style.display === 'none' || walletInfo.style.display === '') {
            walletInfo.style.display = 'block';
            logoutWalletButton.style.display = 'block';
            usdcBalanceElement.style.display = 'block';
            testhBalanceElement.style.display = 'block';


            const usdcBalance = await getTokenBalanceEvm(config.usdcAddressEvm);
            const testhBalance = await getEthBalanceEvm();

            // Mise à jour des éléments DOM
            usdcBalanceElement.innerHTML = `USDC : ${usdcBalance}`;
            testhBalanceElement.innerHTML = `TESTH : ${testhBalance}`;

        } else {
            walletInfo.style.display = 'none';
        }
    } catch (error) {
        console.error("Erreur lors de la récupération ou de l'affichage des informations du portefeuille :", error);

        // Masque walletInfo en cas d'erreur
        walletInfo.style.display = 'none';
        logoutWalletButton.style.display = 'none';

        // Optionnel : Ajouter un message d'erreur à l'utilisateur
        usdcBalanceElement.innerHTML = "USDC : Erreur";
        testhBalanceElement.innerHTML = "TESTH : Erreur";
    }
}



checkInstalled();
checkIfUserConnected();
window.ethereum.on('accountsChanged', handleAccountsChanged);
// Écouter les changements de réseau MetaMask
checkNetwork();
window.ethereum.on('chainChanged', checkNetwork);
