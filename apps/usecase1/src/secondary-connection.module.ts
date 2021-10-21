import { DynamicModule, Module } from '@nestjs/common';
import { IEventStoreConfig } from 'nestjs-geteventstore-4.0.1';

import { SecondaryConnectionService } from './secondary-connection.service';

@Module({
  providers: [SecondaryConnectionService],
  exports: [SecondaryConnectionService],
})
export class EventstoreSecondaryConnectionModule {
  static forRoot(settings: IEventStoreConfig): DynamicModule {
    return {
      module: EventstoreSecondaryConnectionModule,
      imports: [],
      providers: [
        {
          provide: SecondaryConnectionService,
          useFactory: () => new SecondaryConnectionService(settings),
        },
      ],
      exports: [SecondaryConnectionService],
    };
  }

  static forRootAsync(settings: any): DynamicModule {
    return {
      module: EventstoreSecondaryConnectionModule,
      imports: [],
      providers: [
        {
          provide: SecondaryConnectionService,
          useFactory: async (...args) => {
            const { configuration } = await settings.useFactory(...args);
            return new SecondaryConnectionService(configuration);
          },
          inject: [...settings.inject],
        },
      ],
      exports: [SecondaryConnectionService],
    };
  }
}
