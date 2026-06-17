import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProfilePageComponent } from './profile.page';

describe('ProfilePageComponent', () => {
  let fixture: ComponentFixture<ProfilePageComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePageComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePageComponent);
    el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('renders the four profile sections', () => {
    expect(el.querySelector('#overview')).toBeTruthy();
    expect(el.querySelector('#statistics')).toBeTruthy();
    expect(el.querySelector('#settings')).toBeTruthy();
    expect(el.querySelector('#account')).toBeTruthy();
  });

  it('shows the default guest nickname in the hero', () => {
    expect(el.querySelector('.hero-name')?.textContent).toContain('Guest');
  });

  it('shows an empty state when there is no last session', () => {
    expect(el.querySelector('.empty')).toBeTruthy();
  });
});
