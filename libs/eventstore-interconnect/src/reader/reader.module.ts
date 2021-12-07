import { DynamicModule, Logger, Module, Type } from '@nestjs/common';
import { InterconnectionConfiguration } from '../model';
import { READER } from './services/reader';
import { isLegacyConf } from '../helpers';
import { HttpReaderService } from './services/http-reader/http-reader.service';
import { GrpcReaderService } from './services/grpc-reader/grpc-reader.service';
import { SUBSCRIPTIONS } from './services/constants';
import {
  ALLOWED_EVENTS,
  CONNECTION_CONFIGURATION,
  CREDENTIALS,
  EVENTSTORE_DB_CLIENT,
} from '../constants';
import {
  LegacyEventsValidatorService,
  NextEventsValidatorService,
  VALIDATOR,
} from '../validator';
import { DriverModule } from '../driver';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { EVENT_HANDLER, EventHandlerService } from '../event-handler';
import {
  FORMATTER,
  LegacyEventFormatterService,
  NextEventFormatterService,
} from '../formatter';
import { SafetyNet } from '../safety-net';
import { EventStoreDBClient } from '@eventstore/db-client';
import {
  GRPC_CONNECTION_INITIALIZER,
  GrpcConnectionInitializerService,
  HTTP_CLIENT_CONNECTION_INITIALIZER,
  HttpClientConnectionInitializerService,
  TCP_EVENTSTORE_CLIENT_CONNECTION_INITIALIZER,
  TCPEventStoreConnectionInitializerService,
} from '../connections-initializers';
import {
  EVENTSTORE_CONNECTION_GUARD,
  LegacyConnectionGuardService,
  NextConnectionGuardService,
} from '../connections-guards';

@Module({})
export class ReaderModule {
  public static get(
    configuration: InterconnectionConfiguration,
    allowedEvents?: any,
    customStrategy?: Type<SafetyNet>,
  ): DynamicModule {
    const providersForReader: Provider[] = isLegacyConf(configuration.source)
      ? ReaderModule.getLegacyReaderProviders(configuration)
      : ReaderModule.getNextReaderProviders(configuration);
    return {
      module: ReaderModule,
      imports: [DriverModule.get(configuration, customStrategy)],
      exports: [DriverModule],
      providers: [
        ...providersForReader,
        {
          provide: ALLOWED_EVENTS,
          useValue: allowedEvents ?? {},
        },
        {
          provide: CONNECTION_CONFIGURATION,
          useValue: configuration.source,
        },
        {
          provide: EVENT_HANDLER,
          useClass: EventHandlerService,
        },
        Logger,
      ],
    };
  }

  private static getLegacyReaderProviders(
    configuration: InterconnectionConfiguration,
  ): Provider[] {
    return [
      {
        provide: READER,
        useClass: HttpReaderService,
      },
      {
        provide: SUBSCRIPTIONS,
        useValue: configuration.eventStoreBusConfig.subscriptions.persistent,
      },
      {
        provide: VALIDATOR,
        useClass: LegacyEventsValidatorService,
      },
      {
        provide: FORMATTER,
        useClass: LegacyEventFormatterService,
      },
      {
        provide: TCP_EVENTSTORE_CLIENT_CONNECTION_INITIALIZER,
        useClass: TCPEventStoreConnectionInitializerService,
      },
      {
        provide: HTTP_CLIENT_CONNECTION_INITIALIZER,
        useClass: HttpClientConnectionInitializerService,
      },
      {
        provide: EVENTSTORE_CONNECTION_GUARD,
        useClass: LegacyConnectionGuardService,
      },
    ];
  }

  private static getNextReaderProviders(
    configuration: InterconnectionConfiguration,
  ): Provider[] {
    return [
      {
        provide: CREDENTIALS,
        useValue: configuration.source.credentials,
      },
      {
        provide: READER,
        useClass: GrpcReaderService,
      },
      {
        provide: EVENTSTORE_DB_CLIENT,
        useValue: EventStoreDBClient,
      },
      {
        provide: GRPC_CONNECTION_INITIALIZER,
        useClass: GrpcConnectionInitializerService,
      },
      {
        provide: SUBSCRIPTIONS,
        useValue: configuration.eventStoreSubsystems.subscriptions.persistent,
      },
      {
        provide: VALIDATOR,
        useClass: NextEventsValidatorService,
      },
      {
        provide: FORMATTER,
        useClass: NextEventFormatterService,
      },
      {
        provide: EVENTSTORE_CONNECTION_GUARD,
        useClass: NextConnectionGuardService,
      },
    ];
  }
}
