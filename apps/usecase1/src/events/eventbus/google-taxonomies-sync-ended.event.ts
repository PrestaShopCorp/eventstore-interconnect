import {
  EventOptionsType,
  EventStoreAcknowledgeableEvent,
} from 'nestjs-geteventstore-4.0.1';

export class GoogleTaxonomiesSyncEndedEvent extends EventStoreAcknowledgeableEvent {
  constructor(public readonly data: any, options?: EventOptionsType) {
    super(data, options);
  }
}
