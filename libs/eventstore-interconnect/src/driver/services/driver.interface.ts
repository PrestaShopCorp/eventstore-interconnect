import { EventStoreEvent } from 'nestjs-geteventstore-next';

export const DRIVER = Symbol();

export interface Driver {
  writeEvent(event: EventStoreEvent): Promise<any>;
}
