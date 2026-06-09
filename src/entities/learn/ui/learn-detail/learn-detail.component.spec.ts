import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LearnDetailComponent } from './learn-detail.component';
import { LearnRepository, type LearnContent } from '../../api/learn.repository';
import type { TenseId } from '@shared/types';

const MOCK_CONTENT: LearnContent = {
  tenseId: 'past-simple' as TenseId,
  formula: ['S + V2', 'S + did not + V1', 'Did + S + V1?'],
  structure: {
    affirmative: 'Subject + V2',
    negative: 'Subject + did not + V1',
    question: 'Did + Subject + V1?',
  },
  usage: [{ icon: 'clock', text: 'Finished action in the past' }],
  examples: [
    { pre: 'She ', verb: 'visited', post: ' Paris last year.' },
  ],
  markers: ['yesterday', 'last year', 'ago'],
  faq: [{ q: 'Past Simple vs Past Continuous?', a: 'Simple = complete action.' }],
};

function makeMockRepo(opts: { loading?: boolean; value?: LearnContent | null } = {}) {
  return {
    tenseId: signal<TenseId | null>(null),
    content: {
      value: signal<LearnContent | null>(opts.value ?? null),
      isLoading: signal(opts.loading ?? false),
    },
  };
}

describe('LearnDetailComponent', () => {
  let fixture: ComponentFixture<LearnDetailComponent>;
  let el: HTMLElement;
  let mockRepo: ReturnType<typeof makeMockRepo>;

  function setTenseId(id: TenseId): void {
    fixture.componentRef.setInput('tenseId', id);
    fixture.detectChanges();
  }

  async function setup(opts: { loading?: boolean; value?: LearnContent | null } = {}) {
    mockRepo = makeMockRepo(opts);
    await TestBed.configureTestingModule({
      imports: [LearnDetailComponent],
      providers: [
        { provide: LearnRepository, useValue: mockRepo },
        provideRouter([]),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LearnDetailComponent);
    el = fixture.nativeElement;
  }

  describe('Loading state', () => {
    beforeEach(async () => {
      await setup({ loading: true });
      setTenseId('past-simple');
    });

    it('shows loading indicator while content is loading', () => {
      expect(el.querySelector('.muted')?.textContent).toContain('Loading');
    });

    it('does not render content sections while loading', () => {
      expect(el.querySelector('.cols')).toBeNull();
    });
  });

  describe('Content rendering', () => {
    beforeEach(async () => {
      await setup({ value: MOCK_CONTENT });
      setTenseId('past-simple');
    });

    it('renders the tense name as a heading', () => {
      expect(el.querySelector('.title')?.textContent).toContain('Past Simple');
    });

    it('renders the aspect and time period in the eyebrow', () => {
      const eyebrow = el.querySelector('.eyebrow')?.textContent ?? '';
      expect(eyebrow).toContain('simple');
      expect(eyebrow).toContain('past');
    });

    it('renders a formula chip for each formula entry', () => {
      const chips = el.querySelectorAll('.chip');
      expect(chips.length).toBe(MOCK_CONTENT.formula.length);
      expect(chips[0].textContent).toContain('S + V2');
    });

    it('renders the structure affirmative/negative/question rows', () => {
      const rows = el.querySelectorAll('.struct-row');
      expect(rows.length).toBe(3);
      expect(rows[0].querySelector('.struct-aff')).not.toBeNull();
      expect(rows[1].querySelector('.struct-neg')).not.toBeNull();
      expect(rows[2].querySelector('.struct-q')).not.toBeNull();
    });

    it('renders usage items', () => {
      const items = el.querySelectorAll('.usage-item');
      expect(items.length).toBe(MOCK_CONTENT.usage.length);
      expect(items[0].textContent).toContain('Finished action in the past');
    });

    it('renders examples with highlighted verb', () => {
      const examples = el.querySelectorAll('.examples li');
      expect(examples.length).toBe(MOCK_CONTENT.examples.length);
      const verb = examples[0].querySelector('b');
      expect(verb?.textContent).toBe('visited');
    });

    it('renders time-marker chips', () => {
      const markers = el.querySelectorAll('.marker');
      expect(markers.length).toBe(MOCK_CONTENT.markers.length);
      expect(markers[0].textContent?.trim()).toBe('yesterday');
    });

    it('renders FAQ accordion entries', () => {
      const items = el.querySelectorAll('.faq-item');
      expect(items.length).toBe(1);
      expect(items[0].querySelector('summary')?.textContent).toContain('Past Simple vs Past Continuous?');
    });
  });

  describe('Optional sections', () => {
    it('hides structure block when content has no structure', async () => {
      const noStructure: LearnContent = { ...MOCK_CONTENT, structure: undefined };
      await setup({ value: noStructure });
      setTenseId('past-simple');
      expect(el.querySelector('.structure')).toBeNull();
    });

    it('hides FAQ block when content has no faq', async () => {
      const noFaq: LearnContent = { ...MOCK_CONTENT, faq: undefined };
      await setup({ value: noFaq });
      setTenseId('past-simple');
      expect(el.querySelector('.faq')).toBeNull();
    });

    it('hides FAQ block when faq array is empty', async () => {
      const emptyFaq: LearnContent = { ...MOCK_CONTENT, faq: [] };
      await setup({ value: emptyFaq });
      setTenseId('past-simple');
      expect(el.querySelector('.faq')).toBeNull();
    });
  });

  describe('Navigation buttons', () => {
    beforeEach(async () => {
      await setup({ value: MOCK_CONTENT });
    });

    it('shows both prev and next for a middle tense', () => {
      setTenseId('past-simple'); // order 5, not first or last
      const navBtns = el.querySelectorAll('.nav-btn');
      expect(navBtns.length).toBe(2);
    });

    it('hides prev nav for the first tense (present-simple)', () => {
      setTenseId('present-simple'); // order 1
      const prev = el.querySelector('a.nav-btn:not(.nav-btn-next)');
      expect(prev).toBeNull();
    });

    it('hides next nav for the last tense (future-perfect-continuous)', () => {
      setTenseId('future-perfect-continuous'); // order 12
      const next = el.querySelector('.nav-btn-next');
      expect(next).toBeNull();
    });

    it('prev link points to the preceding tense', () => {
      setTenseId('past-simple'); // order 5, prev = present-perfect-continuous order 4
      const prev = el.querySelector<HTMLAnchorElement>('a.nav-btn:not(.nav-btn-next)');
      expect(prev?.getAttribute('href')).toContain('present-perfect-continuous');
    });

    it('next link points to the following tense', () => {
      setTenseId('past-simple'); // order 5, next = past-continuous order 6
      const next = el.querySelector<HTMLAnchorElement>('.nav-btn-next');
      expect(next?.getAttribute('href')).toContain('past-continuous');
    });
  });

  describe('Output events', () => {
    beforeEach(async () => {
      await setup({ value: MOCK_CONTENT });
      setTenseId('past-simple');
    });

    it('emits trainClick when Train button is clicked', () => {
      let emitted = false;
      fixture.componentInstance.trainClick.subscribe(() => (emitted = true));
      const btn = el.querySelector<HTMLButtonElement>('.btn-train');
      btn?.click();
      expect(emitted).toBe(true);
    });

    it('emits reportClick when Report error button is clicked', () => {
      let emitted = false;
      fixture.componentInstance.reportClick.subscribe(() => (emitted = true));
      const btn = el.querySelector<HTMLButtonElement>('.btn-report');
      btn?.click();
      expect(emitted).toBe(true);
    });
  });

  describe('Reactive tenseId sync', () => {
    beforeEach(async () => {
      await setup({ value: MOCK_CONTENT });
    });

    it('updates repo.tenseId when the tenseId input changes', () => {
      setTenseId('present-simple');
      expect(mockRepo.tenseId()).toBe('present-simple');

      setTenseId('past-simple');
      expect(mockRepo.tenseId()).toBe('past-simple');
    });

    it('re-renders title when tenseId input changes', () => {
      setTenseId('present-simple');
      expect(el.querySelector('.title')?.textContent).toContain('Present Simple');

      setTenseId('past-simple');
      expect(el.querySelector('.title')?.textContent).toContain('Past Simple');
    });
  });
});
