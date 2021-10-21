import { EventStoreCqrsModule } from 'nestjs-geteventstore-1.6.4';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import SentryFacebookConfig from './configuration/sentry-facebook';
import EventstoreConfig, {
  eventStoreConfiguration,
} from './configuration/eventstore';
import EventbusConfig, {
  eventBusConfiguration,
} from './configuration/eventbus';
import { EventHandlersEventbus } from './events/handlers';
import { eventMapper } from './configuration/event-mapper-eventbus';
import { persistentSubscriptionsEventbus } from './configuration/subscriptions';
import { EventstoreSecondaryConnectionModule } from './secondary-connection.module';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { nanoid } from 'nanoid';
import { EventstoreInterconnectModule } from '@eventstore-interconnect';

const randomId = nanoid(11);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        SentryFacebookConfig,
        EventstoreConfig, // eventstore Facebook≤
        EventbusConfig, // eventstore Eventbus
      ],
    }),
    SentryModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService): Promise<any> =>
        config.get('sentry-facebook'),
      inject: [ConfigService],
    }),
    EventstoreInterconnectModule.connectToSrcAndDest({
      sourceEventStoreConfiguration: {
        connectionConfig: eventBusConfiguration,
        eventStoreBusConfig: {
          eventMapper,
          subscriptions: {
            persistent: persistentSubscriptionsEventbus,
          },
        },
      },
      destEventStoreConfiguration: {
        connectionConfig: eventStoreConfiguration,
        eventStoreBusConfig: {
          eventMapper,
          subscriptions: {
            persistent: persistentSubscriptionsEventbus,
          },
        },
      },
    }),
    EventStoreCqrsModule.register(eventBusConfiguration, {
      eventMapper,
      subscriptions: {
        persistent: persistentSubscriptionsEventbus,
      },
    }),
    EventstoreSecondaryConnectionModule.forRoot(eventStoreConfiguration),
  ],
  providers: [Logger, ...EventHandlersEventbus],
})
export class SubscriptionsEventbusModule {}
