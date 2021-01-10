const api = ((window as unknown) as {
    api: {
        dataRecieved: (data: Uint8Array) => void,
        dataSent: (data: Uint8Array) => void
    }
}).api;

Object.defineProperty(WebSocket.prototype, 'onmessage', {
    set(this: WebSocket, handler: (this: WebSocket, e: MessageEvent) => void) {
        this.addEventListener('message', (e) => {
            api.dataRecieved(new Uint8Array(e.data));
            handler.call(this, e);
        });
    }
});

const _send = WebSocket.prototype.send;
WebSocket.prototype.send = function(data: Uint8Array): void {
    api.dataSent(data);
    _send.call(this, data);
};
