import {EventStoreCqrsModule} from 'nestjs-geteventstore-1.6.4';
import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import SentryFacebookConfig from './sentry-facebook';
import EventstoreConfig from './eventstore';
import EventbusConfig from './eventbus';
import {EventHandlersEventbus} from './events/handlers';
import { eventMapper } from './event-mapper-eventbus';
import {persistentSubscriptionsEventbus} from './subscriptions';
import {EventstoreSecondaryConnectionModule} from './secondary-connection.module';
import { SentryModule } from '@ntegral/nestjs-sentry';

const randomId = 'nanoid(11)';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        SentryFacebookConfig,
        EventstoreConfig, // eventstore Facebook
        EventbusConfig, // eventstore Eventbus
      ],
    }),
    SentryModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService): Promise<any> =>
        config.get('sentry-facebook'),
      inject: [ConfigService],
    }),
    EventStoreCqrsModule.registerAsync(
      {
        useFactory: async (config: ConfigService): Promise<any> =>
          // We connect to the eventbus eventstore, not the facebook one!
          ({ ...config.get('eventbus'), tcpConnectionName: `connection-facebook-subscription-eventbus-${randomId}` }),
        inject: [ConfigService],
      },
      {
        eventMapper,
        subscriptions: {
          persistent: persistentSubscriptionsEventbus
        },
      },
    ),
    EventstoreSecondaryConnectionModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService): Promise<any> => ({ configuration: {
        ...config.get('eventstore'), tcpConnectionName: `connection-facebook-subscription-eventbus-${randomId}`,
      } }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    ...EventHandlersEventbus,
  ],
})
export class SubscriptionsEventbusModule {}
