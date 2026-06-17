import { TestBed } from '@angular/core/testing';
import { UserStore } from './user.store';
import { StorageService } from '@shared/api/storage.service';

/** In-memory StorageService stub — the test runner has no localStorage. */
class FakeStorage {
  readonly map = new Map<string, unknown>();
  load<T>(key: string, fallback: T): T {
    return this.map.has(key) ? (this.map.get(key) as T) : fallback;
  }
  save<T>(key: string, value: T): void {
    this.map.set(key, value);
  }
  clear(key: string): void {
    this.map.delete(key);
  }
}

function makeStore(seed?: Record<string, unknown>): {
  store: UserStore;
  storage: FakeStorage;
} {
  const storage = new FakeStorage();
  if (seed) storage.map.set('user:profile', seed);
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [UserStore, { provide: StorageService, useValue: storage }],
  });
  return { store: TestBed.inject(UserStore), storage };
}

describe('UserStore', () => {
  it('starts with the default guest profile', () => {
    const { store } = makeStore();
    expect(store.profile().nickname).toBe('Guest');
    expect(store.scoreDisplayPreference()).toBe('none');
    expect(store.avatarHue()).toBe(210);
  });

  it('setScoreDisplayPreference updates and persists', () => {
    const { store, storage } = makeStore();
    store.setScoreDisplayPreference('ielts');
    expect(store.scoreDisplayPreference()).toBe('ielts');
    expect(
      (storage.map.get('user:profile') as { scoreDisplayPreference: string })
        .scoreDisplayPreference,
    ).toBe('ielts');
  });

  it('setAvatarHue updates and persists', () => {
    const { store, storage } = makeStore();
    store.setAvatarHue(305);
    expect(store.avatarHue()).toBe(305);
    expect(
      (storage.map.get('user:profile') as { avatarHue: number }).avatarHue,
    ).toBe(305);
  });

  it('merges defaults over a legacy profile missing new fields', () => {
    const { store } = makeStore({
      id: 'local',
      nickname: 'Legacy',
      rankPoints: 50,
    });
    expect(store.profile().nickname).toBe('Legacy');
    expect(store.profile().rankPoints).toBe(50);
    expect(store.avatarHue()).toBe(210);
    expect(store.scoreDisplayPreference()).toBe('none');
  });
});
