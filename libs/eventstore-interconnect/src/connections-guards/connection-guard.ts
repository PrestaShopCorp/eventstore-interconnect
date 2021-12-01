import { EventStoreNodeConnection } from 'node-eventstore-client';
import { ConnectionConfiguration } from '../interconnection-configuration';

export const EVENTSTORE_CONNECTION_GUARD = Symbol();

export interface ConnectionGuard {
  checkTcpConnection(
    connection: EventStoreNodeConnection,
    connectionConfiguration: ConnectionConfiguration,
  ): Promise<void>;
}
