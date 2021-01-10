import { ipcRenderer } from 'electron';
import * as React from 'react';
import { render } from 'react-dom';
import { MessageList } from './components/MessageList';
import { messageStore } from './stores/MessageStore';

const App: React.FC = () => {
    return (
        <MessageList />
    );
};

render(<App />, document.getElementById('app'));

ipcRenderer.on('data-recieved', (e, args: [Uint8Array]) => {
    messageStore.addMessage(args[0], false);
});

ipcRenderer.on('data-sent', (e, args: [Uint8Array]) => {
    messageStore.addMessage(args[0], true);
});
