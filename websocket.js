class WebsocketService {
    websocket;
    user;
    constructor() {
    }

    init(id, channel, message, error, close) {
        var scope = this;
        this.user = this.register(id, channel);
        this.websocket = new WebSocket(`ws://localhost:3001`);

        this.websocket.onopen = function (evt) {
            console.log('CONNECTED');
            scope.websocket.send(JSON.stringify(scope.user));
        };

        this.websocket.onclose = close;
        this.websocket.onmessage = function (evt){
            try {
                var response = JSON.parse(evt.data);
                console.log(response);
                message(response);
            } catch (e){}
        };

        this.websocket.onerror = error;
    }

    register(id, channel) {
        this.user = {
            type: "register",
            body: {
                channel: channel,
                id: id
            }
        }

        return this.user;
    }

    send(message) {
        console.log(this.user);
        var data = {
            type: "message",
            body: {
                from: this.user.body.id,
                channel: this.user.body.channel,
                message: message
            }
        }

        this.websocket.send(JSON.stringify(data));
    }
}