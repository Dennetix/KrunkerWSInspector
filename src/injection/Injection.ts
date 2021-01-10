import { decode } from 'msgpack-lite';

const api = ((window as unknown) as {
    api: {
        dataRecieved: (data: [string, ...any]) => void,
        dataSent: (data: [string, ...any], lastBytes: [number, number]) => void
    }
}).api;

let orgOnMessage: ((this: any, ev: MessageEvent) => any) | null;
const onMessage = (e: MessageEvent): void => {
    api.dataRecieved(decode(new Uint8Array(e.data)));
    orgOnMessage?.call(orgOnMessage, e);
};

const orgSend = WebSocket.prototype.send;
WebSocket.prototype.send = function(data: Uint8Array): void {
    if (!orgOnMessage) {
        orgOnMessage = this.onmessage;
        this.onmessage = onMessage;
    }

    const lastBytes: [number, number] = [
        data[data.length - 2],
        data[data.length - 1]
    ];

    api.dataSent(decode(data), lastBytes);
    orgSend.call(this, data);
};
