import Head from 'next/head';
import InputBox from '../components/InputBox';
import SlideableBar from '../components/SlideableBar';
import { useState } from 'react';

const Home: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = useState<null | { name: string; email: string; password: string }>(null);
  const [platform, setPlatform] = useState<'facebook' | 'instagram'>('facebook');

  const handleAccountSelect = (account: { name: string; email: string; password: string }) => {
    setSelectedAccount(account);
  };

  return (
    <div className="container">
      <Head>
        <title>FacebookUp</title>
        <meta name="description" content="index" />
        <link rel="icon" href="/favicon.ico" />
        <style>{`
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
            margin: 0;
            line-height: 1.15;
            font-size: 4rem;
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

          .selectPlatform {
            display: flex;
            justify-content: center;
            margin-bottom: 2rem;
          }

          .selectPlatform button {
            padding: 10px 20px;
            margin: 0 10px;
            background-color: #444;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            outline: none;
            transition: background-color 0.3s;
          }

          .selectPlatform button:hover {
            background-color: #555;
          }

          .selectPlatform button.selected {
            background-color: #007bff;
          }
        `}</style>
      </Head>

      <main className="main">
        <h1 className="title">FacebookUp</h1>
        <div className="selectPlatform">
          <button
            className={platform === 'facebook' ? 'selected' : ''}
            onClick={() => setPlatform('facebook')}
          >
            Facebook
          </button>
          <button
            className={platform === 'instagram' ? 'selected' : ''}
            onClick={() => setPlatform('instagram')}
          >
            Instagram
          </button>
        </div>

        <InputBox selectedAccount={selectedAccount} platform={platform} />
      </main>

      <SlideableBar selectedPlatform={platform} onSelect={handleAccountSelect} />
    </div>
  );
};

export default Home;
