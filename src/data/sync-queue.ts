import { SyncOperation } from '../domain/types';

export interface QueueStorage {
  load(): Promise<SyncOperation[]>;
  save(operations: SyncOperation[]): Promise<void>;
}

export function createSyncQueue(storage: QueueStorage) {
  return {
    async enqueue(operation: SyncOperation): Promise<void> {
      const operations = await storage.load();
      if (operations.some((item) => item.clientOperationId === operation.clientOperationId)) {
        return;
      }
      await storage.save([...operations, operation]);
    },

    async getPending(): Promise<SyncOperation[]> {
      return storage.load();
    },

    async remove(operationId: string): Promise<void> {
      const operations = await storage.load();
      await storage.save(operations.filter((operation) => operation.id !== operationId));
    },
  };
}
