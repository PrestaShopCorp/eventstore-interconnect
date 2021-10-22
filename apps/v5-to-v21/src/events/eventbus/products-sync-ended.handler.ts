import { EventsHandler } from '@nestjs/cqrs';

import { ProductsSyncEndedEvent } from './products-sync-ended.event';
import { EventbusBaseHandler } from '@eventstore-interconnect';

@EventsHandler(ProductsSyncEndedEvent)
export class ProductsSyncEndedHandler extends EventbusBaseHandler<ProductsSyncEndedEvent> {
  hasToBeCopied(event: ProductsSyncEndedEvent): boolean {
    return !event.data.failed;
  }
}
