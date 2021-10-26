import { Injectable } from '@nestjs/common';
import { SafetyNet } from './safety-net.service.interface';

@Injectable()
export class DefaultSafetyNetService implements SafetyNet {
  public hook(): any {
    // this.sentry.withScope((scope: Sentry.Scope) => {
    //   scope.setUser({
    //     id: data?.shopId,
    //     username: `shop ${data?.shopId}`,
    //   });
    //   scope.setTags({
    //     shopId: data?.shopId,
    //     externalBusinessId: data?.externalBusinessId,
    //   });
    //   this.sentryService.error(err);
    // });

    process.exit(1);
  }
}
