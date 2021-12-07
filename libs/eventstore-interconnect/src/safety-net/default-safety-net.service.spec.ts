import { DefaultSafetyNetService } from './default-safety-net.service';
import { Logger } from '@nestjs/common';

describe('DefaultSafetyNetService', () => {
  let hook: DefaultSafetyNetService;

  const logger: Logger = { log: jest.fn(), error: jest.fn() } as any as Logger;

  beforeEach(async () => {
    hook = new DefaultSafetyNetService(logger);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should exit the process when while calling the hook, the event is not written', () => {
    jest.spyOn(process, 'exit').mockReturnValue(null as never);
    hook.cannotWriteEventHook({ nack: jest.fn() });

    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
