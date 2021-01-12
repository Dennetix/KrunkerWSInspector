import * as React from 'react';
import { render } from 'react-dom';
import * as WebSocket from 'ws/index';
import { MessageList } from './components/MessageList';
import { messageStore } from './stores/MessageStore';

const App: React.FC = () => {
    return (
        <MessageList />
    );
};

render(<App />, document.getElementById('app'));

const wss = new WebSocket.Server({ port: 1337 });
wss.on('connection', (ws) => {
    ws.on('message', (msg: Uint8Array) => {
        messageStore.addMessage(msg);
    });
});
