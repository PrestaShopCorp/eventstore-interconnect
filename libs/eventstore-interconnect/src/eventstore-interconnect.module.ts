import { DynamicModule, Module, Type } from '@nestjs/common';
import { InterconnectionConfiguration } from './interconnection-configuration';
import { ContextModule } from 'nestjs-context';
import { ReaderModule } from './reader';
import { isLegacyConf } from './helpers';
import { SafetyNet } from './safety-net';

@Module({})
export class EventstoreInterconnectModule {
  public static connectToSrcAndDest(
    configuration: InterconnectionConfiguration,
    allowedEvents: any,
    customStrategy?: Type<SafetyNet>,
  ): DynamicModule {
    const readerModule: DynamicModule = isLegacyConf(configuration.source)
      ? ReaderModule.get(configuration, allowedEvents, customStrategy)
      : ReaderModule.get(configuration, allowedEvents, customStrategy);

    return {
      module: EventstoreInterconnectModule,
      imports: [ContextModule.register(), readerModule],
      exports: [readerModule],
    };
  }
}
