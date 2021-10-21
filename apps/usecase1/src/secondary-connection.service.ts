import { Injectable } from '@nestjs/common';
import * as EventStore from 'geteventstore-promise';
import { IEventStoreConfig } from 'nestjs-geteventstore-4.0.1';

@Injectable()
export class SecondaryConnectionService {
  private client: EventStore.TCPClient;

  constructor(private readonly settings: IEventStoreConfig) {
    this.client = null;
    this.getClient();
  }

  getClient(): EventStore.TCPClient {
    if (!this.client) {
      this.client = new EventStore.TCPClient({
        hostname: this.settings.tcp.host,
        port: this.settings.tcp.port,
        credentials: {
          username: this.settings.credentials.username,
          password: this.settings.credentials.password,
        },
      });
    }
    return this.client;
  }
}
