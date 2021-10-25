import { DynamicModule, Module } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { HTTPClient } from 'geteventstore-promise';
import { ConnectionConfiguration, InterconnectionConfiguration } from '..';
import { DRIVER, GrpcDriverService, HttpDriverService } from './service';
import { ConfigurationsHelper as legal } from '../module/configurations.helper';

@Module({})
export class DriverModule {
  public static get(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    const driverProviders: Provider[] = legal.isLegacyConf(
      configuration.destination,
    )
      ? this.getLegacyEventStoreDriver(configuration.destination)
      : this.getNextEventStoreDriver();

    return {
      module: DriverModule,
      providers: [...driverProviders],
      exports: [...driverProviders],
    };
  }

  private static getNextEventStoreDriver() {
    return [
      {
        provide: DRIVER,
        useClass: GrpcDriverService,
      },
      // {
      //   provide: DRIVER,
      //   useClass: GrpcDriverService,
      // },
    ];
  }

  private static getLegacyEventStoreDriver(
    configuration: ConnectionConfiguration,
  ) {
    return [
      {
        provide: DRIVER,
        useClass: HttpDriverService,
      },
      {
        provide: HTTPClient,
        useValue: new HTTPClient({
          hostname: configuration.http.host,
          port: configuration.http.port,
          credentials: configuration.credentials,
        }),
      },
    ];
  }
}
