import { Controller, Get, Inject } from '@nestjs/common';
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
    const example1Event: Example1Event = new Example1Event(
      {
        id: 'test-id',
        isOk: true,
        nestor: { isNestor: true },
      },
      this.getOptions(),
    );
    await this.grpcDriver.writeEvent(example1Event);

    const notValidEvent: any = new Example1Event(
      {
        id: 'test-id',
        isOk: true,
        nestor: { isNestor: true },
      },
      this.getOptions(),
    );
    notValidEvent.data.nestor = 123;

    await this.grpcDriver.writeEvent(notValidEvent);
  }

  @Get('writeOnLegSrc')
  public async writeOnLegSrc(): Promise<void> {
    const example1Event: Example1Event = new Example1Event(
      {
        id: 'test-id',
        isOk: true,
        nestor: { isNestor: true },
      },
      this.getOptions(),
    );
    await this.httpDriver.writeEvent(example1Event);

    const notValidEvent: any = new Example1Event(
      {
        id: 'test-id',
        isOk: true,
        nestor: { isNestor: true },
      },
      this.getOptions(),
    );
    notValidEvent.data.nestor = 123;
    await this.httpDriver.writeEvent(notValidEvent);
  }

  private getOptions() {
    return {
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
  }
}
