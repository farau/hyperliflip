// config.js

const config = {
    chain_id : '0x3e6', //Hyperliquid testnet
	rpc_url : 'https://api.hyperliquid-testnet.xyz/evm',
	hyperliflipAddress: '0x17a51b837db44c390159218d30174ebeda2675f4',
	usdcTokenId : 0,
	testhTokenId : 619, //testnet
    hyperliflipAbi : [
		{
		  "inputs": [
			{
			  "internalType": "address[]",
			  "name": "_nftContracts",
			  "type": "address[]"
			},
			{
			  "internalType": "address",
			  "name": "_blastTokenAddress",
			  "type": "address"
			},
			{
			  "internalType": "uint256",
			  "name": "_entryFee",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "thresholdBonus_",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "nonpayable",
		  "type": "constructor"
		},
		{
		  "inputs": [],
		  "name": "ECDSAInvalidSignature",
		  "type": "error"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "length",
			  "type": "uint256"
			}
		  ],
		  "name": "ECDSAInvalidSignatureLength",
		  "type": "error"
		},
		{
		  "inputs": [
			{
			  "internalType": "bytes32",
			  "name": "s",
			  "type": "bytes32"
			}
		  ],
		  "name": "ECDSAInvalidSignatureS",
		  "type": "error"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "owner",
			  "type": "address"
			}
		  ],
		  "name": "OwnableInvalidOwner",
		  "type": "error"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "account",
			  "type": "address"
			}
		  ],
		  "name": "OwnableUnauthorizedAccount",
		  "type": "error"
		},
		{
		  "inputs": [],
		  "name": "ReentrancyGuardReentrantCall",
		  "type": "error"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "value",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "length",
			  "type": "uint256"
			}
		  ],
		  "name": "StringsInsufficientHexLength",
		  "type": "error"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "damage",
			  "type": "uint256"
			}
		  ],
		  "name": "BossAttacked",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "life",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "prize",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "entryFee",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "damage",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "category",
			  "type": "uint256"
			}
		  ],
		  "name": "BossCreated",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "BossDestroyed",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": true,
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "amount",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "lockDuration",
			  "type": "uint256"
			}
		  ],
		  "name": "EtherLocked",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": true,
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "amount",
			  "type": "uint256"
			}
		  ],
		  "name": "EtherUnlocked",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "timestamp",
			  "type": "uint256"
			}
		  ],
		  "name": "LeaderboardReinitialized",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": true,
			  "internalType": "address",
			  "name": "previousOwner",
			  "type": "address"
			},
			{
			  "indexed": true,
			  "internalType": "address",
			  "name": "newOwner",
			  "type": "address"
			}
		  ],
		  "name": "OwnershipTransferred",
		  "type": "event"
		},
		{
		  "anonymous": false,
		  "inputs": [
			{
			  "indexed": true,
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "score",
			  "type": "uint256"
			},
			{
			  "indexed": false,
			  "internalType": "uint256",
			  "name": "bonus",
			  "type": "uint256"
			}
		  ],
		  "name": "PointsEarned",
		  "type": "event"
		},
		{
		  "inputs": [],
		  "name": "LOCK_DURATION_14_DAYS",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "LOCK_DURATION_28_DAYS",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "MIN_LOCK_AMOUNT",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "_nftContract",
			  "type": "address"
			}
		  ],
		  "name": "addNftContract",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "timestamp",
			  "type": "uint256"
			},
			{
			  "internalType": "bytes",
			  "name": "signature",
			  "type": "bytes"
			}
		  ],
		  "name": "attackBoss",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "payable",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "blastToken",
		  "outputs": [
			{
			  "internalType": "contract IERC20",
			  "name": "",
			  "type": "address"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "name": "bosses",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "life",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "prize",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "entryFeeBoss",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "damage",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "category",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "name": "bossesKilled",
		  "outputs": [
			{
			  "internalType": "bool",
			  "name": "",
			  "type": "bool"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "score",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "timestamp",
			  "type": "uint256"
			},
			{
			  "internalType": "bytes",
			  "name": "signature",
			  "type": "bytes"
			}
		  ],
		  "name": "claimPoints",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "payable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "serial_",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "life_",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "prize_",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "entryFee_",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "damage_",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "category_",
			  "type": "uint256"
			}
		  ],
		  "name": "createBoss",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			}
		  ],
		  "name": "getBoss",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "life",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "damage",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "entryFeeBoss",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "prize",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "category",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "getEntryFee",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "getListBossKilledSerials",
		  "outputs": [
			{
			  "internalType": "uint256[]",
			  "name": "",
			  "type": "uint256[]"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "getListBossSerials",
		  "outputs": [
			{
			  "internalType": "uint256[]",
			  "name": "",
			  "type": "uint256[]"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "getMapPlayerKilledBosses",
		  "outputs": [
			{
			  "components": [
				{
				  "internalType": "uint256",
				  "name": "serial",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "life",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "prize",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "entryFeeBoss",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "damage",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "category",
				  "type": "uint256"
				}
			  ],
			  "internalType": "struct PacBoom.PacBoss[]",
			  "name": "",
			  "type": "tuple[]"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "getNbNftContract",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "getPlayer",
		  "outputs": [
			{
			  "components": [
				{
				  "internalType": "uint256",
				  "name": "bonus",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "points",
				  "type": "uint256"
				},
				{
				  "internalType": "bool",
				  "name": "initialized",
				  "type": "bool"
				},
				{
				  "components": [
					{
					  "internalType": "uint256",
					  "name": "amount",
					  "type": "uint256"
					},
					{
					  "internalType": "uint256",
					  "name": "lockEndTime",
					  "type": "uint256"
					},
					{
					  "internalType": "uint256",
					  "name": "lockDuration",
					  "type": "uint256"
					}
				  ],
				  "internalType": "struct PacBoom.Lock[]",
				  "name": "locks",
				  "type": "tuple[]"
				},
				{
				  "internalType": "uint256",
				  "name": "totalLocked",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "lockDurationMax",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "bossKills",
				  "type": "uint256"
				}
			  ],
			  "internalType": "struct PacBoom.Player",
			  "name": "",
			  "type": "tuple"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "getPlayerBonus",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "getPlayerBossKills",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "getPlayerLockDurationMax",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "durationMax",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "getPlayerLocks",
		  "outputs": [
			{
			  "components": [
				{
				  "internalType": "uint256",
				  "name": "amount",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "lockEndTime",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "lockDuration",
				  "type": "uint256"
				}
			  ],
			  "internalType": "struct PacBoom.Lock[]",
			  "name": "",
			  "type": "tuple[]"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "getPlayerPoints",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "getPlayerTotalLocked",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "amount",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "getSigner",
		  "outputs": [
			{
			  "internalType": "address",
			  "name": "",
			  "type": "address"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "getThresholdBonus",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "playerAddress",
			  "type": "address"
			}
		  ],
		  "name": "getTotalLockedEther",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "getTotalLockedEtherAllPlayers",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "playerAddress",
			  "type": "address"
			}
		  ],
		  "name": "getTotalLocks",
		  "outputs": [
			{
			  "components": [
				{
				  "internalType": "uint256",
				  "name": "amount",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "lockEndTime",
				  "type": "uint256"
				},
				{
				  "internalType": "uint256",
				  "name": "lockDuration",
				  "type": "uint256"
				}
			  ],
			  "internalType": "struct PacBoom.Lock[]",
			  "name": "",
			  "type": "tuple[]"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "playerAddress",
			  "type": "address"
			}
		  ],
		  "name": "getTotalUnLockedEther",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			}
		  ],
		  "name": "getWhoKilledBoss",
		  "outputs": [
			{
			  "internalType": "address",
			  "name": "",
			  "type": "address"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "hasNFTFromAnyCollection",
		  "outputs": [
			{
			  "internalType": "bool",
			  "name": "",
			  "type": "bool"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			}
		  ],
		  "name": "isBossKilled",
		  "outputs": [
			{
			  "internalType": "bool",
			  "name": "",
			  "type": "bool"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "name": "listBossKilledSerials",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "name": "listBossSerials",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "lockChoice",
			  "type": "uint256"
			}
		  ],
		  "name": "lockEther",
		  "outputs": [],
		  "stateMutability": "payable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			},
			{
			  "internalType": "uint256",
			  "name": "index",
			  "type": "uint256"
			}
		  ],
		  "name": "numberOfNFTsFromACollection",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "numberOfNFTsFromAllCollections",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "owner",
		  "outputs": [
			{
			  "internalType": "address",
			  "name": "",
			  "type": "address"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "",
			  "type": "address"
			},
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "name": "playerKilledBosses",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "serial",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "life",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "prize",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "entryFeeBoss",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "damage",
			  "type": "uint256"
			},
			{
			  "internalType": "uint256",
			  "name": "category",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "reinitializeLeaderboard",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "index",
			  "type": "uint256"
			}
		  ],
		  "name": "removeNftContract",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "player",
			  "type": "address"
			}
		  ],
		  "name": "removePlayer",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "renounceOwnership",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "entryFee_",
			  "type": "uint256"
			}
		  ],
		  "name": "setEntryFee",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "_signer",
			  "type": "address"
			}
		  ],
		  "name": "setSigner",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "thresholdBonus_",
			  "type": "uint256"
			}
		  ],
		  "name": "setThresholdBonus",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "totalBosses",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "totalBossesKilled",
		  "outputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "address",
			  "name": "newOwner",
			  "type": "address"
			}
		  ],
		  "name": "transferOwnership",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [
			{
			  "internalType": "uint256",
			  "name": "",
			  "type": "uint256"
			}
		  ],
		  "name": "whoKilledBosses",
		  "outputs": [
			{
			  "internalType": "address",
			  "name": "",
			  "type": "address"
			}
		  ],
		  "stateMutability": "view",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "withdrawBlastTokens",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		},
		{
		  "inputs": [],
		  "name": "withdrawUnlockedEther",
		  "outputs": [],
		  "stateMutability": "nonpayable",
		  "type": "function"
		}
	  ],
	erc20Abi : [
		"function balanceOf(address owner) view returns (uint256)",
	],
	usdcAddressEvm : '0x24ac48bf01fd6CB1C3836D08b3EdC70a9C4380cA', // testnet
};