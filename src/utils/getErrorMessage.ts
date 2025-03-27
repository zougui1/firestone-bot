const indent = (text: string): string => {
  return text
    .split('\n')
    .map((line, index) => index ? `  ${line}` : line)
    .join('\n');
}

export const getErrorMessage = (value: unknown, defaultErrorMessage = 'An error occured'): string => {
  if (!value) {
    return defaultErrorMessage;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value !== 'object' || !('message' in value) || typeof value.message !== 'string') {
    return defaultErrorMessage;
  }

  if (!(value instanceof Error)) {
    return value.message;
  }

  if (!value.cause) {
    return `${value.name}: ${value.message}`;
  }

  return `${value.name}: ${value.message}\n  [cause]: ${indent(getErrorMessage(value.cause))}`;
}
