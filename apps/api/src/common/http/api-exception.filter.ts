import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';

interface ErrorBody {
  code?: string;
  message?: string | string[];
}

interface HttpResponse {
  status(statusCode: number): HttpResponse;
  json(body: unknown): void;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<HttpResponse>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : undefined;
    const body =
      typeof exceptionResponse === 'object'
        ? (exceptionResponse as ErrorBody)
        : undefined;
    const messages = Array.isArray(body?.message) ? body.message : undefined;

    if (!isHttpException) {
      this.logger.error('Unhandled API exception');
    }

    response.status(status).json({
      data: null,
      error: {
        code:
          body?.code ??
          (status === HttpStatus.BAD_REQUEST
            ? 'VALIDATION_FAILED'
            : status === HttpStatus.TOO_MANY_REQUESTS
              ? 'RATE_LIMITED'
              : isHttpException
                ? 'REQUEST_FAILED'
                : 'INTERNAL_ERROR'),
        details: messages ? { messages } : null,
        message:
          typeof body?.message === 'string'
            ? body.message
            : isHttpException
              ? exception.message
              : 'An unexpected error occurred',
      },
      success: false,
    });
  }
}
