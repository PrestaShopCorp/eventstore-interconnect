import { IEventStoreServiceConfig } from 'nestjs-geteventstore-legacy';
import { IEventStoreSubsystems } from 'nestjs-geteventstore-next';

export interface InterconnectionConfiguration {
  source: ConnectionConfiguration;
  destination: ConnectionConfiguration;
  eventStoreSubsystems?: IEventStoreSubsystems;
  eventStoreServiceConfig?: IEventStoreServiceConfig;
}

export interface ConnectionConfiguration {
  credentials: Credentials;
  tcp?: ProtocolConf;
  http?: ProtocolConf;
  connectionString?: string;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface ProtocolConf {
  host: string;
  port: number;
}
