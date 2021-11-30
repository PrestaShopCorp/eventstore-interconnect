import { Inject, Injectable } from '@nestjs/common';
import * as geteventstorePromise from 'geteventstore-promise';
import { HTTPClient } from 'geteventstore-promise';
import {
  InterconnectionConfiguration,
  ProtocolConf,
} from '../../../../interconnection-configuration';
import { INTERCONNECT_CONFIGURATION } from '../../../../constants';
import { NoLegacyConnectionError } from '../../../errors/no-legacy-connection.error';
import { Logger } from 'nestjs-pino-stackdriver';
import { LegacyHttpClientsConnectionInitializer } from './legacy-http-clients-connection-initializer';

@Injectable()
export class LegacyHttpClientConnectionInitializerService
  implements LegacyHttpClientsConnectionInitializer
{
  private httpClient: HTTPClient;

  constructor(
    @Inject(INTERCONNECT_CONFIGURATION)
    private readonly configuration: InterconnectionConfiguration,
    private readonly logger: Logger,
  ) {}

  public async initClient(): Promise<void> {
    const tcpEndPoint = {
      host: this.configuration.source.tcp.host,
      port: this.configuration.source.tcp.port,
    };

    this.httpClient = new geteventstorePromise.HTTPClient({
      hostname: this.configuration.source.http.host.replace(/^https?:\/\//, ''),
      port: this.configuration.source.http.port,
      credentials: {
        username: this.configuration.source.credentials.username,
        password: this.configuration.source.credentials.password,
      },
    });
    this.logger.log(
      'READER : HttpClient connected to legacy eventstore at ' +
        tcpEndPoint.host +
        ':' +
        tcpEndPoint.port,
    );

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
