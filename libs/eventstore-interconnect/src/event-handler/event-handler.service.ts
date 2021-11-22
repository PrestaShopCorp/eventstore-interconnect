import { Inject, Injectable } from '@nestjs/common';
import { EventHandler } from './event-handler';
import { Validator, VALIDATOR } from '../validator';
import { Formatter, FORMATTER } from '../formatter';
import { Driver, DRIVER } from '../driver';
import { FormattedEvent } from '../formatter';

@Injectable()
export class EventHandlerService implements EventHandler {
  constructor(
    @Inject(VALIDATOR)
    private readonly validator: Validator,
    @Inject(FORMATTER)
    private readonly formatter: Formatter,
    @Inject(DRIVER)
    private readonly driver: Driver,
  ) {}

  public async handle(event: any): Promise<void> {
    await this.validator.validate(event);
    const formattedEvent: FormattedEvent = this.formatter.format(event);
    await this.driver.writeEvent(formattedEvent);
  }
}
