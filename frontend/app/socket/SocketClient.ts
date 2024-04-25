import io from 'socket.io-client';

export class SocketClient {
    private socket: any = null;
    private position: any = null;


    constructor(token: string) {
        this.getLocationAndConnect(token);
    }

    connectSocket(token: string) {
        this.socket = io(`${process.env.NEXT_PUBLIC_API_URL}`, { auth: { token: token } });
    }

    on(event: any, callback: any) {
        this.socket.on(event, callback);
    }

    emit(event: any, data: any) {
        this.socket.emit(event, data);
    }

    getLocationAndConnect(token: string) {
        if (navigator.geolocation) {
            console.log('geoloc trying')
            navigator.geolocation.getCurrentPosition(
                position => {
                    this.position = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    this.connectSocket(token);
                },
                error => {
                    console.error('Error getting location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }
}