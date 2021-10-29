import { EventsHandler } from '@nestjs/cqrs';

import { GoogleTaxonomiesSyncEndedEvent } from './google-taxonomies-sync-ended.event';
import { InterconnectionHandler } from '@eventstore-interconnect';

@EventsHandler(GoogleTaxonomiesSyncEndedEvent)
export class GoogleTaxonomiesSyncEndedHandler extends InterconnectionHandler<GoogleTaxonomiesSyncEndedEvent> {
  public validateEventAndDatasDto(
    event: GoogleTaxonomiesSyncEndedEvent,
  ): void | never {}
}
