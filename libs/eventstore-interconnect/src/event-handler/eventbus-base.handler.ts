import { Inject, Logger } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { EventStoreAcknowledgeableEvent } from 'nestjs-geteventstore-legacy';
import { Driver, DRIVER } from '../driver';
import { SAFETY_NET, SafetyNet } from '../safety-net';
import { EVENT_WRITER_TIMEOUT_IN_MS } from '../event-handler';

export abstract class EventbusBaseHandler<
  E extends EventStoreAcknowledgeableEvent,
> implements IEventHandler<E>
{
  constructor(
    @Inject(DRIVER) private readonly driver: Driver,
    @Inject(SAFETY_NET) protected readonly safetyNet: SafetyNet,
    protected readonly logger: Logger,
  ) {}

  public async handle(event: E): Promise<void> {
    try {
      await this.tryToWriteEventAgainstAggressiveTimeout(
        event,
        EVENT_WRITER_TIMEOUT_IN_MS,
      );
    } catch (err) {
      this.logger.error(err.toString());
      this.safetyNet.hook(event);
    }
  }

  private async tryToWriteEventAgainstAggressiveTimeout(
    event: E,
    timeout: number,
  ): Promise<void> {
    let eventWritten = false;
    setTimeout(() => {
      this.safetyNet.hook(event, eventWritten);
    }, timeout);

    await this.writeEvent(event);

    eventWritten = true;
  }

  private async writeEvent(event: E): Promise<void> {
    this.logger.log(
      `Trying to write ${event.eventType} (id: ${event.eventId}) on stream ${event.eventStreamId}`,
    );
    await this.driver.writeEvent(event);
    this.logger.log(`Event (id: ${event.eventId}) written`);
  }
}
