import * as crypto from 'crypto';
import { action, makeObservable, observable } from 'mobx';
import { decode } from 'msgpack-lite';

export interface Message {
    data: [string, ...any],
    sent: boolean,
    key: string
}

class MessageStore {

    public messages: Message[];

    constructor() {
        makeObservable(this, {
            messages: observable,
            addMessage: action,
            clearAll: action
        });

        this.messages = [];
    }

    public addMessage(data: Uint8Array, sent: boolean): void {
        const json = decode(data) as [string, ...any];

        this.messages.push({
            data: json,
            sent,
            key: crypto.createHash('md5').update(Buffer.concat([data.subarray(0, 50), crypto.randomBytes(4)])).digest('hex').substr(0, 8)
        });
    }

    public clearAll(): void {
        this.messages = [];
    }

}

export const messageStore = new MessageStore();
