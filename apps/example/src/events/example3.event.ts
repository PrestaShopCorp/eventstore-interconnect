import {
  EventOptionsType,
  EventStoreAcknowledgeableEvent,
} from 'nestjs-geteventstore-legacy';

export class Example3Event extends EventStoreAcknowledgeableEvent {
  constructor(public readonly data: any, options?: EventOptionsType) {
    super(data, options);
  }
}
