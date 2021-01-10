const api = ((window as unknown) as {
    api: {
        dataRecieved: (data: Uint8Array) => void,
        dataSent: (data: Uint8Array) => void
    }
}).api;

let orgOnMessage: ((this: any, ev: MessageEvent) => any) | null;
const onMessage = (e: MessageEvent): void => {
    api.dataRecieved(new Uint8Array(e.data));
    orgOnMessage?.call(orgOnMessage, e);
};

const orgSend = WebSocket.prototype.send;
WebSocket.prototype.send = function(data: Uint8Array): void {
    if (!orgOnMessage) {
        orgOnMessage = this.onmessage;
        this.onmessage = onMessage;
    }

    api.dataSent(data);
    orgSend.call(this, data);
};
