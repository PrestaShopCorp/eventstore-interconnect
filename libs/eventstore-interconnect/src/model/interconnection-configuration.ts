import { IEventStoreBusConfig } from 'nestjs-geteventstore-legacy';
import { IEventStoreSubsystems } from './eventstore-subsystem';
import { ConnectionConfiguration } from './connecion-configuration';

export interface InterconnectionConfiguration {
  source: ConnectionConfiguration;
  destination: ConnectionConfiguration;
  eventStoreSubsystems?: IEventStoreSubsystems;
  eventStoreBusConfig?: IEventStoreBusConfig;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface ProtocolConf {
  host: string;
  port: number;
}
