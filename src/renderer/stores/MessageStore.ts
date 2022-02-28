import * as crypto from 'crypto';
import { action, makeObservable, observable } from 'mobx';
import { decode } from 'msgpack-lite';

export interface Message {
    data: [string, ...any];
    binary: Uint8Array;
    type: 'sent' | 'recieved' | 'event';
    key: string;
}

class MessageStore {

    public messages: Message[] = [];

    private messageBuffer: Message[] = [];
    private lastMessageUpdate = 0;

    private secondToLastBytes: number[] = [];
    private lastBytes: number[] = [];

    constructor() {
        makeObservable(this, {
            messages: observable.shallow,
            updateMessages: action,
            clearAll: action
        });

        setInterval(() => {
            if (performance.now() - this.lastMessageUpdate >= 125) {
                this.updateMessages();
            }
        }, 250);
    }

    public addMessage(data: Uint8Array): void {
        const type = data[0] === 0 ? 'recieved' : (data[0] === 1 ? 'sent' : 'event');
        data = data.slice(1);

        this.messageBuffer.push({
            data: decode(data) as [string, ...any],
            binary: data.slice(1),
            type,
            key: crypto.createHash('md5').update(Buffer.concat([data.subarray(0, 20), crypto.randomBytes(4)])).digest('hex').substring(0, 8)
        });

        if (performance.now() - this.lastMessageUpdate >= 125) {
            this.updateMessages();
        }

        if (type === 'sent') {
            this.secondToLastBytes.push(data[data.length - 2]);
            this.lastBytes.push(data[data.length - 1]);
        }
    }

    public updateMessages(): void {
        this.messages.push(...this.messageBuffer);
        this.messageBuffer = [];
        this.lastMessageUpdate = performance.now();
    }

    public clearAll(): void {
        this.messageBuffer = [];
        this.lastMessageUpdate = 0;

        this.messages = [];
        this.secondToLastBytes = [];
        this.lastBytes = [];
    }

    public getLastBytesSequence(length: number): [number[], number[]] {
        if (this.lastBytes.length === 0) {
            return [[], []];
        }

        length = Math.min(length, this.lastBytes.length);

        const res: [number[], number[]] = [[this.secondToLastBytes[0]], [this.lastBytes[0]]];

        for (let i = 1; i < length; i++) {
            let secondToLastByte = this.secondToLastBytes[i];
            if (this.secondToLastBytes[i - 1] >= secondToLastByte) {
                secondToLastByte += 16;
            }
            res[0].push(secondToLastByte - this.secondToLastBytes[i - 1]);

            let lastByte = this.lastBytes[i];
            if (this.lastBytes[i - 1] >= lastByte) {
                lastByte += 16;
            }
            res[1].push(lastByte - this.lastBytes[i - 1]);
        }

        return res;
    }

}

export const messageStore = new MessageStore();
