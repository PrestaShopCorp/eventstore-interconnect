import { registerAs } from '@nestjs/config';
import { IEventStoreConfig } from 'nestjs-geteventstore-4.0.1';
import { Logger } from '@nestjs/common';

const onTcpDisconnected = () => {
  Logger.error(`Connection to eventbus eventstore lost`);
  process.exit(137);
};

const randomId = "nanoid(11)";

export default registerAs(
  'eventbus',
  () =>
    ({
      credentials: {
        username: process.env.EVENTSTORE_EVENTBUS_CREDENTIALS_USERNAME,
        password: process.env.EVENTSTORE_EVENTBUS_CREDENTIALS_PASSWORD,
      },
      tcp: {
        host: process.env.EVENTSTORE_EVENTBUS_TCP_HOST || 'localhost',
        port: process.env.EVENTSTORE_EVENTBUS_TCP_PORT || 11130,
      },
      http: {
        host: process.env.EVENTSTORE_EVENTBUS_HTTP_HOST || 'localhost',
        port: process.env.EVENTSTORE_EVENTBUS_HTTP_PORT || 21130,
      },
      tcpConnectionName: `connection-facebook-eventbus-copytor-${randomId}`,
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
        heartbeatInterval: 5_000,
        heartbeatTimeout: 2_000,
      },
    } as IEventStoreConfig),
);
