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
    expect(
      service.format({
        event: {
          id: 'toto',
          data: {},
          metadata: {},
        },
      }),
    ).toEqual({
      id: 'toto',
      data: {},
      metadata: {},
    });
  });
});
