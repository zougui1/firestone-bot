import { BatchSpanProcessor, type ReadableSpan } from '@opentelemetry/sdk-trace-base';

import { hrTimeToMicroseconds } from '../utils';

export class SpanProcessor extends BatchSpanProcessor {
  onEnd(span: ReadableSpan): void {
    super.onEnd(span);
    const spanContext = span.spanContext();

    console.log('end span:', JSON.stringify({
      resource: {
        attributes: span.resource.attributes,
      },
      instrumentationScope: span.instrumentationLibrary,
      traceId: spanContext.traceId,
      parentId: span.parentSpanId,
      traceState: spanContext.traceState?.serialize(),
      name: span.name,
      id: spanContext.spanId,
      kind: span.kind,
      timestamp: hrTimeToMicroseconds(span.startTime),
      duration: hrTimeToMicroseconds(span.duration),
      attributes: span.attributes,
      status: span.status,
      events: span.events,
      links: span.links,
    }, null, 2));
  }
}
