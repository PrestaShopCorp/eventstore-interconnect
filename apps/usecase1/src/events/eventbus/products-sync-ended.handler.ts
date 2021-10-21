import { EventsHandler } from '@nestjs/cqrs';

import { EventbusBaseHandler } from './eventbus-base.handler';
import { ProductsSyncEndedEvent } from './products-sync-ended.event';

@EventsHandler(ProductsSyncEndedEvent)
export class ProductsSyncEndedHandler extends EventbusBaseHandler<ProductsSyncEndedEvent> {
  hasToBeCopied(event: ProductsSyncEndedEvent): boolean {
    return !event.data.failed;
  }
}
