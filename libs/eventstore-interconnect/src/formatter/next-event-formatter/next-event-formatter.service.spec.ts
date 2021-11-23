import { Test, TestingModule } from '@nestjs/testing';
import { NextEventFormatterService } from './next-event-formatter.service';

describe('NextEventFormatterService', () => {
  let service: NextEventFormatterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NextEventFormatterService],
    }).compile();

    service = module.get<NextEventFormatterService>(NextEventFormatterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the event given in param', () => {
    const event = service.format({
      event: {
        id: 'toto',
        type: 'tutu',
        data: { plop: 'plop' },
        metadata: { pulp: 'pulp' },
        streamId: 'sss',
      },
    });

    expect(event.eventId).toEqual('toto');
    expect(event.type).toEqual('tutu');
    expect(event.data.plop).toEqual('plop');
    expect(event.metadata.pulp).toEqual('pulp');
    expect(event.contentType).toEqual('application/json');
    expect(event.streamId).toEqual('sss');
  });
});
