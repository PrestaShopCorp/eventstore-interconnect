import { Test, TestingModule } from '@nestjs/testing';
import { LegacyEventFormatterService } from './legacy-event-formatter.service';
import { FormattedEvent, FormattedMetadata } from '../formatted-event';

describe('LegacyEventFormatterService', () => {
  let service: LegacyEventFormatterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegacyEventFormatterService],
    }).compile();

    service = module.get<LegacyEventFormatterService>(
      LegacyEventFormatterService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the event given in param', () => {
    const data = {};
    const metadata: FormattedMetadata = {
      eventId: '123',
      eventStreamId: 'toto',
      eventType: 'tutu',
    };

    const formatedEvent: FormattedEvent = service.format({
      event: {
        ...metadata,
        id: 'toto',
        data: Buffer.from(JSON.stringify(data), 'utf-8'),
        metadata: Buffer.from(
          JSON.stringify({
            ...metadata,
            toto: '555',
          }),
          'utf-8',
        ),
      },
    });
    expect(formatedEvent).toEqual({
      data,
      metadata: {
        ...metadata,
        toto: '555',
      },
    });
  });
});
