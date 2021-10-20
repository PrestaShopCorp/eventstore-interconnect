import { NotFoundException } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino-stackdriver';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import * as Sentry from '@sentry/node';
import { PersistentSubscriptionNakEventAction } from 'node-eventstore-client';
import { from } from 'rxjs';
import { flatMap, throwIfEmpty } from 'rxjs/operators';

import { FacebookAccountInterface } from '../interfaces/facebook-account.interface';
import { FacebookAccountUpdatedEvent } from './facebook-account-updated.event';
import { FacebookAccountRepository } from '../repositories/facebook-account.repository';

@EventsHandler(FacebookAccountUpdatedEvent)
export class FacebookAccountUpdatedFacebookHandler implements IEventHandler<FacebookAccountUpdatedEvent> {
  private Sentry: any;

  constructor(
    private readonly facebookAccountRepository: FacebookAccountRepository,
    private readonly logger: Logger,
    @InjectSentry() private readonly sentryService: SentryService,
  ) {
    this.sentryService.app = 'Subscriptions:';
    this.Sentry = Sentry;
  }

  async handle(event: FacebookAccountUpdatedEvent): Promise<void> {
    const data: FacebookAccountInterface = event.data;

    try {
      const {shopId} = data;
      await this.facebookAccountRepository.getByShopId(shopId).pipe(
        flatMap((facebookAccount: FacebookAccountInterface) => {
          facebookAccount.accountSuspended = false;
          return this.facebookAccountRepository.save(shopId, facebookAccount);
        }),
        flatMap(() => from(event.ack())),
        throwIfEmpty(() => {
          event.ack();
          return new NotFoundException('Shop not found.');
        }),
      ).toPromise();
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
