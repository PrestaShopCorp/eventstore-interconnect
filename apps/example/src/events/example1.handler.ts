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
    const validableDatasDto: ValidableDatasDto = plainToClass(
      ValidableDatasDto,
      event.data,
    );
    const eventGeneralValidationErrors: ValidationError[] = await validate(
      event,
    );
    const providedDatasValidationErrors: ValidationError[] = await validate(
      validableDatasDto,
    );
    const concatErrors: ValidationError[] = [
      ...eventGeneralValidationErrors,
      ...providedDatasValidationErrors,
    ];

    if (concatErrors.length > 0) {
      this.logger.error(
        `Error handling CategoriesSyncEndedEvent : ${JSON.stringify(
          concatErrors,
        )}`,
      );
      throw Error(`CategoriesSyncEndedEvent not valid, won't be written`);
    }
  }
}
