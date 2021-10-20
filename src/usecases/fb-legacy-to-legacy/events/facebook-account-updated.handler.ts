import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino-stackdriver';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import * as Sentry from '@sentry/node';
import { PersistentSubscriptionNakEventAction } from 'node-eventstore-client';

import { SegmentService } from '../connectors/segment/segment.service';
import { FacebookAccountInterface } from '../interfaces/facebook-account.interface';
import { FacebookAccountUpdatedEvent } from './facebook-account-updated.event';

@EventsHandler(FacebookAccountUpdatedEvent)
export class FacebookAccountUpdatedHandler implements IEventHandler<FacebookAccountUpdatedEvent> {
  private Sentry: any;

  constructor(
    private readonly segmentService: SegmentService,
    private readonly logger: Logger,
    @InjectSentry() private readonly sentryService: SentryService,
  ) {
    this.sentryService.app = 'Subscriptions:';
    this.Sentry = Sentry;
  }

  async handle(event: FacebookAccountUpdatedEvent): Promise<void> {
    const data: FacebookAccountInterface = event.data;

    try {
      const {shopId, externalBusinessId} = data;

      this.segmentService.identify({
        userId: shopId,
        traits: {
          externalBusinessId
        },
      }).track({
        userId: shopId,
        event: 'FacebookAccountUpdated',
        properties: {},
        timestamp: event.created,
      });

      await event.ack();
    } catch (err) {
      this.logger.error(err.toString());
      this.Sentry.withScope((scope: Sentry.Scope) => {
        scope.setUser({
          id: data?.shopId,
          username: `shop ${data?.shopId}`,
        });
        scope.setTags({
          shopId: data?.shopId,
          externalBusinessId: data?.externalBusinessId,
        });
        this.sentryService.error(err);
      });

      await event.nack(PersistentSubscriptionNakEventAction.Retry, err.message);
    }
  }
}
