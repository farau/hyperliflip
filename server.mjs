import * as hyperliquid from "@nktkas/hyperliquid";
import express from "express";
import path from "path";
import session from "express-session";
import flash from "connect-flash";
import cookieParser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import { ethers, Wallet, JsonRpcProvider } from "ethers";
import config from "./config.js";
import dotenv from "dotenv";
import fs from 'fs';


// Initialisation de dotenv
dotenv.config();

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Création de l'application Express
const app = express();

const privateKey = process.env.PRIVATE_KEY;
const signer = new Wallet(privateKey);

// Chargement de l'adresse du contrat du NFT Hyperliflip et de l'ABI depuis le fichier de configuration
const hyperflipAddress = config.hyperflipAddress; 
const hyperflipAbi = config.hyperflipAbi;

// Initialisation du provider (vous pouvez utiliser Infura, Alchemy, ou un autre service)
const provider = new JsonRpcProvider(process.env.RPC_URL);

// Instanciation du smart contract Hyperliflip
const contract = new ethers.Contract(hyperflipAddress, hyperflipAbi, provider);

// Configurer le moteur EJS pour rendu dynamique des pages html/css
app.set('view engine', 'ejs');

// Indiquer le répertoire où se trouvent vos fichiers EJS
app.set('views', path.join(__dirname, 'public'));

// Dites à Express de faire confiance aux proxies
app.set('trust proxy', true);


// Middleware pour parser le corps de la requête en JSON
app.use(express.json(), flash());
app.use(cookieParser()); // Utiliser cookieParser pour gérer les cookies sécurisés

// Configurer les sessions Express
app.use(
    session({
      secret: process.env.SECRET_EXPRESS_SESSION, // Clé secrète pour signer le cookie de session
      resave: false, // Ne pas resauvegarder la session si elle n'est pas modifiée
      saveUninitialized: false, // Ne pas sauvegarder la session si elle est vide
      cookie: {
        maxAge: 60 * 60 * 1000, // Durée de vie du cookie de session : 1 heure (en millisecondes)
        secure: process.env.NODE_ENV === 'production', // Mettre à true si vous utilisez HTTPS pour sécuriser le cookie
        httpOnly: true, // Empêche JavaScript côté client d'accéder au cookie
      },
      rolling: true, // Renouvelle la durée de vie du cookie à chaque requête
    })
  );

// Utilisation du middleware CORS
app.use(cors());

// Middleware pour servir les fichiers statiques (HTML, CSS, JavaScript, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour permettre d'accéder aux fichiers sans l'extension .html
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, 'public', `${page}.html`);

  // Vérifier si le fichier .html existe et le renvoyer
  res.sendFile(filePath, (err) => {
      if (err) {
          next(); // Si le fichier n'existe pas, continuer le flux normal
      }
  });
});


// Route pour créer le JWT et sauvegarder l'utilisateur
app.post('/loginUser', async (req, res) => {
    const userAddress = req.body.userAddress.toLowerCase();

    // Remplacez 'votre_clé_secrète' par votre propre clé secrète sécurisée
    const secretKey = process.env.SECRET_KEY;

    // Créez le JWT en incluant l'adresse MetaMask de l'utilisateur
    const token = jwt.sign({ address: userAddress }, secretKey, { expiresIn: '1h' });

    // Stocker le JWT dans la session pour être utilisable pour faire le lien entre userAddress et username twitter lors du link
    req.session.jwt = token;

    // Configurer le cookie sécurisé
    res.cookie('jwt', token, {
        httpOnly: true, // Empêche l'accès au cookie par JavaScript côté client
        secure: process.env.NODE_ENV == 'production',    // Le cookie n'est envoyé que sur HTTPS
        sameSite: 'Strict', // Le cookie n'est envoyé que pour le même site (évite les CSRF)
        maxAge: 3600000  // 1 heure en millisecondes
    });

    //On ne sauvegarde rien en BDD

    // Répondre avec le résultat de l'enregistrement
    res.status(200).json({ message: 'Successfully connected' });
});

