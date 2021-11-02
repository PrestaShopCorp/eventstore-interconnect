import {
  EventOptionsType,
  EventStoreAcknowledgeableEvent,
} from 'nestjs-geteventstore-legacy';

export class Example2Event extends EventStoreAcknowledgeableEvent {
  constructor(public readonly data: any, options?: EventOptionsType) {
    super(data, options);
  }
}
