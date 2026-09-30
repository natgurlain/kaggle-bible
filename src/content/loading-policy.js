/** Only the newest asynchronous operation may update the visible result state. */
export function createLatestTask() {
  let revision = 0;
  return {
    invalidate() { ++revision; },
    /**
     * @template T
     * @param {() => Promise<T>} operation
     * @param {{pending: () => void, complete: (value: T) => void, failed: (error: unknown) => void, settled: () => void}} callbacks
     */
    async run(operation, callbacks) {
      const current = ++revision;
      callbacks.pending();
      try {
        const result = await operation();
        if (current === revision) callbacks.complete(result);
      } catch (error) {
        if (current === revision) callbacks.failed(error);
      } finally {
        if (current === revision) callbacks.settled();
      }
    },
  };
}
