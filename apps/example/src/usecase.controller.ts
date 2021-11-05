import { Controller, Get, Inject } from '@nestjs/common';
import { EventOptionsType } from 'nestjs-geteventstore-next';
import { Example1Event } from './events/example1.event';
import { GrpcDriverService, HttpDriverService } from '@eventstore-interconnect';
import { ES_GRPC_WRITER, ES_HTTP_WRITER } from './constants';

@Controller('/')
export default class UsecaseController {
  constructor(
    @Inject(ES_HTTP_WRITER)
    private readonly httpDriver: HttpDriverService,
    @Inject(ES_GRPC_WRITER)
    private readonly grpcDriver: GrpcDriverService,
  ) {}

  @Get('writeOnNextSrc')
  public async writeOnNextSrc(): Promise<void> {
    const options: EventOptionsType = {
      eventNumber: 0,
      originalEventId: '',
      eventStreamId: '$ce-hero',
      metadata: {
        correlation_id: 'fff',
        version: 123,
        type: 'int.e',
        source: 'bla',
        time: new Date().toISOString(),
        specversion: 1,
      },
    };
    // await this.eventBus.publish(new Example3Event({}, options));

    const example1Event: Example1Event = new Example1Event(
      {
        id: 'test-id',
        isOk: true,
        nestor: { isNestor: true },
      },
      options,
    );
    // example1Event.eventStreamId = '$ce-hero';
    // await this.eventBus.publish(catSyncEvent);

    const notValidEvent: any = new Example1Event(
      {
        id: 'test-id',
        isOk: true,
        nestor: { isNestor: true },
      },
      options,
    );
    notValidEvent.data.nestor = 123;

    // await this.eventBus.publish(notValidEvent);
    // await this.driver.writeEvent(example1Event);
  }

  @Get('writeOnLegSrc')
  public async writeOnLegSrc(): Promise<void> {
    const options: EventOptionsType = {
      eventNumber: 0,
      originalEventId: '',
      eventStreamId: '$ce-hero',
      metadata: {
        correlation_id: 'fff',
        version: 123,
        type: 'int.e',
        source: 'bla',
        time: new Date().toISOString(),
        specversion: 1,
      },
    };

    const example1Event: Example1Event = new Example1Event(
      {
        id: 'test-id',
        isOk: true,
        nestor: { isNestor: true },
      },
      options,
    );
    await this.httpDriver.writeEvent(example1Event);

    const notValidEvent: any = new Example1Event(
      {
        id: 'test-id',
        isOk: true,
        nestor: { isNestor: true },
      },
      options,
    );
    notValidEvent.data.nestor = 123;
    await this.httpDriver.writeEvent(notValidEvent);
  }
}
