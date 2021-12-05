import { DynamicModule, Module, Type } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import {
  EVENTSTORE_CONNECTION_GUARD,
  GrpcConnectionInitializerService,
  InterconnectionConfiguration,
  isLegacyConf,
  NextConnectionGuardService,
  SafetyNet,
  TCP_EVENTSTORE_CLIENT_CONNECTION_INITIALIZER,
  TCPEventStoreConnectionInitializerService,
} from '..';
import { DRIVER } from './driver';
import { HttpDriverService } from './services/http-driver/http-driver.service';
import { GrpcDriverService } from './services/grpc-driver/grpc-driver.service';
import {
  CONNECTION_CONFIGURATION,
  CREDENTIALS,
  EVENTSTORE_DB_CLIENT,
  INTERCONNECT_CONFIGURATION,
} from '../constants';
import { SafetyNetModule } from '../safety-net';
import { LegacyConnectionGuardService } from '../connections-guards';
import { EventStoreDBClient } from '@eventstore/db-client';
import { GRPC_CONNECTION_INITIALIZER } from '../connections-initializers';

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
        provide: CONNECTION_CONFIGURATION,
        useValue: configuration.destination,
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
        provide: GRPC_CONNECTION_INITIALIZER,
        useClass: GrpcConnectionInitializerService,
      },
      {
        provide: EVENTSTORE_DB_CLIENT,
        useValue: EventStoreDBClient,
      },
      {
        provide: EVENTSTORE_CONNECTION_GUARD,
        useClass: NextConnectionGuardService,
      },
    ];
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
        provide: TCP_EVENTSTORE_CLIENT_CONNECTION_INITIALIZER,
        useClass: TCPEventStoreConnectionInitializerService,
      },
      {
        provide: EVENTSTORE_CONNECTION_GUARD,
        useClass: LegacyConnectionGuardService,
      },
    ];
  }
}
