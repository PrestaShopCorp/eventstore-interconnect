import {
  AcknowledgeableEventStoreEvent,
  IEventStoreEventOptions,
} from 'nestjs-geteventstore-1.6.4';

export class ProductsSyncEndedEvent extends AcknowledgeableEventStoreEvent {
  constructor(public readonly data: any, options?: IEventStoreEventOptions) {
    super(data, options);
  }
}
