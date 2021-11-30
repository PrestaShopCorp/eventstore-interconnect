import { Injectable } from '@nestjs/common';
import { Formatter } from '../formatter';
import { FormattedEvent } from '../formatted-event';

@Injectable()
export class NextEventFormatterService implements Formatter {
  public format(readonlyEvent: any): FormattedEvent {
    return {
      data: readonlyEvent.event.data,
      metadata: {
        ...readonlyEvent.event.metadata,
        eventStreamId: readonlyEvent.event.streamId,
        eventId: readonlyEvent.event.id,
        eventType: readonlyEvent.event.type,
      },
    };
  }
}
