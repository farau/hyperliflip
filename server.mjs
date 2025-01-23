import * as hyperliquid from "@nktkas/hyperliquid";
import express from "express";
import path from "path";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import { ethers, Wallet, JsonRpcProvider } from "ethers";
import config from "./config.js";
import dotenv from "dotenv";
import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

// Initialisation de dotenv
dotenv.config();

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Création de l'application Express
const app = express();

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
app.use(express.json());
app.use(cookieParser()); // Utiliser cookieParser pour gérer les cookies sécurisés

// Configurer les sessions Express
app.use(
    session({
      secret: process.env.SECRET_EXPRESS_SESSION, // Clé secrète pour signer le cookie de session
      resave: false, // Ne pas resauvegarder la session si elle n'est pas modifiée
      saveUninitialized: false, // Ne pas sauvegarder la session si elle est vide
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // Durée de vie du cookie de session : 1 jour (en millisecondes)
        secure: process.env.NODE_ENV === 'production', // Mettre à true si vous utilisez HTTPS pour sécuriser le cookie
        httpOnly: true, // Empêche JavaScript côté client d'accéder au cookie
      },
      rolling: true, // Renouvelle la durée de vie du cookie à chaque requête
    })
  );

// Utilisation du middleware CORS
app.use(cors());

// Configuration de la connexion PostgreSQL
const pool = new Pool({
    user: process.env.USR_DATABASE,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432 // Port par défaut de PostgreSQL
});

// Fonction pour créer les tables dans PostgreSQL
async function createTables() {
    const client = await pool.connect();
    try {
      await client.query(`        
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            wallet_address VARCHAR(42) NOT NULL UNIQUE,
            referral_code VARCHAR(42) UNIQUE
        );
        
      `);
  
      console.log('Tables créées ou chargées avec succès');
    } catch (err) {
      console.error('Erreur lors de la création des tables', err);
    } finally {
      client.release();
    }
}

// Appel de la fonction pour créer les tables au démarrage du serveur
createTables();

// LEADERBOARD -----------
import * as leaderboard from './leaderboard.mjs';

let leaderboardData = [];

// Fonction pour sauvegarder le leaderboard dans un fichier JSON
async function saveLeaderboardToFile() {
    try {
        const userData = await leaderboard.getUserData();  // Récupérer les données des utilisateurs
        leaderboardData = {userData : userData, date : new Date()};  // Mettre à jour la variable globale

        // Sauvegarder les données dans un fichier JSON
        fs.writeFileSync('leaderboard.json', JSON.stringify(leaderboardData, null, 2), 'utf8');
        console.log('Leaderboard mis à jour et sauvegardé dans leaderboard.json');
    } catch (error) {
        console.error('Erreur lors de la mise à jour du leaderboard:', error);
    }
}

// Appeler immédiatement la fonction pour calculer et stocker le leaderboard au démarrage du serveur
saveLeaderboardToFile();

// Mettre à jour le leaderboard toutes les 10 minutes
setInterval(saveLeaderboardToFile, /*10 */ 60 * 1000);

