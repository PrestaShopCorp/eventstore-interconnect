import { EventsHandler } from '@nestjs/cqrs';

import { CategoriesSyncEndedEvent } from './categories-sync-ended.event';
import { EventbusBaseHandler } from '@eventstore-interconnect';

@EventsHandler(CategoriesSyncEndedEvent)
export class CategoriesSyncEndedHandler extends EventbusBaseHandler<CategoriesSyncEndedEvent> {}
