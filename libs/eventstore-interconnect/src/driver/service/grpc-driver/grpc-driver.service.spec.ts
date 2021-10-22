import { Test, TestingModule } from '@nestjs/testing';
import { GrpcDriverService } from './grpc-driver.service';

describe('GrpcDriverService', () => {
  let service: GrpcDriverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GrpcDriverService],
    }).compile();

    service = module.get<GrpcDriverService>(GrpcDriverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
