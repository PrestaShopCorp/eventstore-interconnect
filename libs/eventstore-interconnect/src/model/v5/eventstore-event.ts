// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IEvent {}

export class IEventStoreEventOptions {
  eventStreamId?: string;
  metadata?: any;
  eventId?: string;
  created?: Date;
  eventNumber?: number;
  eventType?: string;
  originalEventId?: string;
  expectedVersion?: number | ExpectedVersion;
}

export enum ExpectedVersion {
  StreamExists = -4,
  Any = -2,
  NoStream = -1,
  EmptyStream = 0,
}

export class EventStoreEvent {
  readonly data: any;
  metadata?: any;
  readonly eventId?: string;
  readonly eventType?: string;
  readonly created?: Date;
  readonly eventNumber: number;
  protected readonly originalEventId: string;
  readonly eventStreamId: string;
}
