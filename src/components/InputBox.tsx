import React, { useState, useEffect } from 'react';
import styles from './InputBox.module.css'; // Import CSS file

interface Account {
  name: string;
  email: string;
  password: string;
}

interface InputBoxProps {
  selectedAccount: Account | null;
  platform: 'facebook' | 'instagram';
}

interface Message {
  id: number;
  text: string;
  account: string;
}

const InputBox: React.FC<InputBoxProps> = ({ selectedAccount, platform }) => {
  const [url, setUrl] = useState('');
  const [comment, setComment] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

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
      addMessage('Please select an account first.', 'System');
      return;
    }

    const { email, password, name } = selectedAccount;

    addMessage('Sending comment...', name);
    try {
      // Send the URL, comment, email, password, and platform to the server API for processing
      const response = await fetch(`/api/${platform}_comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, comment, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        addMessage('Comment sent successfully!', name);
      } else {
        addMessage(`Failed to send comment: ${data.error}`, name);
      }
    } catch (error) {
      addMessage('An error occurred while sending the comment.', name);
      console.error(error);
    }
  };

  const addMessage = (text: string, account: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      account,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  useEffect(() => {
    // Remove messages after 10 seconds
    const timer = setTimeout(() => {
      setMessages((prevMessages) => prevMessages.slice(1));
    }, 10000);
    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <div className={styles.container}>
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
        <div className={styles.messages}>
          {messages.map((message) => (
            <p key={message.id} className={styles.message}>
              <strong>{message.account}:</strong> {message.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InputBox;
