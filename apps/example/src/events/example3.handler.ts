import { EventsHandler } from '@nestjs/cqrs';

import { Example3Event } from './example3.event';
import { InterconnectionHandler } from '@eventstore-interconnect';

@EventsHandler(Example3Event)
export class Example3Handler extends InterconnectionHandler<Example3Event> {
  public validateEventAndDatasDto(event: Example3Event): void | never {}
}
