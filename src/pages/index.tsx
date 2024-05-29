import Head from 'next/head';
import InputBox from '../components/InputBox';
import SlideableBar from '../components/SlideableBar';
import { useState, useEffect } from 'react';

interface Account {
  name: string;
  email: string;
  password: string;
}

const Home: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    // Load accounts from the accounts.json file
    fetch('/accounts.json')
      .then((response) => response.json())
      .then((data) => setAccounts(data))
      .catch((error) => console.error('Error loading accounts:', error));
  }, []);

  const handleSendMessage = (message: string) => {
    // Handle sending the message with the selected account
    if (selectedAccount) {
      console.log('Sending message:', message, 'with account:', selectedAccount);
    } else {
      console.log('No account selected');
    }
  };

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    console.log('Selected account:', account);
  };

  return (
    <div className="container">
      <Head>
        <title>FacebookUp</title>
        <meta name="description" content="index" />
        <link rel="icon" href="/favicon.ico" />
        <style>
          {`
            body {
              margin: 0;
              padding: 0;
            }

            .container {
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              background-color: #111;
              color: #fff;
              font-family: Arial, sans-serif;
            }

            .title {
              font-size: 3rem;
            }

            .main {
              padding: 5rem 0;
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
            }

            .input-container {
              display: flex;
              align-items: center;
            }

            .input-container input {
              width: 300px;
              padding: 10px;
              margin-right: 10px;
              border-radius: 5px;
              border: none;
              outline: none;
            }

            .input-container button {
              padding: 10px 20px;
              background-color: #007bff;
              color: #fff;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              outline: none;
            }

            .input-container button:hover {
              background-color: #0056b3;
            }
          `}
        </style>
      </Head>

      <main className="main">
        <h1 className="title">FacebookUp</h1>

        <InputBox selectedAccount={selectedAccount} onSend={handleSendMessage} />
      </main>

      <SlideableBar accounts={accounts} selectedAccount={selectedAccount} onSelect={handleAccountSelect} />
    </div>
  );
};

export default Home;
  