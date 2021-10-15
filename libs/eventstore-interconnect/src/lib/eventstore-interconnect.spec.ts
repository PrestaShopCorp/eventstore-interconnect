import { eventstoreInterconnect } from './eventstore-interconnect';

describe('eventstoreInterconnect', () => {
    it('should work', () => {
        expect(eventstoreInterconnect()).toEqual('eventstore-interconnect');
    })
})