import { DynamicModule, Module, Type } from '@nestjs/common';
import { InterconnectionConfiguration } from '../interconnection-configuration';
import { READER } from './services/reader';
import { isLegacyConf } from '../helpers';
import { HttpReaderService } from './services/http-reader/http-reader.service';
import { GrpcReaderService } from './services/grpc-reader/grpc-reader.service';
import { SUBSCRIPTIONS } from './services/constants';
import { Logger } from 'nestjs-pino-stackdriver';
import {
  ALLOWED_EVENTS,
  CREDENTIALS,
  INTERCONNECT_CONFIGURATION,
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
          provide: INTERCONNECT_CONFIGURATION,
          useValue: configuration,
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
        provide: CREDENTIALS,
        useValue: configuration.source.credentials,
      },
      {
        provide: VALIDATOR,
        useClass: LegacyEventsValidatorService,
      },
      {
        provide: FORMATTER,
        useClass: LegacyEventFormatterService,
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
    ];
  }
}
