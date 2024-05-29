import fs from 'fs';

// Function to load accounts from JSON file
export function loadAccounts(): Account[] {
  const data = fs.readFileSync('accounts.json', 'utf-8');
  return JSON.parse(data);
}

// Account interface
interface Account {
  email: string;
  password: string;
}