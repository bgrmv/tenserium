import { TestBed } from '@angular/core/testing';
import { AdminStore } from './admin.store';

describe('AdminStore', () => {
  let store: AdminStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(AdminStore);
  });

  it('shows all tabs for the admin role by default', () => {
    expect(store.role()).toBe('admin');
    expect(store.visibleTabs().length).toBe(11);
  });

  it('restricts visible tabs to those the support role may see', () => {
    store.setRole('support');
    const ids = store.visibleTabs().map((t) => t.id);
    expect(ids).toEqual(['reports', 'feedback']);
  });

  it('falls back to the first visible tab when the role hides the active one', () => {
    expect(store.activeTab()?.id).toBe('users');
    store.setRole('support');
    expect(store.activeTab()?.id).toBe('reports');
  });

  it('keeps the active tab when it is still visible after a role change', () => {
    store.setTab('reports');
    store.setRole('moderator');
    expect(store.activeTab()?.id).toBe('reports');
  });

  it('only the admin role may delete users', () => {
    expect(store.canDeleteUsers()).toBe(true);
    store.setRole('moderator');
    expect(store.canDeleteUsers()).toBe(false);
  });

  it('derives counts from mock data', () => {
    expect(store.draftCount()).toBe(2);
    expect(store.openReportCount()).toBe(5);
    expect(store.unreadFeedbackCount()).toBe(3);
  });

  it('exposes meta for the active tab', () => {
    expect(store.meta().title).toBe('Users');
    store.setTab('audit');
    expect(store.meta().title).toBe('Audit Log');
  });
});
