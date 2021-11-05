import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Reader } from '../reader';
import {
  EVENTSTORE_PERSISTENT_CONNECTION,
  HTTP_CLIENT,
} from './http-connection.constants';
import { Credentials } from '../../../interconnection-configuration';
import { Logger } from 'nestjs-pino-stackdriver';
import { SUBSCRIPTIONS } from '../constants';
import {
  HTTPClient,
  PersistentSubscriptionOptions,
} from 'geteventstore-promise';
import {
  EventStoreNodeConnection,
  ResolvedEvent,
} from 'node-eventstore-client';
import { IEventStorePersistentSubscriptionConfig } from 'nestjs-geteventstore-legacy/dist/interfaces/subscription.interface';
import { CREDENTIALS } from '../../../constants';
import { ValidatorService } from '../validator/validator.service';
import { Driver, DRIVER } from '../../../driver';

@Injectable()
export class HttpReaderService implements Reader, OnModuleInit {
  constructor(
    @Inject(HTTP_CLIENT)
    private readonly client: HTTPClient,
    @Inject(EVENTSTORE_PERSISTENT_CONNECTION)
    private readonly eventStoreConnection: EventStoreNodeConnection,
    @Inject(SUBSCRIPTIONS)
    private readonly subscriptions: IEventStorePersistentSubscriptionConfig[],
    @Inject(CREDENTIALS)
    private readonly credentials: Credentials,
    @Inject(DRIVER)
    private readonly driver: Driver,
    private readonly validatorService: ValidatorService,
    private readonly logger: Logger,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.upsertPersistantSubscription();
  }

  public async upsertPersistantSubscription(): Promise<void> {
    for (const subscription of this.subscriptions) {
      const options: PersistentSubscriptionOptions = {
        ...subscription.options,
        ...{
          resolveLinkTos:
            subscription.options.resolveLinkTos ||
            subscription.options.resolveLinktos,
        },
      };
      await this.client.persistentSubscriptions.assert(
        subscription.group,
        subscription.stream,
        options,
      );
    }
    for (const subscription of this.subscriptions) {
      this.logger.log(
        `Connecting to persistent subscription "${subscription.group}" on stream ${subscription.stream}`,
      );
      await this.eventStoreConnection.connectToPersistentSubscription(
        subscription.stream,
        subscription.group,
        async (subscription, event: ResolvedEvent) => {
          const validatedEvent = await this.validatorService.validate(event);
          await this.driver.writeEvent(validatedEvent);
        },
        (sub, reason, error) => {
          subscription.onSubscriptionDropped(sub, reason, error.message);
        },
        this.credentials,
        subscription.bufferSize,
        subscription.autoAck,
      );
    }
  }
}
