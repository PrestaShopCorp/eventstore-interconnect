import { Injectable } from '@nestjs/common';
import { Formatter } from '../formatter';
import { FormattedEvent } from '../formatted-event';

@Injectable()
export class NextEventFormatterService implements Formatter {
  public format(readonlyEvent: any): FormattedEvent {
    return {
      eventId: readonlyEvent.event.id,
      type: readonlyEvent.event.type,
      contentType: 'application/json',
      data: readonlyEvent.event.data,
      metadata: readonlyEvent.event.metadata,
      streamId: readonlyEvent.event.streamId,
    };
  }
}
