import { DynamicModule, Module } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { HTTPClient } from 'geteventstore-promise';
import { LegacyEventStoreConfiguration, NextEventStoreConfiguration } from '..';
import { DRIVER, GrpcDriverService, HttpDriverService } from './service';
import { ConfigurationsHelper as legal } from '../configurations.helper';

@Module({})
export class DriverModule {
  public static get(
    configuration: LegacyEventStoreConfiguration | NextEventStoreConfiguration,
  ): DynamicModule {
    const driverProviders: Provider[] = legal.isLegacyConf(configuration)
      ? this.getLegacyEventStoreDriver(configuration)
      : [this.getNextEventStoreDriver()];

    return {
      module: DriverModule,
      providers: [...driverProviders],
      exports: [...driverProviders],
    };
  }

  private static getNextEventStoreDriver() {
    return {
      provide: DRIVER,
      useValue: GrpcDriverService,
    };
  }

  private static getLegacyEventStoreDriver(
    configuration: LegacyEventStoreConfiguration,
  ) {
    return [
      {
        provide: DRIVER,
        useValue: HttpDriverService,
      },
      {
        provide: HTTPClient,
        useValue: new HTTPClient({
          hostname: configuration.connectionConfig.http.host,
          port: configuration.connectionConfig.http.port,
          credentials: configuration.connectionConfig.credentials,
        }),
      },
    ];
  }
}
