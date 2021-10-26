import { Inject, Logger } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { EventStoreAcknowledgeableEvent } from 'nestjs-geteventstore-legacy';
import { Driver, DRIVER } from '../driver';
import { SAFETY_NET, SafetyNet } from '../safety-net';

export abstract class EventbusBaseHandler<
  E extends EventStoreAcknowledgeableEvent,
> implements IEventHandler<E>
{
  constructor(
    @Inject(SAFETY_NET) protected readonly safetyNet: SafetyNet,
    @Inject(DRIVER) private readonly driver: Driver,
    protected readonly logger: Logger,
  ) {}

  public async handle(event: E): Promise<void> {
    try {
      const { eventStreamId, eventType } = event;
      this.logger.log(
        `An event of type ${eventType} has been caught for stream ${eventStreamId}`,
      );
      await this.driver.writeEvent(event);
    } catch (err) {
      this.logger.error(err.toString());
      this.safetyNet.hook(event);
    }
  }
}
