import { DynamicModule, Module } from '@nestjs/common';
import { Logger } from 'nestjs-pino-stackdriver';
import { InterconnectionConfiguration } from '../../interconnection-configuration';
import { ContextModule } from 'nestjs-context';
import EventstoreInterconnectModuleHelper from './eventstore-interconnect.module.helper';
import { DriverModule } from '../../driver/driver.module';
import { DefaultSafetyNetService, SAFETY_NET } from '../../safety-net';
import { CommandBus } from '@nestjs/cqrs';

@Module({})
export class EventstoreInterconnectModule {
  public static connectToSrcAndDest(
    configuration: InterconnectionConfiguration,
  ): DynamicModule {
    const eventStoreModuleSource: DynamicModule =
      EventstoreInterconnectModuleHelper.getSourceEventStoreModule(
        configuration,
      );

    const eventStoreModuleDest: DynamicModule =
      EventstoreInterconnectModuleHelper.getDestinationEventStoreModule(
        configuration,
      );

    return {
      module: EventstoreInterconnectModule,
      imports: [
        ContextModule.register(),
        eventStoreModuleSource,
        eventStoreModuleDest,

        DriverModule.get(configuration),
      ],
      providers: [
        CommandBus,
        Logger,
        {
          provide: SAFETY_NET,
          useClass: DefaultSafetyNetService,
        },
      ],
      exports: [
        CommandBus,
        eventStoreModuleSource,
        eventStoreModuleDest,
        DriverModule,
        SAFETY_NET,
      ],
    };
  }
}
