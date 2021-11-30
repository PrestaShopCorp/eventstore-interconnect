import { Injectable } from '@nestjs/common';
import { Formatter } from '../formatter';
import { FormattedEvent } from '../formatted-event';

@Injectable()
export class LegacyEventFormatterService implements Formatter {
  public format(readonlyEvent: any): FormattedEvent {
    const data = JSON.parse(readonlyEvent.event.data.toString());
    const metadata = JSON.parse(readonlyEvent.event.metadata.toString());
    return {
      data,
      metadata: {
        ...metadata,
        eventStreamId: readonlyEvent.event.eventStreamId,
        eventId: readonlyEvent.event.eventId,
        eventType: readonlyEvent.event.eventType,
      },
    };
  }
}
