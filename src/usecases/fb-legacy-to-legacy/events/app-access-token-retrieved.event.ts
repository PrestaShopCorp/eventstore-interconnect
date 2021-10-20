import { EventStoreEvent } from 'nestjs-geteventstore-1.6.4';
import { FacebookAccountInterface } from '../facebook-account.interface';

export class AppAccessTokensRetrievedEvent extends EventStoreEvent {
  constructor(public readonly data: FacebookAccountInterface, options?) {
    super(data, options);
  }
}
