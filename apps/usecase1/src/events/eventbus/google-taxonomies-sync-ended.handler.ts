import { EventsHandler } from '@nestjs/cqrs';

import { GoogleTaxonomiesSyncEndedEvent } from './google-taxonomies-sync-ended.event';
import { EventbusBaseHandler } from '@eventstore-interconnect';

@EventsHandler(GoogleTaxonomiesSyncEndedEvent)
export class GoogleTaxonomiesSyncEndedHandler extends EventbusBaseHandler<GoogleTaxonomiesSyncEndedEvent> {}
