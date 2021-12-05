import { EventStoreNodeConnection } from 'node-eventstore-client';

export const TCP_EVENTSTORE_CLIENT_CONNECTION_INITIALIZER = Symbol();

export interface TCPEventstoreClientsConnectionInitializer {
  init(): Promise<void>;
  getConnectedClient(): EventStoreNodeConnection;
}
