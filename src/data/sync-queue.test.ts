import { SyncOperation } from '../domain/types';
import { createSyncQueue, QueueStorage } from './sync-queue';

function createMemoryStorage(initialOperations: SyncOperation[] = []): QueueStorage {
  let operations = initialOperations;
  return {
    async load() {
      return operations;
    },
    async save(nextOperations) {
      operations = nextOperations;
    },
  };
}

const operation: SyncOperation = {
  id: 'operation-1',
  entity: 'expense',
  entityId: 'expense-1',
  action: 'upsert',
  clientOperationId: 'client-1',
  payloadJson: '{}',
  createdAt: '2026-09-17T10:00:00.000Z',
};

describe('sync queue', () => {
  test('keeps an offline operation available for later synchronization', async () => {
    const queue = createSyncQueue(createMemoryStorage());

    await queue.enqueue(operation);

    await expect(queue.getPending()).resolves.toEqual([operation]);
  });

  test('does not duplicate an operation with the same client id', async () => {
    const queue = createSyncQueue(createMemoryStorage());

    await queue.enqueue(operation);
    await queue.enqueue({ ...operation, id: 'operation-2' });

    await expect(queue.getPending()).resolves.toEqual([operation]);
  });
});
