const fs = require('fs');
const abi = require('./artifacts/contracts/VulnVaultRegistry.sol/VulnVaultRegistry.json').abi;
let file = fs.readFileSync('src/lib/contracts.ts', 'utf8');

// Replace address
file = file.replace(/export const VULNVAULT_REGISTRY = "0x[a-fA-F0-9]+" as const;/, 'export const VULNVAULT_REGISTRY = "0x255983a72c5D824788676B456390BD3E47d309b4" as const;');

// Replace ABI
const abiString = 'export const VULNVAULT_ABI = ' + JSON.stringify(abi, null, 2) + ' as const;';
file = file.replace(/export const VULNVAULT_ABI = \[[\s\S]*?\] as const;/, abiString);

fs.writeFileSync('src/lib/contracts.ts', file);
console.log("Updated contracts.ts with new ABI and Address");
