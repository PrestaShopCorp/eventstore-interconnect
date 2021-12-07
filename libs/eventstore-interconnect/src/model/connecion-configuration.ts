import { Credentials, ProtocolConf } from './interconnection-configuration';

export interface ConnectionConfiguration {
  credentials: Credentials;
  tcp?: ProtocolConf;
  tcpConnectionName?: string;
  http?: ProtocolConf;
  connectionString?: string;
}
