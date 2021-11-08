import {
  AcknowledgeableEventStoreEvent,
  IEventStoreEventOptions,
} from 'nestjs-geteventstore-legacy';

export class Dumb3Event extends AcknowledgeableEventStoreEvent {
  constructor(public readonly data: any, options?: IEventStoreEventOptions) {
    super(data, options);
  }
}
