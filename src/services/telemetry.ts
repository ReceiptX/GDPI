import { trace, context, SpanStatusCode } from '@opentelemetry/api';

// Simple tracer wrapper for React Native
// Note: Full OpenTelemetry SDK setup would be in App.tsx
class TelemetryService {
  private tracer;
  private enabled: boolean;

  constructor() {
    this.tracer = trace.getTracer('gdpi-app', '1.0.0');
    this.enabled = true; // Can be controlled by env var
  }

  async traceOperation<T>(
    operationName: string,
    attributes: Record<string, string | number | boolean>,
    operation: () => Promise<T>
  ): Promise<T> {
    if (!this.enabled) {
      return operation();
    }

    const span = this.tracer.startSpan(operationName, {
      attributes,
    });

    try {
      const result = await context.with(trace.setSpan(context.active(), span), operation);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  traceNavigation(screenName: string, params?: Record<string, any>) {
    if (!this.enabled) return;

    const span = this.tracer.startSpan('navigation', {
      attributes: {
        'screen.name': screenName,
        'screen.params': params ? JSON.stringify(params) : '',
      },
    });
    span.end();
  }

  traceAICall(operation: string, inputLength: number) {
    if (!this.enabled) return;

    const span = this.tracer.startSpan('ai.call', {
      attributes: {
        'ai.operation': operation,
        'ai.input_length': inputLength,
      },
    });
    span.end();
  }

  traceStorageOperation(operation: string, key: string) {
    if (!this.enabled) return;

    const span = this.tracer.startSpan('storage.operation', {
      attributes: {
        'storage.operation': operation,
        'storage.key': key,
      },
    });
    span.end();
  }
}

export const telemetry = new TelemetryService();
