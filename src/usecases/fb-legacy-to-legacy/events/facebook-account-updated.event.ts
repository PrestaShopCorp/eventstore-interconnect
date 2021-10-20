import {
  AcknowledgeableEventStoreEvent,
  IEventStoreEventOptions,
} from 'nestjs-geteventstore-1.6.4';
import { FacebookAccountInterface } from '../interfaces/facebook-account.interface';

export class FacebookAccountUpdatedEvent extends AcknowledgeableEventStoreEvent {
  constructor(public readonly data: FacebookAccountInterface, options?: IEventStoreEventOptions) {
    super(data, options);
  }
}
