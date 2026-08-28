export const logger = {
  info: (...args: unknown[]) => {
    if (import.meta.env.DEV) console.log(...args);
  },
  error: (...args: unknown[]) => {
    if (import.meta.env.DEV) console.error(...args);
  },
};
