import React, { useState } from 'react';
import './InputBox.module.css'; // Import CSS file

interface Account {
  name: string;
  email: string;
  password: string;
}

interface InputBoxProps {
  selectedAccount: Account | null;
}

const InputBox: React.FC<InputBoxProps> = ({ selectedAccount }) => {
  const [url, setUrl] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setUrl(value);
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setComment(value);
  };

  const handleSendClick = async () => {
    if (!selectedAccount) {
      setMessage('Please select an account first.');
      return;
    }

    const { email, password } = selectedAccount;

    setMessage('Sending comment...');
    try {
      // Send the URL, comment, email, and password to the server API for processing
      const response = await fetch('/api/open-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, comment, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Comment sent successfully!');
      } else {
        setMessage(`Failed to send comment: ${data.error}`);
      }
    } catch (error) {
      setMessage('An error occurred while sending the comment.');
      console.error(error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <input
        type="text"
        value={url}
        onChange={handleUrlChange}
        placeholder="URL"
        style={{ marginBottom: '1rem' }}
      />
      <input
        type="text"
        value={comment}
        onChange={handleCommentChange}
        placeholder="Comment"
        style={{ marginBottom: '1rem' }}
      />
      <button onClick={handleSendClick}>Send Comment</button>
      <p>{message}</p>
    </div>
  );
};

export default InputBox;
