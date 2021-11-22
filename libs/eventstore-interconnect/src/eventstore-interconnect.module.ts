import { DynamicModule, Module } from '@nestjs/common';
import { Logger } from 'nestjs-pino-stackdriver';
import { InterconnectionConfiguration } from './interconnection-configuration';
import { ContextModule } from 'nestjs-context';
import EventstoreInterconnectModuleHelper from './helpers/module-helpers/eventstore-interconnect.module.helper';
import { DriverModule } from './driver/driver.module';
import { DefaultSafetyNetService, SAFETY_NET } from './safety-net';

@Module({})
export class EventstoreInterconnectModule {
  public static connectToSrcAndDest(
    configuration: InterconnectionConfiguration,
    allowedEvents?: any,
  ): DynamicModule {
    const eventStoreModuleSource: DynamicModule =
      EventstoreInterconnectModuleHelper.getSourceEventStoreModule(
        configuration,
        allowedEvents,
      );

    return {
      module: EventstoreInterconnectModule,
      imports: [ContextModule.register(), eventStoreModuleSource],
      providers: [
        Logger,
        {
          provide: SAFETY_NET,
          useClass: DefaultSafetyNetService,
        },
      ],
      exports: [eventStoreModuleSource, SAFETY_NET],
    };
  }
}
