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
    const [showEvents, setShowEvents] = React.useState<boolean>(true);
    const [autoScroll, setAutoScroll] = React.useState<boolean>(true);

    const listRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (autoScroll) {
            listRef.current!.scrollTop = listRef.current!.scrollHeight;
        }
    });

    const onFilterChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value.replace(/(\s|[^a-z0-9,-])/gi, '');
        const newFilter = value.split(',').map(v => v.toLowerCase());
        newFilter[0] !== '' ? setFilter(newFilter) : setFilter([]);
    };

    const onExcludeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value.replace(/(\s|[^a-z0-9,-])/gi, '');
        const newExclude = value.split(',').map(v => v.toLowerCase());
        newExclude[0] !== '' ? setExclude(newExclude) : setExclude([]);
    };

    return useObserver(() => {
        const messages = messageStore.messages.filter((m) => {
            return (
                (!showSent ? m.type !== 'sent' : true) &&
                (!showRecieved ? m.type !== 'recieved' : true) &&
                (!showEvents ? m.type !== 'event' : true) &&
                (filter.length > 0 ? filter.includes(m.data[0].toLowerCase()) : true) &&
                (exclude.length > 0 ? !exclude.includes(m.data[0].toLowerCase()) : true)
            );
        });

        const lastBytesSequence = messageStore.getLastBytesSequence(16);

        let secondToLastBytesSequence = '';
        if (lastBytesSequence[0].length > 0) {
            secondToLastBytesSequence = lastBytesSequence[0].join(', ').concat(', ... ');
        }

        let lastByteSequence = '';
        if (lastBytesSequence[1].length > 0) {
            lastByteSequence = lastBytesSequence[1].join(', ').concat(', ...');
            if (lastBytesSequence[1].every(s => s === lastBytesSequence[1][0])) {
                lastByteSequence = lastBytesSequence[1][0]?.toString().concat(', ...');
            }
        }

        return (
            <div className={styles.container}>
                <div className={styles.topBar}>
                    <div>
                        <button className="btn btn-primary btn-sm" onClick={() => ipcRenderer.send('reopen-window')}>Reopen Krunker</button>
                        <button className="btn btn-danger btn-sm" onClick={() => messageStore.clearAll()}>Clear</button>
                        <input type="text" placeholder="Filter" onChange={onFilterChange}/>
                        <input type="text" placeholder="Exclude" onChange={onExcludeChange}/>
                        <input type="checkbox" checked={showSent} onChange={() => setShowSent(!showSent)}/><span>Sent</span>
                        <input type="checkbox" checked={showRecieved} onChange={() => setShowRecieved(!showRecieved)}/><span>Recieved</span>
                        <input type="checkbox" checked={showEvents} onChange={() => setShowEvents(!showEvents)}/><span>Events</span>
                        <input type="checkbox" checked={autoScroll} onChange={() => setAutoScroll(!autoScroll)}/><span>Auto Scroll</span>
                    </div>
                    <div>
                        <span>{secondToLastBytesSequence}</span>
                        <span>{lastByteSequence}</span>
                    </div>
                </div>
                <div className={styles.list} ref={listRef}>
                    { messages.map(m => <MessageListEntry key={m.key} message={m} />) }
                </div>
            </div>
        );
    });
};
