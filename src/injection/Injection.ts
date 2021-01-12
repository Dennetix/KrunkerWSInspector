import { encode } from 'msgpack-lite';

const _send = WebSocket.prototype.send;

let ws: WebSocket;
const open = (): void => {
    ws = new WebSocket('ws://localhost:1337/ws');
    ws.onclose = open;
};
open();

const addEventListeners = (): void => {
    const sendKeyEvent = (e: KeyboardEvent): void => {
        const event = {
            key: e.key,
            which: e.which,
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey,
            shiftKey: e.shiftKey
        };
        const msg = encode([e.type, event]);
        _send.call(ws, new Uint8Array([2, ...msg]));
    };

    document.addEventListener('keydown', sendKeyEvent);
    document.addEventListener('keyup', sendKeyEvent);

    const canvases = document.getElementsByTagName('canvas');
    const canvas = canvases[canvases.length - 1];

    const sendMouseEvent = (e: MouseEvent): void => {
        const event = {
            button: e.button,
            buttons: e.buttons,
            x: e.x,
            y: e.y,
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey,
            shiftKey: e.shiftKey
        };
        const msg = encode([e.type, event]);
        _send.call(ws, new Uint8Array([2, ...msg]));
    };

    canvas.addEventListener('mousedown', sendMouseEvent);
    canvas.addEventListener('mouseup', sendMouseEvent);

    canvas.addEventListener('mousemove', (e) => {
        if (ws.readyState === WebSocket.OPEN) {
            const event = {
                movementX: e.movementX,
                movementY: e.movementY,
                x: e.x,
                y: e.y,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey,
                shiftKey: e.shiftKey
            };
            const msg = encode(['mousemove', event]);
            _send.call(ws, new Uint8Array([2, ...msg]));
        }
    });
};

Object.defineProperty(WebSocket.prototype, 'onmessage', {
    set(this: WebSocket, handler: (this: WebSocket, e: MessageEvent) => void) {
        this.addEventListener('message', (e) => {
            if (ws.readyState === WebSocket.OPEN) {
                _send.call(ws, new Uint8Array([0, ...(new Uint8Array(e.data))]));
            }
            handler.call(this, e);
        });

        addEventListeners();
    }
});

WebSocket.prototype.send = function(data: Uint8Array): void {
    if (ws.readyState === WebSocket.OPEN) {
        _send.call(ws, new Uint8Array([1, ...data]));
    }
    _send.call(this, data);
};
