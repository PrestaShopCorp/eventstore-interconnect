import { EventStoreEvent } from 'nestjs-geteventstore/dist';
import { FacebookAccountInterface } from '../interfaces/facebook-account.interface';

export class FacebookAccountInitiatedEvent extends EventStoreEvent {
  constructor(public readonly data: FacebookAccountInterface, options?) {
    super(data, options);
  }
}
