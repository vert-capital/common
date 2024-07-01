import { z } from 'zod';
import { ErrorMessageOptions, generateErrorMessage } from 'zod-error';
import { errors } from '../constants/errors';
export type ErrorType = {
  message: string;
  code: number;
  details?: any;
};

const errorDefault = 'Tente novamente mais tarde.';

export function handleError(err: any): ErrorType {
  const defaultError = {
    message: errorDefault,
    code: 500,
  } as ErrorType;

  // Is error Go api
  if (err?.error && typeof err?.error == 'string') {
    return {
      ...defaultError,
      message: err?.error,
    };
  }

  if ((err?.message && err?.message?.issues) || err?.name === 'ZodError') {
    const issues = (err?.message?.issues || err?.issues) as z.ZodIssue[];
    const options: ErrorMessageOptions = {
      delimiter: {
        error: '\n',
        component: ' | ',
      },
      transform: ({ errorMessage, index }) =>
        `Error #${index + 1}: ${errorMessage}`,
    };
    const message = generateErrorMessage(issues, options);
    return {
      ...defaultError,
      ...{
        code: 400,
        message: issues.length > 1 ? errorDefault : message,
        details: issues.length > 1 ? message : undefined,
      },
    };
  }

  if (typeof err === 'string') {
    try {
      if (err.includes('<!DOCTYPE html>') || err.includes('<html>')) {
        return defaultError;
      }
      err = JSON.parse(err);
    } catch (_) {}
  }
  // Is string
  if (typeof err === 'string') {
    let message = '';
    try {
      message = errors[err] || err;
    } catch (error) {
      message = err;
    }

    return {
      ...defaultError,
      ...{
        message: message,
      },
    };
  }

  // Response error
  if (err?.statusText && typeof err?.statusText === 'string') {
    let message = '';
    try {
      message = errors[err.statusText] || err;
    } catch (error) {
      message = err.statusText;
    }

    return {
      ...defaultError,
      ...{
        message: message,
        code: err.code,
        details: err.data,
      },
    };
  }

  // Default error
  if (err?.message && typeof err?.message === 'string') {
    let message = '';
    try {
      message = errors[err.message] || err.message || defaultError.message;
    } catch (error) {
      message = err.message;
    }

    return {
      ...defaultError,
      ...{
        message: message,
        code: err.code || defaultError.code,
        details: err.data || err.stack || err.details,
      },
    };
  }

  // Others error
  if (err?.error?.message && typeof err?.error?.message === 'string') {
    let message = '';
    try {
      message = errors[err.error.message] || err;
    } catch (error) {
      message = err.error.message;
    }

    return {
      ...defaultError,
      ...{
        message: message,
        code: err.error.code,
      },
    };
  }

  return defaultError;
}
