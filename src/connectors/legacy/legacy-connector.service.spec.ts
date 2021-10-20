import LegacyConnectorService from './legacy-connector.service';
import {dumbEventBusConfigType, dumbEventStoreLegacyServiceConfig, dumbLegacyConnectionConf} from './conf.helper';
import {Test, TestingModule} from "@nestjs/testing";

describe('LegacyConnectorService', () => {
  let connector: LegacyConnectorService;

  beforeEach(() => {
    connector = new LegacyConnectorService();
  });

  it('should connect to legacy version of eventstore', async () => {
    const moduleRegistration = connector.register(
	 dumbLegacyConnectionConf,
	 dumbEventStoreLegacyServiceConfig,
	 dumbEventBusConfigType
    )

    const testingModule: TestingModule = await Test.createTestingModule({
	 imports: [
	   ContextModule.register(), // mandatory for CqrsEventStoreModule creation
	   moduleRegistration()
	 ]
    }).compile();

    const esService = testingModule.get<EventStoreService>(EventStoreService);
    const tutu = await esService.connect();
    console.log('tutu : ', tutu)
    console.log('esService : ', esService)

    expect(esService).toBeTruthy();
  });
});