// Route pour la déconnexion
app.post('/logoutUser', verifyJWT, (req, res) => {

    // Vérifie si le JWT est présent dans la session
    if (!req.cookies.jwt) {
        // Si le JWT est absent, l'utilisateur est déjà déconnecté
        return res.status(400).json({ message: 'User already deconnected.' });
    }
    // Supprime le token de la session
    req.session.jwt = null; // Ou delete req.session.jwt; pour le supprimer complètement

    // Supprime le cookie du côté client en définissant une date d'expiration passée
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV == 'production', // Assurez-vous que ceci est en phase avec votre environnement (utilisez 'secure: false' en développement sans HTTPS)
        sameSite: 'Strict',
    });

    // Détruit la session (utile pour supprimer toutes les données de session si nécessaire)
    req.session.destroy((err) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'Error during logout process.' });
        }
    });
    // Redirection ou réponse après la déconnexion
    return res.status(200).json({ ok: 'Successfully logout.' });
});

// Middleware pour vérifier le JWT dans les en-têtes de la requête
function verifyJWT(req, res, next) {
    const jwtToken = req.cookies.jwt; // Obtenez le JWT dans les cookies de la requête

    // Vérifiez la validité et la signature du JWT
    jwt.verify(jwtToken, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token invalide' });
        }
        // Extraire l'adresse MetaMask de l'utilisateur
        req.userAddress = decoded.address;
        next();
    });
}



let httpTransport, clientInfo;

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

}

initializeInfoClient();

// Fonction pour récupérer le volume de la dApp
async function getVolumeDapp() {
    try {
        // Récupération du montant total des paris (totalBetsValue)
        const totalBetsValue = await contract.totalBetsValue(); // Getter dans le smart contract
        console.log('Total Bets Value:', totalBetsValue.toString()); // Journalisation pour debug

        // Récupération des informations liées au contexte de l'asset
        const req = await clientInfo.metaAndAssetCtxs();
        const ethValue = req[1][4]?.markPx; // Prix de l'ETH dans le contexte
        
        if (!ethValue || !totalBetsValue) {
            console.error('ETH price or total bets value is undefined');
            return;
        }

        // Conversion et calcul du volume
        const volume = Math.round(ethValue * (Number(totalBetsValue) / 10 ** 18));
        console.log('Volume DApp ($):', volume);
        return volume;
    } catch (error) {
        console.error('Cannot retrieve volume data:', error);
    }
}

// Mettre à jour la TVL toutes les 2 minutes
const updateInterval = 2* 60 * 1000; // 2 minutes en millisecondes
let currentVolume = 0; // Stocker le volume de la DApp

// Fonction pour mettre à jour le volume de la DApp
const updateVolumeDapp = async () => {
    try {
        const volume = await getVolumeDapp();
        if (volume !== undefined) {
            currentVolume = volume; // Mettre à jour le volume actuel
            console.log('Volume DApp mis à jour:', volume);
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du volume DApp:', error);
    }
};

// Mettre à jour la TVL toutes les 2 minutes
setInterval(updateVolumeDapp, updateInterval);


// Route POST pour récupérer le volume de la dApp
app.post('/volume-dapp', (req, res) => {
    try {
        res.status(200).json({ value: currentVolume }); // Renvoyer la valeur actuelle du volume
    } catch (error) {
        console.error('Error fetching volume of the app:', error);
        res.status(500).json({ error: 'Error fetching volume of the app' });
    }
});


// Route POST pour vérifier le JWT
app.post('/verify-jwt', verifyJWT, (req, res) => {
    // Si nous sommes arrivés ici, le JWT est valide et l'adresse de l'utilisateur est dans req.userAddress
    res.status(200).json({ userAddress: req.userAddress });
});


// Démarre le serveur Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, 'localhost', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

