import { ipcRenderer } from 'electron';
import { useObserver } from 'mobx-react-lite';
import * as React from 'react';
import { messageStore } from '../stores/MessageStore';
import * as styles from './MessageList.css';
import { MessageListEntry } from './MessageListEntry';

export const MessageList: React.FC = () => {
    const [filter, setFilter] = React.useState<string[]>([]);
    const [exclude, setExclude] = React.useState<string[]>([]);
    const [showSent, setShowSent] = React.useState<boolean>(true);
    const [showRecieved, setShowRecieved] = React.useState<boolean>(true);

    const onFilterChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value.replace(/(\s|[^a-z0-9,])/gi, '');
        const newFilter = value.split(',').map(v => v.toLowerCase());
        newFilter[0] !== '' ? setFilter(newFilter) : setFilter([]);
    };

    const onExcludeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value.replace(/(\s|[^a-z0-9,])/gi, '');
        const newExclude = value.split(',').map(v => v.toLowerCase());
        newExclude[0] !== '' ? setExclude(newExclude) : setExclude([]);
    };

    return useObserver(() => {
        const messages = messageStore.messages.filter((m) => {
            return (
                (!showSent ? !m.sent : true) &&
                (!showRecieved ? m.sent : true) &&
                (filter.length > 0 ? filter.includes(m.data[0].toLowerCase()) : true) &&
                (exclude.length > 0 ? !exclude.includes(m.data[0].toLowerCase()) : true)
            );
        });

        return (
            <div className={styles.container}>
                <div className={styles.topBar}>
                    <button className="btn btn-primary btn-sm" onClick={() => ipcRenderer.send('reopen-window')}>Reopen Krunker</button>
                    <button className="btn btn-danger btn-sm" onClick={() => messageStore.clearAll()}>Clear</button>
                    <input type="text" placeholder="Filter" onChange={onFilterChange}/>
                    <input type="text" placeholder="Exclude" onChange={onExcludeChange}/>
                    <input type="checkbox" checked={showSent} onChange={() => setShowSent(!showSent)}/><span>Sent</span>
                    <input type="checkbox" checked={showRecieved} onChange={() => setShowRecieved(!showRecieved)}/><span>Recieved</span>
                </div>
                <div className={styles.list}>
                    { messages.map(m => <MessageListEntry key={m.key} message={m} />) }
                </div>
            </div>
        );
    });
};
