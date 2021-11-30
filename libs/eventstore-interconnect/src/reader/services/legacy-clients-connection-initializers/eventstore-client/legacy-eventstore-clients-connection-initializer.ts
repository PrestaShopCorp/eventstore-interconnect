import { EventStoreNodeConnection } from 'node-eventstore-client';

export const LEGACY_EVENTSTORE_CLIENT_CONNECTION_INITIALIZER = Symbol();

export interface LegacyEventstoreClientsConnectionInitializer {
  initClient(): Promise<void>;
  getEventstoreConnectedClient(): EventStoreNodeConnection;
}
