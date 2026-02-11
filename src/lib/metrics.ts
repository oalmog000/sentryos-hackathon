import * as Sentry from '@sentry/nextjs'

// Metrics wrapper that provides a fallback if metrics API is not available
export const metrics = {
  increment: (name: string, value: number = 1, options?: { tags?: Record<string, string> }) => {
    // If metrics API is available, use it
    if (Sentry.metrics && typeof Sentry.metrics.increment === 'function') {
      Sentry.metrics.increment(name, value, options)
    } else {
      // Fallback: log as breadcrumb with metric data
      Sentry.addBreadcrumb({
        category: 'metric',
        message: `Metric: ${name}`,
        level: 'debug',
        data: { metric: name, value, type: 'increment', ...options?.tags }
      })
    }
  },

  gauge: (name: string, value: number, options?: { tags?: Record<string, string> }) => {
    if (Sentry.metrics && typeof Sentry.metrics.gauge === 'function') {
      Sentry.metrics.gauge(name, value, options)
    } else {
      Sentry.addBreadcrumb({
        category: 'metric',
        message: `Metric: ${name}`,
        level: 'debug',
        data: { metric: name, value, type: 'gauge', ...options?.tags }
      })
    }
  },

  distribution: (name: string, value: number, options?: { tags?: Record<string, string>; unit?: string }) => {
    if (Sentry.metrics && typeof Sentry.metrics.distribution === 'function') {
      Sentry.metrics.distribution(name, value, options)
    } else {
      Sentry.addBreadcrumb({
        category: 'metric',
        message: `Metric: ${name}`,
        level: 'debug',
        data: { metric: name, value, type: 'distribution', unit: options?.unit, ...options?.tags }
      })
    }
  },
}
