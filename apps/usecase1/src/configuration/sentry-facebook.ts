import { registerAs } from '@nestjs/config';
import { SentryModuleOptions } from '@ntegral/nestjs-sentry';

export const sentryForFacebookConfiguration: SentryModuleOptions = {
  dsn:
    process.env.SENTRY_ENV && process.env.SENTRY_ENV !== 'psessentials-local'
      ? process.env.SENTRY_DSN
      : null, // Null means no Sentry logging.
  debug: process.env.SENTRY_ENV !== 'production', // Only for non prod envs (QA, staging, local)
  environment: process.env.SENTRY_ENV,
  release: process.env.VERSION || '',
};
export default registerAs(
  'sentry-facebook',
  () => sentryForFacebookConfiguration,
);
