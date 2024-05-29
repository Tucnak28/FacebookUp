import React from 'react';

interface Account {
  name: string;
  email: string;
  password: string;
}

interface SlideableBarProps {
  accounts: Account[];
  selectedAccount: Account | null;
  onSelect: (account: Account) => void;
}

const SlideableBar: React.FC<SlideableBarProps> = ({ accounts, selectedAccount, onSelect }) => {
  return (
    <div className="slideable-bar">
      {accounts.map((account) => (
        <div
          key={account.email}
          className={`account ${selectedAccount?.email === account.email ? 'selected' : ''}`}
          onClick={() => onSelect(account)}
        >
          {account.name}
        </div>
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
          border-radius: 5px;
          cursor: pointer;
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
