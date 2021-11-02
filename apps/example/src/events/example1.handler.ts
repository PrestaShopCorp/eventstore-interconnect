import { EventsHandler } from '@nestjs/cqrs';

import { Example1Event, ValidableDatasDto } from './example1.event';
import { InterconnectionHandler } from '@eventstore-interconnect';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

@EventsHandler(Example1Event)
export class Example1Handler extends InterconnectionHandler<Example1Event> {
  public async validateEventAndDatasDto(
    event: Example1Event,
  ): Promise<void | never> {
    event.data = plainToClass(ValidableDatasDto, event.data);
    const concatErrors: ValidationError[] = await validate(event);

    if (concatErrors.length > 0) {
      this.logger.error(
        `Error handling Example1Event : ${JSON.stringify(concatErrors)}`,
      );
      throw Error(`Example1Event not valid, won't be written`);
    }
  }
}
