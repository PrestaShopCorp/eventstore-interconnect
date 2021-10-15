import {EventStoreInterconnector, InterconnectionConfiguration} from '@eventstore-interconnect';

export default class FromV21ToV5 {

  public checkConnectionsWithBothVersions(
    interco: EventStoreInterconnector,
    conf: InterconnectionConfiguration
  ): void {
    interco.connectToV21x(conf);
  }
}
