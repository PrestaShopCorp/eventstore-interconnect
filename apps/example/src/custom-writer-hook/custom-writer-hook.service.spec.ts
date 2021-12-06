import { Test, TestingModule } from "@nestjs/testing";
import { CustomWriterHookService } from "./custom-writer-hook.service";
import { Logger } from "nestjs-pino-stackdriver";

describe('CustomWriterHookService', () => {
  let service: CustomWriterHookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomWriterHookService, Logger],
    }).compile();

    service = module.get<CustomWriterHookService>(CustomWriterHookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
