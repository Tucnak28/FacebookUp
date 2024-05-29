// pages/index.tsx
import Head from 'next/head';
import InputBox from '../components/InputBox';

const Home: React.FC = () => {
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

            .footer {
              width: 100%;
              height: 80px;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #333;
              color: #fff;
            }
          `}
        </style>
      </Head>

      <main className="main">
        <h1 className="title">FacebookUp</h1>

        <InputBox />
      </main>
    </div>
  );
};

export default Home;
