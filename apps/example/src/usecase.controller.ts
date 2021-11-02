import { Controller, Get } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Example3Event } from './events/example3.event';
import { EventOptionsType } from 'nestjs-geteventstore-next';
import { Example1Event } from './events/example1.event';

@Controller('/')
export default class usecaseController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {}

  @Get('start')
  public async emitEvents(): Promise<void> {
    const options: EventOptionsType = {
      eventNumber: 0,
      originalEventId: '',
      eventStreamId: 'test',
      metadata: {
        correlation_id: 'fff',
        version: 123,
        type: 'int.e',
        source: 'bla',
        time: new Date().toISOString(),
        specversion: 1,
      },
    };
    await this.eventBus.publish(new Example3Event({}, options));

    const catSyncEvent: Example1Event = new Example1Event(
      {
        id: 'test-id',
        isOk: true,
        nestor: { isNestor: true },
      },
      options,
    );
    await this.eventBus.publish(catSyncEvent);

    const notValidEvent: any = new Example1Event(
      {
        id: 'test-id',
        isOk: true,
        nestor: { isNestor: true },
      },
      options,
    );
    notValidEvent.data.nestor = 123;

    await this.eventBus.publish(notValidEvent);
  }
}
