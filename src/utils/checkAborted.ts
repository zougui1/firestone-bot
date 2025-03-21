export const checkAborted = (signal: AbortSignal) => {
  if (signal.aborted) {
    throw new Error(signal.reason ? `Aborted: ${signal.reason}` : 'Aborted');
  }
}
