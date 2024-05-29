import React, { useState } from 'react';
import './InputBox.module.css'; // Import CSS file

const InputBox: React.FC = () => {
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
    setMessage('Sending comment...');
    try {
      // Send the URL and comment to the server API for processing
      const response = await fetch('/api/open-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, comment }),
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
