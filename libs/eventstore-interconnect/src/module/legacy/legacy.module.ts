import { DynamicModule, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventStoreService } from './event-store.service';
import { EVENT_STORE, EVENT_STORE_SERVICE_CONFIG } from './constants';
import { EventStore } from './event-store';
import { IEventStoreBusConfig } from 'nestjs-geteventstore-legacy';
import { ConnectionConfiguration } from '../../interconnection-configuration';
import { LoggerModule } from 'nestjs-pino-stackdriver';

@Module({})
export class LegacyModule {
  public static register(
    connectionConf: ConnectionConfiguration,
    busConf: IEventStoreBusConfig,
  ): DynamicModule {
    return {
      module: LegacyModule,
      imports: [CqrsModule, LoggerModule],
      exports: [CqrsModule],
      providers: [
        EventStoreService,
        {
          provide: EVENT_STORE_SERVICE_CONFIG,
          useValue: busConf,
        },
        {
          provide: EVENT_STORE,
          useValue: new EventStore(connectionConf),
        },
      ],
    };
  }
}