// Route pour renvoyer les données du leaderboard
app.get('/getLeaderboard', (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;  // Page actuelle (par défaut 1)
        const pageSize = parseInt(req.query.pageSize) || 10;  // Taille de la page (par défaut 10)

        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;
        
        // Lire et parser les données du fichier JSON
        const leaderboardData = JSON.parse(fs.readFileSync('leaderboard.json', 'utf8'));

        // Charger les données du leaderboard (stockées dans leaderboardData par exemple)
        const leaderboard = leaderboardData.userData.slice(startIndex, endIndex);  // Extraire la portion paginée
        const last_refresh = leaderboardData.date;

        res.status(200).json({
            leaderboard,  // Renvoyer la portion paginée
            page,
            pageSize,
            last_refresh
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des données du leaderboard' });
    }
});

// Route pour renvoyer les données du leaderboard pour un user
app.post('/getUserLeaderboard', verifyJWT, (req, res) => {
    try {
        // Addresse de l'user
        const address = req.userAddress.toLowerCase();
        // Vérifiez si l'adresse est fournie
        if (!address) {
            return res.status(400).send('Address not provided.');
        }

        // Charger les données du leaderboard (stockées dans leaderboardData par exemple)
        // Lire et parser les données du fichier JSON
        const leaderboardData = JSON.parse(fs.readFileSync('leaderboard.json', 'utf8'));

        const leaderboardUser = leaderboardData.userData.filter(user => user.address === address);

        // Trouver l'index de l'utilisateur dans le leaderboard
        const index = leaderboardData.userData.findIndex(user => user.address === address);

        res.status(200).json({
            leaderboardUser, rank : index + 1
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des données du leaderboard' });
    }
});

// ------------ -----------

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


// Fonction pour sauvegarder l'utilisateur et créer un code referral 
async function saveUser(userAddress) {
    const client = await pool.connect();
    try {
        // Récupérez le dernier ID inséré dans la table users
        const lastUserIdQuery = 'SELECT MAX(id) AS max_id FROM users';
        const { rows } = await client.query(lastUserIdQuery);
        let nextUserId = 1; // Valeur par défaut pour le premier utilisateur s'il n'y a pas encore d'enregistrement
        if (rows.length > 0 && rows[0].max_id !== null) {
            nextUserId = parseInt(rows[0].max_id) + 1; // Incrémente le dernier ID
        }

        // Insérez le nouvel utilisateur ou récupérez ses informations en cas de conflit
        const insertUserQuery = `
            INSERT INTO users (id, wallet_address) 
            VALUES ($1, LOWER($2)) 
            ON CONFLICT (wallet_address) 
            DO UPDATE SET wallet_address = EXCLUDED.wallet_address 
            RETURNING *;
        `;
        const userResult = await client.query(insertUserQuery, [nextUserId, userAddress]);
        const user = userResult.rows[0]; // Récupérez l'utilisateur inséré ou existant

        // Générer un code referral unique si inexistant
        if (!user.referral_code) {
            let referralCode;
            let isUnique = false;

            // Boucle pour garantir l'unicité du code
            while (!isUnique) {
                referralCode = generateReferralCode();
                const codeCheckQuery = 'SELECT COUNT(*) FROM users WHERE referral_code = $1';
                const codeCheckResult = await client.query(codeCheckQuery, [referralCode]);
                isUnique = codeCheckResult.rows[0].count === '0';
            }

            // Mettre à jour l'utilisateur avec le code referral
            const updateQuery = 'UPDATE users SET referral_code = $1 WHERE id = $2 RETURNING *';
            const updateResult = await client.query(updateQuery, [referralCode, user.id]);
            console.log("Referral code generated and inserted:", updateResult.rows[0].referral_code);
        } else {
            console.log("Referral code already exists:", user.referral_code);
        }

        return { message: 'User successfully logged or updated.', status: 201 };
    } catch (error) {
        console.error("Error during the registering of the user:", error);
        return { message: "Error during the registering of the user.", status: 500 };
    } finally {
        client.release(); // Libérer le client après utilisation
    }
}



// Route pour créer le JWT et sauvegarder l'utilisateur
app.post('/loginOrSaveUser', async (req, res) => {
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

    // Appel de la fonction saveUser pour enregistrer l'utilisateur
    const saveResult = await saveUser(userAddress);

    // Répondre avec le résultat de l'enregistrement
    res.status(saveResult.status).json({ message: saveResult.message });
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
        const hypeValue = req[1][135]?.markPx; // Prix du HYPE dans le contexte

        if (!hypeValue) {
            console.error('HYPE price is undefined');
            return;
        }

        if (!totalBetsValue) {
            console.error('Total Bets is undefined');
            return;
        }
        // Conversion et calcul du volume
        const volume = Math.round(hypeValue * (Number(totalBetsValue) / 10 ** 18));
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

// Fonction pour générer un code referral
function generateReferralCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
return code;
}


// Fonction pour récupérer l'adresse user d'un code referral
app.post('/getReferralCode', verifyJWT, async (req, res) => {
    const wallet_address = req.userAddress; //récupére la userAddress directement depuis verifyJWT

    // Vérification du paramètre referral_code
    if (!wallet_address) {
        return res.status(400).json({ message: 'No user connected' });
    }

    const client = await pool.connect(); // Connexion au client PostgreSQL
    try {
        // Requête pour récupérer l'adresse du portefeuille associée au code referral
        const query = `
            SELECT referral_code 
            FROM users 
            WHERE wallet_address = $1`;
        const result = await client.query(query, [wallet_address]);

        // Vérification si un résultat est trouvé
        if (result.rows.length > 0) {
            return res.status(200).json({ referral_code: result.rows[0].referral_code });
        } else {
            return res.status(404).json({ message: 'Referral code not found' });
        }
    } catch (error) {
        console.error("Error during the retrieval of referral code:", error);
        return res.status(500).json({ message: "Error during the retrieval of referral code." });
    } finally {
        client.release(); // Libérer le client après utilisation
    }
});



// Fonction pour récupérer l'adresse user d'un code referral
app.post('/getAddressReferee', verifyJWT, async (req, res) => {
    const referral_code = req.body.code;

    // Vérification du paramètre referral_code
    if (!referral_code) {
        return res.status(400).json({ message: 'Invalid referral code' });
    }

    const client = await pool.connect(); // Connexion au client PostgreSQL
    try {
        // Requête pour récupérer l'adresse du portefeuille associée au code referral
        const query = `
            SELECT wallet_address 
            FROM users 
            WHERE referral_code = $1`;
        const result = await client.query(query, [referral_code]);

        // Erreur si on veut entrer son referral code perso 
        // Vérification si un résultat est trouvé
        if (result.rows.length > 0) {
            const address = result.rows[0].wallet_address;
            if (address === req.userAddress) {
                return res.status(400).json({ message: 'You cannot enter your own referral code' });
            }
            return res.status(200).json({ wallet_address: result.rows[0].wallet_address });
        } else {
            return res.status(404).json({ message: 'Referral code not found' });
        }
    } catch (error) {
        console.error("Error during the retrieval of address:", error);
        return res.status(500).json({ message: "Error during the retrieval of address." });
    } finally {
        client.release(); // Libérer le client après utilisation
    }
});


// Démarre le serveur Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, 'localhost', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

