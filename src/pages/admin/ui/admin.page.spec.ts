import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPageComponent } from './admin.page';
import { AdminStore } from '../model/admin.store';

describe('AdminPageComponent', () => {
  let fixture: ComponentFixture<AdminPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPageComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders one sidebar button per visible tab', () => {
    const store = TestBed.inject(AdminStore);
    const buttons = fixture.nativeElement.querySelectorAll('.admin-tab');
    expect(buttons.length).toBe(store.visibleTabs().length);
  });

  it('renders the active tab heading', () => {
    const heading = fixture.nativeElement.querySelector('.admin-head h2');
    expect(heading.textContent).toContain('Users');
  });
});
