import { Logger } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import * as Sentry from '@sentry/node';
import { AcknowledgeableEventStoreEvent } from 'nestjs-geteventstore-1.6.4';
import { SecondaryConnectionService } from '../../secondary-connection.service';

export abstract class EventbusBaseHandler<
  E extends AcknowledgeableEventStoreEvent,
> implements IEventHandler<E>
{
  private Sentry: any;

  constructor(
    private readonly logger: Logger,
    @InjectSentry() private readonly sentryService: SentryService,
    private readonly secondaryConnectionService: SecondaryConnectionService,
  ) {
    this.sentryService.app = 'Subscriptions:';
    this.Sentry = Sentry;
  }

  hasToBeCopied(event: E): boolean {
    // some extending subclass should decide to copy event or not.
    return true;
  }

  async handle(event: E): Promise<void> {
    if (!this.hasToBeCopied(event)) {
      return;
    }

    const data: any = event.data;
    const metadata: any = event.metadata;
    const stream: string = event.eventStreamId;
    const eventType: string = event.eventType;
    this.logger.log(
      'An event has been caught: ' + eventType + ' for stream : ' + stream,
    );

    try {
      this.secondaryConnectionService
        .getClient()
        .writeEvent(stream, eventType, data, metadata);
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
      this.logger.error('exiting with error code: 138');
      process.exit(138);
    }
  }
}
