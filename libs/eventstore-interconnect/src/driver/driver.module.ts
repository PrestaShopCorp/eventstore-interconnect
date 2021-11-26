import { DynamicModule, Module, Type } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import {
  CONNECTION_INITIALIZER,
  InterconnectionConfiguration,
  isLegacyConf,
  SafetyNet,
} from '..';
import { DRIVER } from './driver';
import { HttpDriverService } from './services/http-driver/http-driver.service';
import { GrpcDriverService } from './services/grpc-driver/grpc-driver.service';
import { Client } from '@eventstore/db-client/dist/Client';
import { CREDENTIALS, INTERCONNECT_CONFIGURATION } from '../constants';
import { NoGrpcConnectionError } from './errors/no-grpc-connection.error';
import { SafetyNetModule } from '../safety-net';
import { NextConnectionInitializerService } from './services/connection-initializers/next-connection-initializer/next-connection-initializer.service';
import { LegacyConnectionInitializerService } from './services/connection-initializers/legacy-connection-initializer/legacy-connection-initializer.service';

@Module({})
export class DriverModule {
  public static get(
    configuration: InterconnectionConfiguration,
    customSafetyNetStrategy?: Type<SafetyNet>,
  ): DynamicModule {
    const driverProviders: Provider[] = isLegacyConf(configuration.destination)
      ? this.getLegacyEventStoreDriver(configuration)
      : this.getNextEventStoreDriver(configuration);

    return {
      module: DriverModule,
      imports: [SafetyNetModule.use(customSafetyNetStrategy)],
      providers: [...driverProviders],
      exports: [...driverProviders, SafetyNetModule],
    };
  }

  private static getNextEventStoreDriver(
    configuration: InterconnectionConfiguration,
  ): Provider[] {
    return [
      {
        provide: INTERCONNECT_CONFIGURATION,
        useValue: configuration,
      },
      {
        provide: DRIVER,
        useClass: GrpcDriverService,
      },
      {
        provide: CREDENTIALS,
        useValue: configuration.destination.credentials,
      },
      {
        provide: CONNECTION_INITIALIZER,
        useClass: NextConnectionInitializerService,
      },
    ];
  }

  public static async checkNextConnectionStatus(
    eventStoreConnector: Client,
    connectionString: string,
  ): Promise<void> {
    try {
      await eventStoreConnector.getStreamMetadata('$all');
    } catch (errMessage) {
      throw new NoGrpcConnectionError(errMessage, connectionString);
    }
  }

  private static getLegacyEventStoreDriver(
    configuration: InterconnectionConfiguration,
  ): Provider[] {
    return [
      {
        provide: DRIVER,
        useClass: HttpDriverService,
      },
      {
        provide: CREDENTIALS,
        useValue: configuration.destination.credentials,
      },
      {
        provide: INTERCONNECT_CONFIGURATION,
        useValue: configuration,
      },
      {
        provide: CONNECTION_INITIALIZER,
        useClass: LegacyConnectionInitializerService,
      },
    ];
  }
}
