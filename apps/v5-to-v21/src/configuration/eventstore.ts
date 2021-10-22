import { registerAs } from '@nestjs/config';
import { EventStoreConnectionConfig } from 'nestjs-geteventstore-next';

export const destEventStoreConfiguration: EventStoreConnectionConfig = {
  connectionSettings: {
    connectionString:
      process.env.CONNECTION_STRING || 'esdb://localhost:2113?tls=false',
  },
  defaultUserCredentials: {
    username: process.env.EVENTSTORE_CREDENTIALS_USERNAME || 'admin',
    password: process.env.EVENTSTORE_CREDENTIALS_PASSWORD || 'changeit',
  },
};

export default registerAs('eventstore', () => destEventStoreConfiguration);
