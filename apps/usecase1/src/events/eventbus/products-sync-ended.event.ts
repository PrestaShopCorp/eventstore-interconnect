import {
  EventOptionsType,
  EventStoreAcknowledgeableEvent,
} from 'nestjs-geteventstore-legacy';

export class ProductsSyncEndedEvent extends EventStoreAcknowledgeableEvent {
  constructor(public readonly data: any, options?: EventOptionsType) {
    super(data, options);
  }
}
