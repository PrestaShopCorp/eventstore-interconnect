import { ProtocolConf } from '../../interconnection-configuration';

export class NoLegacyConnectionError extends Error {
  constructor(message: string, tcpEndPoint: ProtocolConf) {
    super(
      `Connection to TCP eventstore failed while trying to connect to ${tcpEndPoint.host}:${tcpEndPoint.port}. Details: ${message}`,
    );
  }
}
