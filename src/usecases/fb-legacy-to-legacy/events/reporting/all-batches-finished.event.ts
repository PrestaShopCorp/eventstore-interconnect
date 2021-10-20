import {
  AcknowledgeableEventStoreEvent,
  IEventStoreEventOptions,
} from 'nestjs-geteventstore-1.6.4';
import {FacebookSyncInterface} from '../../models/facebook-sync.interface';

export class AllBatchesFinishedEvent extends AcknowledgeableEventStoreEvent {
  constructor(
    public readonly data: any,
    options?: IEventStoreEventOptions,
  ) {
    super({
      shopId: data.shopId as string,
      externalBusinessId: data.externalBusinessId as string,
      correlationId: data.correlationId as string,
      scannedBatchCount: data.scannedBatchCount as number,
      pendingBatchCount: data.pendingBatchCount as number,
    } as FacebookSyncInterface, options);
  }
}
