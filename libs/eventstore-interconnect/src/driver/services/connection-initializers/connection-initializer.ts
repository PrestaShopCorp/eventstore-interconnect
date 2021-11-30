import { Client } from '@eventstore/db-client/dist/Client';
import { EventStoreNodeConnection } from 'node-eventstore-client';

export const CONNECTION_INITIALIZER = Symbol();

export interface ConnectionInitializer {
  getConnectedClient(): Client | EventStoreNodeConnection;
}
