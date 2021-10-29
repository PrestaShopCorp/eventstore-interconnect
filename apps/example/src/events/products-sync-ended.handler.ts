import { EventsHandler } from '@nestjs/cqrs';

import { ProductsSyncEndedEvent } from './products-sync-ended.event';
import { InterconnectionHandler } from '@eventstore-interconnect';

@EventsHandler(ProductsSyncEndedEvent)
export class ProductsSyncEndedHandler extends InterconnectionHandler<ProductsSyncEndedEvent> {
  public validateEventAndDatasDto(
    event: ProductsSyncEndedEvent,
  ): void | never {}
}
