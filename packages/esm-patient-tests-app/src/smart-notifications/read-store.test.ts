import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readStorageKey } from './constants';
import { _resetReadStore, getReadNotifications, markNotificationRead, setReadUser } from './read-store';

const userUuid = 'user-uuid-1';

describe('read store', () => {
  beforeEach(() => {
    localStorage.clear();
    _resetReadStore();
  });

  it('persists a read notification under the signed-in user key', () => {
    setReadUser(userUuid);
    markNotificationRead('notification-1');

    expect(JSON.parse(localStorage.getItem(readStorageKey(userUuid)))).toHaveProperty('notification-1');
  });

  it('reloads a user’s read state from storage when they sign in', () => {
    localStorage.setItem(readStorageKey(userUuid), JSON.stringify({ 'notification-9': '2026-06-29T09:00:00.000Z' }));

    setReadUser(userUuid);

    expect(getReadNotifications()).toHaveProperty('notification-9');
  });

  it('does not leak one user’s read state to the next user on a shared workstation', () => {
    setReadUser(userUuid);
    markNotificationRead('notification-1');

    setReadUser('user-uuid-2');

    expect(getReadNotifications()).toEqual({});
  });

  it('keeps the first read timestamp when the same notification is opened again', () => {
    vi.useFakeTimers();
    setReadUser(userUuid);
    vi.setSystemTime(new Date('2026-06-29T09:00:00.000Z'));
    markNotificationRead('notification-1');
    const first = getReadNotifications()['notification-1'];

    vi.setSystemTime(new Date('2026-06-29T10:00:00.000Z'));
    markNotificationRead('notification-1');

    expect(getReadNotifications()['notification-1']).toBe(first);
    vi.useRealTimers();
  });

  it('tolerates corrupt storage rather than breaking the bell', () => {
    localStorage.setItem(readStorageKey(userUuid), 'not json');

    setReadUser(userUuid);

    expect(getReadNotifications()).toEqual({});
  });

  it('keeps the read state in memory when localStorage refuses the write', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    setReadUser(userUuid);
    markNotificationRead('notification-1');

    expect(getReadNotifications()).toHaveProperty('notification-1');
    setItem.mockRestore();
  });
});
