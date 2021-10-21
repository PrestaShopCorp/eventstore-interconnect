import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
  ],
  providers: [Logger, ...EventHandlersEventbus],
})
export class SubscriptionsEventbusModule {}
