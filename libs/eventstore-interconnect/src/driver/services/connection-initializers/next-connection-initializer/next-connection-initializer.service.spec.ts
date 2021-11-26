import { Test, TestingModule } from '@nestjs/testing';
import { NextConnectionInitializerService } from './next-connection-initializer.service';

describe('NextConnectionInitializerService', () => {
  let service: NextConnectionInitializerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NextConnectionInitializerService],
    }).compile();

    service = module.get<NextConnectionInitializerService>(NextConnectionInitializerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
