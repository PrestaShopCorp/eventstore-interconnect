import FromV21ToV5 from './from-v21-to-v5.usecase';
import {getDumbConf} from './from-v21-to-v5.usecase.helper';
import {mock} from 'jest-mock-extended';
import {EventStoreInterconnector, InterconnectionConfiguration} from '@eventstore-interconnect';

describe('FromV21ToV5', () => {

  let useCase: FromV21ToV5;

  const interconnector = mock<EventStoreInterconnector>();

  beforeEach(() => {
    useCase = new FromV21ToV5(interconnector);
  });

  it(`should connect to v21 and v5 with the given conf`, () => {

    const conf: InterconnectionConfiguration = getDumbConf();

    jest.spyOn(interconnector, 'connectToV21x');

    useCase.checkConnectionsWithBothVersions(conf);

    expect(interconnector.connectToV21x).toHaveBeenCalledWith(conf);
  });

  /**
   * - should connect to v21 and v5 with the given conf
   * - be able to create a persistent subscription on v21
   * - be able to connect to the persistent subscription once created on v21
   * - be able to listen on events appening on the persistent subscription
   * - be able to validate these events
   * - be able to write emitted event on v5 event store
   * - be able to deny event that are malformed
   */

});
