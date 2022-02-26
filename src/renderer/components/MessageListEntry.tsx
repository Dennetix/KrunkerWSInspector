import cn from 'classnames';
import * as React from 'react';
import { JSONTree } from 'react-json-tree';
import { Message } from '../stores/MessageStore';
import * as styles from './MessageListEntry.css';

interface MessageListEntryProps {
    message: Message;
}

export const MessageListEntry: React.FC<MessageListEntryProps> = React.memo(function MessageListEntry(props) {
    const [expanded, setExpanded] = React.useState<boolean>(false);
    const [copySuccess, setCopySuccess] = React.useState<boolean>(false);

    const onClick = (): void => {
        setExpanded(!expanded);
        setCopySuccess(false);
    };

    const onCopy = (): void => {
        navigator.clipboard.writeText(JSON.stringify(props.message.data))
            .then(() => setCopySuccess(true))
            .catch(console.error);
    };

    return (
        <>
            <div className={styles.container} onClick={onClick}>
                <div
                    className={cn(styles.type, {
                        [styles.typeSent]: props.message.type === 'sent',
                        [styles.typeRecieved]: props.message.type === 'recieved',
                        [styles.typeEvent]: props.message.type === 'event'
                    })}
                >
                    {props.message.data[0]}
                </div>
                <div className={styles.data}>{JSON.stringify(props.message.data.slice(1))}</div>
            </div>
            {expanded && (
                <>
                    <div className={styles.expandedTopBar}>
                        <button type="button" className={cn('btn btn-sm', { 'btn-secondary': !copySuccess, 'btn-success': copySuccess })} onClick={onCopy}>
                            Copy Message
                        </button>
                    </div>
                    <JSONTree data={props.message.data} theme={'bright'} hideRoot />
                </>
            )}
        </>
    );
});
