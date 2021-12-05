import { Inject, Injectable } from '@nestjs/common';
import * as geteventstorePromise from 'geteventstore-promise';
import { HTTPClient } from 'geteventstore-promise';
import {
  ConnectionConfiguration,
  ProtocolConf,
} from '../../../interconnection-configuration';
import { CONNECTION_CONFIGURATION } from '../../../constants';
import { NoLegacyConnectionError } from '../../../reader/errors/no-legacy-connection.error';
import { Logger } from 'nestjs-pino-stackdriver';
import { HttpClientsConnectionInitializer } from './http-clients-connection-initializer';

@Injectable()
export class HttpClientConnectionInitializerService
  implements HttpClientsConnectionInitializer
{
  private httpClient: HTTPClient;

  constructor(
    @Inject(CONNECTION_CONFIGURATION)
    private readonly configuration: ConnectionConfiguration,
    private readonly logger: Logger,
  ) {}

  public async init(): Promise<void> {
    const tcpEndPoint = {
      host: this.configuration.tcp.host,
      port: this.configuration.tcp.port,
    };

    this.httpClient = new geteventstorePromise.HTTPClient({
      hostname: this.configuration.http.host.replace(/^https?:\/\//, ''),
      port: this.configuration.http.port,
      credentials: {
        username: this.configuration.credentials.username,
        password: this.configuration.credentials.password,
      },
    });
    await this.checkLegacyConnectionStatus(tcpEndPoint);
  }

  public async checkLegacyConnectionStatus(
    tcpEndPoint: ProtocolConf,
  ): Promise<void> {
    try {
      await this.httpClient.checkStreamExists('$all');
    } catch (errMessage) {
      throw new NoLegacyConnectionError(errMessage, tcpEndPoint);
    }
  }

  public getHttpClient(): HTTPClient {
    return this.httpClient;
  }
}
