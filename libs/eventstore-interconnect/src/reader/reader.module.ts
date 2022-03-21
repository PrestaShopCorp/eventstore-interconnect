import { EventStoreDBClient } from '@eventstore/db-client';
import { DynamicModule, Logger, Module, Type } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import {
  EVENTSTORE_CONNECTION_GUARD,
  LegacyConnectionGuardService,
  NextConnectionGuardService,
} from '../connections-guards';
import {
  GrpcConnectionInitializerService,
  GRPC_CONNECTION_INITIALIZER,
  HttpClientConnectionInitializerService,
  HTTP_CLIENT_CONNECTION_INITIALIZER,
  TCPEventStoreConnectionInitializerService,
  TCP_EVENTSTORE_CLIENT_CONNECTION_INITIALIZER,
} from '../connections-initializers';
import {
  ALLOWED_EVENTS,
  CONNECTION_CONFIGURATION,
  CREDENTIALS,
  EVENTSTORE_DB_CLIENT,
} from '../constants';
import { DriverModule } from '../driver';
import { EventHandlerService, EVENT_HANDLER } from '../event-handler';
import {
  FORMATTER,
  LegacyEventFormatterService,
  NextEventFormatterService,
} from '../formatter';
import { isLegacyConf } from '../helpers';
import { InterconnectionConfiguration } from '../model';
import { SafetyNet } from '../safety-net';
import {
  LegacyEventsValidatorService,
  NextEventsValidatorService,
  VALIDATOR,
} from '../validator';
import { SUBSCRIPTIONS } from './services/constants';
import { GrpcReaderService } from './services/grpc-reader/grpc-reader.service';
import { HttpReaderService } from './services/http-reader/http-reader.service';
import { READER } from './services/reader';

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
      imports: [DriverModule.get(configuration, customStrategy), Logger],
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
