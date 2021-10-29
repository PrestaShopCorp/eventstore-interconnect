import { EventsHandler } from '@nestjs/cqrs';

import {
  CategoriesSyncEndedEvent,
  ValidableDatasDto,
} from './categories-sync-ended.event';
import { InterconnectionHandler } from '@eventstore-interconnect';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

@EventsHandler(CategoriesSyncEndedEvent)
export class CategoriesSyncEndedHandler extends InterconnectionHandler<CategoriesSyncEndedEvent> {
  public async validateEventAndDatasDto(
    event: CategoriesSyncEndedEvent,
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
    }
  }
}
