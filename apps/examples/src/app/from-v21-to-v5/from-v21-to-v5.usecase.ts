import {
  EVENT_STORE_INTERCONNECTOR,
  IEventStoreInterconnector,
  InterconnectionConfiguration
} from '@eventstore-interconnect';
import {inject} from 'inversify';

export default class FromV21ToV5 {

  constructor(
    @inject(EVENT_STORE_INTERCONNECTOR)
    private readonly eventStoreInterconnector: IEventStoreInterconnector
  ) {
  }


  public checkConnectionsWithBothVersions(
    conf: InterconnectionConfiguration
  ): void {
    this.eventStoreInterconnector.connectToV21x(conf);
  }
}
