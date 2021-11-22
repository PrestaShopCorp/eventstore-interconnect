import { DynamicModule } from '@nestjs/common';
import { InterconnectionConfiguration } from '../../interconnection-configuration';
import { isLegacyConf } from '../configurations.helper';
import { ReaderModule } from '../../reader';
import { DriverModule } from '../../driver';
import { LegacyModule } from './legacy.module';
import { NextModule } from './next.module';

export default class EventstoreInterconnectModuleHelper {
  public static getSourceEventStoreModule(
    configuration: InterconnectionConfiguration,
    allowedEvents: any,
  ): DynamicModule {
    return isLegacyConf(configuration.source)
      ? this.getProvidersForLegacyConf(configuration, 'source', allowedEvents)
      : this.getProvidersForNextConf(configuration, 'source', allowedEvents);
  }

  private static getProvidersForLegacyConf(
    configuration: InterconnectionConfiguration,
    entry: 'source' | 'dest',
    allowedEvents?: any,
  ): DynamicModule {
    return entry === 'source'
      ? {
          module: LegacyModule,
          imports: [ReaderModule.get(configuration, allowedEvents)],
          exports: [ReaderModule],
        }
      : {
          module: LegacyModule,
          imports: [DriverModule.get(configuration)],
          exports: [DriverModule],
        };
  }

  private static getProvidersForNextConf(
    configuration: InterconnectionConfiguration,
    entry: 'source' | 'dest',
    allowedEvents?: any,
  ): DynamicModule {
    return entry === 'dest'
      ? {
          module: NextModule,
          imports: [DriverModule.get(configuration)],
          exports: [DriverModule],
        }
      : {
          module: NextModule,
          imports: [ReaderModule.get(configuration, allowedEvents)],
          exports: [ReaderModule],
        };
  }
}
