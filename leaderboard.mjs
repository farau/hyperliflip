import { ethers, Wallet, JsonRpcProvider, formatUnits } from "ethers";
import config from "./config.js";
import dotenv from "dotenv";

// Initialisation de dotenv
dotenv.config();

// Connexion au provider (par exemple, Infura ou un nœud local)
const provider = new JsonRpcProvider(process.env.RPC_URL);

// Chargement de l'adresse du contrat et de l'ABI depuis le fichier de configuration
const contractAddress = config.hyperflipAddress;
const abi = config.hyperflipAbi

// Instanciation du contrat intelligent PacBoomTest
const contract = new ethers.Contract(contractAddress, abi, provider);
import pkg from 'pg';
const { Pool } = pkg;

// Configuration de la connexion PostgreSQL
const pool = new Pool({
    user: process.env.USR_DATABASE,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432 // Port par défaut de PostgreSQL
});

// Fonction pour récupérer tous les utilisateurs
export async function getUsers() {
    let client;
    try {
        // Obtenez un client de la pool
        client = await pool.connect();

        // Exécutez la requête SQL pour récupérer les utilisateurs
        const { rows: users } = await client.query(`
            SELECT wallet_address 
            FROM users
            WHERE wallet_address = LOWER(wallet_address)
        `);
        return users;  // Retourne les utilisateurs
    } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        throw err;  // Propager l'erreur pour que l'appelant puisse la gérer
    } finally {
        // Libérez toujours le client, même en cas d'erreur
        if (client) client.release();
    }
}


// Fonction pour récupérer les données des utilisateurs
export async function getUserData() {
    try {
        // Récupérer les utilisateurs depuis la base de données
        const users = await getUsers();
        // Initialiser un tableau pour stocker les données des utilisateurs
        const userData = [];
        let i = 1;
        // Boucler sur les utilisateurs
        for (const user of users) {
            // Récupérer l'adresse Ethereum de l'utilisateur
            const address = user.wallet_address;
            
            // Appeler les fonctions du contrat Ethereum pour récupérer les données
            const points = formatUnits(await contract.getPointsPlayer(address), 18) * 10**18; // Supposons que les points soient en Wei
            const volume = formatUnits(await contract.getVolumePlayer(address), 18);
            const bets = formatUnits(await contract.getTotalBetsPlayer(address), 18) * 10**18;
            // Conversion pour l'affichage

            // Convertir la chaîne en nombre flottant
            const pointsFloat = parseFloat(points);

            // Arrondir la valeur flottante à l'entier le plus proche
            const pointsRounded = Math.round(pointsFloat);

            //console.log("address :", address, " bonus : ", bonus, " points : ", points, " nfts : ", nfts);
            // Ajouter les données de l'utilisateur au tableau
            userData.push({ address, points : pointsRounded, volume: volume, bets: bets});

            i++;
        }
        // Trier les données par points
        userData.sort((a, b) => b.points - a.points);

        // Retourner les données des utilisateurs
        return userData;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}