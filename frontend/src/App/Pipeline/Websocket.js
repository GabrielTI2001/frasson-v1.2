import React, { useEffect, useState } from 'react';
// import io from 'socket.io-client';

const SOCKET_SERVER_URL = `${process.env.REACT_APP_WS_URL}/pipeline/`;

const WebSocketComponent = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState()

if (socket){
  socket.onopen = () => {
    console.log('Connected to WebSocket server');
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setMessages((prevMessages) => [...prevMessages, data.message.name]);
  };

  socket.onclose = () => {
    console.log('Disconnected from WebSocket server');
  };
}


useEffect(() => {
    setSocket(new WebSocket(SOCKET_SERVER_URL));
  }, []);

  const sendMessage = () => {
    socket.send(JSON.stringify({message:{name:message, id:2}}));
    setMessage('');
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default WebSocketComponent;