import { IEventStoreSubsystems } from './eventstore-subsystem';
import { ConnectionConfiguration } from './connecion-configuration';
import { IEventStoreBusConfig } from './v5/eventstore-bus-config';

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
