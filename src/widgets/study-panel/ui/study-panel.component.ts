import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  resource,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { getTense } from '@shared/config/tenses.config';
import { tenseColor } from '@shared/config/tense-colors';
import type { TenseId } from '@shared/types';
import type { ResultState } from '@widgets/question-card';
import type { LearnContent } from '@entities/learn';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-study-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './study-panel.component.html',
  styleUrl: './study-panel.component.css',
})
export class StudyPanelComponent {
  private readonly http = inject(HttpClient);

  readonly correctId = input.required<TenseId>();
  readonly result = input.required<ResultState>();
  readonly pickedId = input<TenseId | null>(null);
  readonly explanation = input<{ en: string; ru?: string } | undefined>(undefined);

  readonly next = output<void>();

  protected readonly content = resource<LearnContent, TenseId>({
    params: () => this.correctId(),
    loader: ({ params }) =>
      firstValueFrom(this.http.get<LearnContent>(`assets/learn/${params}.json`)),
  });

  protected readonly tenseConf = computed(() => getTense(this.correctId()));
  protected readonly color = computed(() => tenseColor(this.tenseConf(), 'aspect'));
  protected readonly tenseName = computed(() => this.tenseConf().name);

  protected readonly pickedName = computed(() => {
    const id = this.pickedId();
    return id && id !== this.correctId() ? getTense(id).name : null;
  });
}
