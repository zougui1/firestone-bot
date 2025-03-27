const reDuration = /^(\d{1,2}[:;,.]){0,2}\d{1,2}$/;

export const durationToSeconds = (duration: string) => {
  duration = duration.trim();

  if (!reDuration.test(duration)) {
    return;
  }

  const parts = duration.split(':').map(Number);

  switch (parts.length) {
    // ss
    case 1:
      return parts[0];
    // mm:ss
    case 2:
      return parts[0] * 60 + parts[1];
    // hmm:mm:ss
    case 3:
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
}
