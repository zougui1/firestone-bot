import { z } from 'zod';

import { catchError } from './catchError';

export const jsonSchema = <T extends z.ZodType>(schema: T) => {
  return z.string().transform((str, ctx): z.infer<T> => {
    if (!str && schema.isOptional()) {
      return;
    }

    const [jsonError, data] = catchError(() => JSON.parse(str));

    if (jsonError) {
      ctx.addIssue({ code: 'custom', message: 'Cannot parse JSON' });
      return z.NEVER
    }

    const result = schema.safeParse(data);

    if (!result.success) {
      ctx.addIssue({ code: 'custom', message: 'Invalid data' });
      return z.NEVER
    }

    return result.data;
  });
}
