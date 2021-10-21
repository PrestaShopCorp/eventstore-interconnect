import { EventsHandler } from '@nestjs/cqrs';

import { EventbusBaseHandler } from './eventbus-base.handler';
import { CategoriesSyncEndedEvent } from './categories-sync-ended.event';

@EventsHandler(CategoriesSyncEndedEvent)
export class CategoriesSyncEndedHandler extends EventbusBaseHandler<CategoriesSyncEndedEvent> {}
