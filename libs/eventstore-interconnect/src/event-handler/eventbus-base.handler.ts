import { Logger } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import Sentry from '@sentry/node';
import { EventStoreAcknowledgeableEvent } from 'nestjs-geteventstore-4.0.1';
import { HTTPClient } from 'geteventstore-promise';

export abstract class EventbusBaseHandler<
  E extends EventStoreAcknowledgeableEvent,
> implements IEventHandler<E>
{
  private sentry;

  constructor(
    private readonly logger: Logger,
    @InjectSentry() private readonly sentryService: SentryService,
    private readonly client: HTTPClient,
  ) {
    this.sentryService.app = 'Subscriptions:';
    this.sentry = Sentry;
  }

  public hasToBeCopied(event: E): boolean {
    // some extending subclass should decide to copy event or not.
    return true;
  }

  public async handle(event: E): Promise<void> {
    if (!this.hasToBeCopied(event)) {
      return;
    }

    const { data, metadata, eventStreamId, eventType } = event;
    this.logger.log(
      'An event has been caught: ' +
        eventType +
        ' for stream : ' +
        eventStreamId,
    );

    try {
      await this.client.writeEvent(eventStreamId, eventType, data, metadata);
    } catch (err) {
      this.logger.error(err.toString());
      this.sentry.withScope((scope: Sentry.Scope) => {
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
