import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Reduce noise in development
  enabled: process.env.NODE_ENV === "production",

  // Capture 10% of transactions for performance monitoring
  tracesSampleRate: 0.1,

  // Capture 100% of errors
  sampleRate: 1.0,

  // Ignore common non-actionable errors
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    "Non-Error promise rejection captured",
    /^Network Error$/,
    /^Request failed with status code 4/,
  ],

  beforeSend(event) {
    // Strip PII from breadcrumbs
    if (event.breadcrumbs?.values) {
      event.breadcrumbs.values = Array.from(event.breadcrumbs.values).map(
        (b: Sentry.Breadcrumb) => ({
          ...b,
          data: b.data ? { ...(b.data as Record<string, unknown>), email: "[redacted]" } : b.data,
        })
      );
    }
    return event;
  },
});
