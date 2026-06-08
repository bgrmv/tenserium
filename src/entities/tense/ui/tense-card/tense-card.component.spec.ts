import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TenseCardComponent } from './tense-card.component';

describe('TenseCardComponent', () => {
  let component: TenseCardComponent;
  let fixture: ComponentFixture<TenseCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenseCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TenseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
