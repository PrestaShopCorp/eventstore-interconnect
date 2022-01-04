import { hostname } from 'os';

export enum ExpectedVersion {
  StreamExists = -4,
  Any = -2,
  NoStream = -1,
  EmptyStream = 0,
}
export interface IAggregateEvent {
  data: any;
  eventStreamId?: string;
  metadata?: any;
  eventId?: string;
  expectedVersion?: number | ExpectedVersion;
  getStream(): string;
}
export interface IExpectedVersionEvent {
  expectedVersion: number | ExpectedVersion;
}
export interface IEventStoreEventOptions {
  eventStreamId?: string;
  metadata?: any;
  eventId?: string;
  created?: Date;
  eventNumber?: number;
  eventType?: string;
  originalEventId?: string;
  expectedVersion?: number | ExpectedVersion;
}
export class EventStoreEvent implements IAggregateEvent {
  readonly data: any;
  metadata?: any;
  readonly eventId?: string;
  readonly eventType?: string;
  readonly created?: Date;
  readonly eventNumber: number;
  protected readonly originalEventId: string;
  readonly eventStreamId: string;
  constructor(data: any, options?: IEventStoreEventOptions) {}
  getStream(): string {
    return '';
  }
  getStreamCategory(): string {
    return '';
  }
  getStreamId(): string {
    return '';
  }
}
export interface IAcknowledgeableEvent {
  ack: () => Promise<any>;
  nack: (action: any, reason: string) => Promise<any>;
}
export abstract class AcknowledgeableEventStoreEvent
  extends EventStoreEvent
  implements IAcknowledgeableEvent
{
  abstract ack(): Promise<void>;
  abstract nack(action: any, reason: string): Promise<void>;
}
export class JobStartedEventT extends AcknowledgeableEventStoreEvent {
  constructor(
    public readonly data: {
      chargebeePlanId: string;
      module: any;
      chargebeeCustomerId: string;
      shopId: string;
      subscriptionId: string;
    },
    options?,
  ) {
    super(data, options);
  }

  public ack(): Promise<any> {
    return Promise.resolve(undefined);
  }

  public nack(action: any, reason: string): Promise<any> {
    return Promise.resolve(undefined);
  }
}

export type jobEndedEventDataType = {
  jobId: string;
  shopId: string;
  targetUrl: string;
  startedAt: Date;
  endedAt: Date;
  duration: number;
  toSync: any;
  shopHealthy: boolean;
  shopHealthCode: number;
};

export class JobEndedEventT extends AcknowledgeableEventStoreEvent {
  constructor(
    public readonly data: jobEndedEventDataType,
    options?: IEventStoreEventOptions,
  ) {
    super(data, options);
    this.metadata.$correlationId = `${data.jobId}`;
    this.metadata.host = hostname();
  }

  public ack(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public nack(action: any, reason: string): Promise<void> {
    return Promise.resolve(undefined);
  }
}
