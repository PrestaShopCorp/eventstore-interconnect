import { EventStoreNodeConnection } from 'node-eventstore-client';
import { ConnectionConfiguration } from '../model';
import { Client } from '@eventstore/db-client/dist/Client';

export const EVENTSTORE_CONNECTION_GUARD = Symbol();

export interface ConnectionGuard {
  startConnectionLinkPinger(
    connection: EventStoreNodeConnection | Client,
    connectionConfiguration?: ConnectionConfiguration,
  ): Promise<void>;
}
