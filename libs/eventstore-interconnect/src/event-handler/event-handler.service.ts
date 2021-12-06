import { Inject, Injectable } from '@nestjs/common';
import { EventHandler } from './event-handler';
import { Validator, VALIDATOR } from '../validator';
import { FormattedEvent, FORMATTER, Formatter } from '../formatter';
import { Driver, DRIVER } from '../driver';
import { WRITER_HOOK, WriterHook } from '../hooks/writer-hook/writer-hook';

@Injectable()
export class EventHandlerService implements EventHandler {
  constructor(
    @Inject(VALIDATOR)
    private readonly validator: Validator,
    @Inject(FORMATTER)
    private readonly formatter: Formatter,
    @Inject(DRIVER)
    private readonly driver: Driver,
    @Inject(WRITER_HOOK)
    private readonly writerHook: WriterHook,
  ) {}

  public async handle(event: any): Promise<void> {
    await this.validator.validate(event);
    const formattedEvent: FormattedEvent = this.formatter.format(event);
    await this.driver.writeEvent(formattedEvent);
    await this.writerHook.hook(formattedEvent);
  }
}
