import {IEventStoreInterconnector} from '@eventstore-interconnect';
import {EventStoreInterconnector} from '@eventstore-interconnect';

describe('eventstoreInterconnector', () => {

    let interco: IEventStoreInterconnector;

    beforeEach(() => {
        interco = new EventStoreInterconnector()
    });

    it('should work', () => {
        expect(interco).toBeTruthy();
    })
})
