import Head from 'next/head';
import InputBox from '../components/InputBox';

const Home: React.FC = () => {
  const handleSendMessage = (message: string) => {
    // Handle sending the message here
    console.log('Sending message:', message);
  };

  return (
    <div className="container">
      <Head>
        <title>FacebookUp</title>
        <meta name="description" content="index" />
        <link rel="icon" href="/favicon.ico" />
        <style>
          {`
            /* Add this CSS to remove default margins and padding */
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
          `}
        </style>
      </Head>

      <main className="main">
        <h1 className="title">FacebookUp</h1>

        <InputBox onSend={handleSendMessage} />
      </main>
    </div>
  );
};

export default Home;
