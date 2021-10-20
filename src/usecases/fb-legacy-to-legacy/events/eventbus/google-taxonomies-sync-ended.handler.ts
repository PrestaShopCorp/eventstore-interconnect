import { EventsHandler } from '@nestjs/cqrs';

import { EventbusBaseHandler } from './eventbus-base.handler';
import { GoogleTaxonomiesSyncEndedEvent } from './google-taxonomies-sync-ended.event';

@EventsHandler(GoogleTaxonomiesSyncEndedEvent)
export class GoogleTaxonomiesSyncEndedHandler extends EventbusBaseHandler<GoogleTaxonomiesSyncEndedEvent> {}
