import { IEventStoreBusConfig } from 'nestjs-geteventstore-legacy';
import { IEventStoreSubsystems } from 'nestjs-geteventstore-next';

export interface InterconnectionConfiguration {
  source: ConnectionConfiguration;
  destination: ConnectionConfiguration;
  eventStoreSubsystems?: IEventStoreSubsystems;
  eventStoreBusConfig?: IEventStoreBusConfig;
}

export interface ConnectionConfiguration {
  credentials: Credentials;
  tcp?: ProtocolConf;
  tcpConnectionName?: string;
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
