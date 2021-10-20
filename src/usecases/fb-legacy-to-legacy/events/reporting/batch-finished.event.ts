import {
  AcknowledgeableEventStoreEvent,
  IEventStoreEventOptions,
} from 'nestjs-geteventstore-1.6.4';
import {FacebookSyncInterface} from '../../models/facebook-sync.interface';

export class BatchFinishedEvent extends AcknowledgeableEventStoreEvent {
  constructor(
    public readonly data: any,
    options?: IEventStoreEventOptions,
  ) {
    super({
      shopId: data.shopId as string,
      externalBusinessId: data.externalBusinessId as string,
      correlationId: data.correlationId as string,
      batchId: data.batchId as string,
      errorsCount: data.errorsCount as number,
      errors: data.errors as any,
    } as FacebookSyncInterface, options);
  }
}
