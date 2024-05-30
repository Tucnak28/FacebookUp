import React, { useState, useEffect } from 'react';

interface Account {
  name: string;
  email: string;
  password: string;
}

interface SlideableBarProps {
  selectedPlatform: 'facebook' | 'instagram';
  onSelect: (account: Account) => void;
}

const SlideableBar: React.FC<SlideableBarProps> = ({ selectedPlatform, onSelect }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    const accountsFile = selectedPlatform === 'facebook' ? 'facebook_accounts.json' : 'instagram_accounts.json';

    fetch(`/${accountsFile}`)
      .then((response) => response.json())
      .then((data) => setAccounts(data))
      .catch((error) => console.error('Error loading accounts:', error));
  }, [selectedPlatform]);

  const handleSelect = (account: Account) => {
    setSelectedAccount(account);
    onSelect(account);
  };

  return (
    <div className="slideable-bar">
      {accounts.map((account) => (
        <button
          key={account.email}
          onClick={() => handleSelect(account)}
          className={`account ${selectedAccount?.name === account.name ? 'selected' : ''}`}
        >
          {account.name}
        </button>
      ))}
      <style jsx>{`
        .slideable-bar {
          display: flex;
          overflow-x: auto;
          background-color: #333;
          padding: 10px;
          border-radius: 5px;
        }
        .account {
          padding: 10px 20px;
          margin-right: 10px;
          background-color: #444;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          outline: none;
        }
        .account.selected {
          background-color: #007bff;
        }
        .account:hover {
          background-color: #555;
        }
      `}</style>
    </div>
  );
};

export default SlideableBar;
