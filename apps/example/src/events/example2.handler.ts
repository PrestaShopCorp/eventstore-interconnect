import { EventsHandler } from '@nestjs/cqrs';

import { Example2Event } from './example2.event';
import { InterconnectionHandler } from '@eventstore-interconnect';

@EventsHandler(Example2Event)
export class Example2Handler extends InterconnectionHandler<Example2Event> {
  public validateEventAndDatasDto(event: Example2Event): void | never {}
}
