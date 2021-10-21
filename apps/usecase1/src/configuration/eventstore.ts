import { registerAs } from '@nestjs/config';
import { IEventStoreConfig } from 'nestjs-geteventstore-1.6.4';
import { nanoid } from 'nanoid';
import { Logger } from '@nestjs/common';

const onTcpDisconnected = () => {
  Logger.error(`Connection to facebook eventstore lost`);
  process.exit(137);
};

const randomId = nanoid(11);

export const eventStoreConfiguration: IEventStoreConfig = {
  credentials: {
    username: process.env.EVENTSTORE_CREDENTIALS_USERNAME || 'admin',
    password: process.env.EVENTSTORE_CREDENTIALS_PASSWORD || 'changeit',
  },
  tcp: {
    host: process.env.EVENTSTORE_TCP_HOST || 'localhost',
    port: +process.env.EVENTSTORE_TCP_PORT || 1113,
  },
  http: {
    host: process.env.EVENTSTORE_HTTP_HOST || 'localhost',
    port: +process.env.EVENTSTORE_HTTP_PORT || 2113,
  },
  tcpConnectionName: `connection-facebook-processor-event-handler-and-saga-${randomId}`,
  onTcpDisconnected,
  options: {
    /*
    // Buffer events if remote is slow or not available
    maxQueueSize: 100_000,
    maxRetries: 10_000,
    operationTimeout: 5_000,
    operationTimeoutCheckPeriod: 1_000,
    */
    // Fail fast on connect
    clientConnectionTimeout: 2_000,
    failOnNoServerResponse: false,
    // Try to reconnect every 10s for 30mn
    maxReconnections: 200,
    reconnectionDelay: 10_000,
    // Production heartbeat
    heartbeatInterval: 10_000,
    heartbeatTimeout: 3_000,
  },
};

export default registerAs('eventstore', () => eventStoreConfiguration);
