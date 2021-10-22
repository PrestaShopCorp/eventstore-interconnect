import {
  EventOptionsType,
  EventStoreAcknowledgeableEvent,
} from 'nestjs-geteventstore-legacy';

export class CategoriesSyncEndedEvent extends EventStoreAcknowledgeableEvent {
  constructor(public readonly data: any, options?: EventOptionsType) {
    super(data, options);
  }
}
