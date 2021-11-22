import { Test, TestingModule } from '@nestjs/testing';
import { LegacyEventFormatterService } from './legacy-event-formatter.service';

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
    expect(
      service.format({
        event: {
          id: 'toto',
          data: Buffer.from('{}', 'utf-8'),
          metadata: Buffer.from('{}', 'utf-8'),
        },
      }),
    ).toEqual({
      id: 'toto',
      data: {},
      metadata: {},
    });
  });
});
