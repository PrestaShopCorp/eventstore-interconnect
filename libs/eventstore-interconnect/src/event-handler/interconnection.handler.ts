import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino-stackdriver';
import { Driver, DRIVER } from '../driver';
import { SAFETY_NET, SafetyNet } from '../safety-net';
import { EVENT_WRITER_TIMEOUT_IN_MS } from '../event-handler';
import { ValidatorService } from '../reader';

@Injectable()
export class InterconnectionHandler {
  constructor(
    @Inject(DRIVER) private readonly driver: Driver,
    @Inject(SAFETY_NET) protected readonly safetyNet: SafetyNet,
    protected readonly logger: Logger,
    private readonly validatorService: ValidatorService,
  ) {}

  public async handle(event: any): Promise<void> {
    try {
      const validatedEvent = await this.validatorService.validate(event);
      await this.tryToWriteEventAgainstAggressiveTimeout(
        validatedEvent,
        EVENT_WRITER_TIMEOUT_IN_MS,
      );
    } catch (err) {
      this.logger.error(err.toString());
      this.safetyNet.hook(event);
    }
  }

  /**
   * Return void or throw an error. This must be provided
   * by handlers that will extends this one
   * @param event the event to be nested validated
   */

  private async tryToWriteEventAgainstAggressiveTimeout(
    event: any,
    timeout: number,
  ): Promise<void> {
    let eventWritten = false;
    setTimeout(() => {
      this.safetyNet.hook(event, eventWritten);
    }, timeout);
    this.writeEvent(event).then(() => (eventWritten = true));
    await event.ack();
  }

  private async writeEvent(event: any): Promise<void> {
    this.logger.log(
      `Trying to write ${event.eventType} (id: ${event.eventId}) on stream ${event.eventStreamId}`,
    );
    await this.driver.writeEvent(event);
    this.logger.log(`Event (id: ${event.eventId}) written`);
  }
}
