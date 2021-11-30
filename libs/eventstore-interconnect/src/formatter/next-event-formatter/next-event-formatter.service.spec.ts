import { Test, TestingModule } from '@nestjs/testing';
import { NextEventFormatterService } from './next-event-formatter.service';
import { FormattedEvent, FormattedMetadata } from '../formatted-event';

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
    const metadata: FormattedMetadata = {
      eventId: '123',
      eventStreamId: 'toto',
      eventType: 'tutu',
    };
    const event: FormattedEvent = service.format({
      event: {
        id: '123',
        type: 'tutu',
        data: { plop: 'plop' },
        metadata: { pulp: 'pulp' },
        streamId: 'toto',
      },
    });

    expect(event.metadata).toEqual({ ...metadata, pulp: 'pulp' });
    expect(event.data).toEqual(event.data);
  });
});
