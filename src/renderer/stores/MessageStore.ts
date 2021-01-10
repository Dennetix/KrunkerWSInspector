import * as crypto from 'crypto';
import { action, makeObservable, observable } from 'mobx';

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

    public addMessage(data: [string, ...any], sent: boolean): void {
        this.messages.push({
            key: crypto.createHash('md5').update(JSON.stringify(data) + crypto.randomBytes(4).toString('hex')).digest('hex').substr(0, 8),
            data,
            sent
        });
    }

    public clearAll(): void {
        this.messages = [];
    }

}

export const messageStore = new MessageStore();
