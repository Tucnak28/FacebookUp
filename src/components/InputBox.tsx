// src/components/InputBox.tsx
import React, { useState } from 'react';
import { Input, Button } from '@nextui-org/react';
import styles from './InputBox.module.css';

const InputBox: React.FC = () => {
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');

  const handleSendClick = async () => {
    setMessage('Logging in...');
    // Your login logic goes here
  };

  return (
    <div className={styles.inputBoxContainer}>
      <Input
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className={styles.urlInput}
      />
      <Button onClick={handleSendClick} className={styles.sendButton}>
        Send
      </Button>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default InputBox;
