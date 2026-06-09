import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  input,
  signal,
} from '@angular/core';
import type { DailyResult } from '@entities/daily';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'app-daily-share',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './daily-share.component.html',
  styleUrl: './daily-share.component.css',
})
export class DailyShareComponent implements OnInit {
  readonly result = input.required<DailyResult>();

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  protected readonly copied = signal(false);
  protected readonly canShare = signal(typeof navigator !== 'undefined' && !!navigator.share);

  protected readonly emojiPattern = computed(() =>
    this.result().answers.map((c) => (c ? '🟩' : '🟥')).join(''),
  );

  protected readonly accuracyPct = computed(() =>
    Math.round(this.result().accuracy * 100),
  );

  ngOnInit(): void {
    this.drawCard();
  }

  private drawCard(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 600;
    const H = 300;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = '#0f1117';
    ctx.fillRect(0, 0, W, H);

    // Accent line top
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, '#5b7cf6');
    grad.addColorStop(1, '#a78bfa');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 4);

    // Title
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 28px "Space Grotesk", system-ui, sans-serif';
    ctx.fillText('Tenserium · Daily Challenge', 32, 56);

    // Date
    ctx.fillStyle = '#6b7280';
    ctx.font = '15px "IBM Plex Sans", system-ui, sans-serif';
    ctx.fillText(this.result().date, 32, 82);

    // Score
    ctx.fillStyle = '#a78bfa';
    ctx.font = 'bold 56px "Space Grotesk", system-ui, sans-serif';
    ctx.fillText(String(this.result().score), 32, 160);

    ctx.fillStyle = '#6b7280';
    ctx.font = '14px "IBM Plex Sans", system-ui, sans-serif';
    ctx.fillText('points', 32, 180);

    // Accuracy
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 36px "Space Grotesk", system-ui, sans-serif';
    ctx.fillText(`${this.accuracyPct()}%`, 200, 160);
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px "IBM Plex Sans", system-ui, sans-serif';
    ctx.fillText('accuracy', 200, 180);

    // Correct / total
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 36px "Space Grotesk", system-ui, sans-serif';
    ctx.fillText(`${this.result().correct}/${this.result().total}`, 340, 160);
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px "IBM Plex Sans", system-ui, sans-serif';
    ctx.fillText('correct', 340, 180);

    // Emoji pattern
    ctx.font = '22px serif';
    const pattern = this.result().answers.map((c) => (c ? '🟩' : '🟥')).join(' ');
    ctx.fillText(pattern, 32, 240);

    // Footer
    ctx.fillStyle = '#374151';
    ctx.font = '13px "IBM Plex Sans", system-ui, sans-serif';
    ctx.fillText('tenserium.netlify.app', 32, 280);
  }

  protected async share(): Promise<void> {
    const text = this.buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Tenserium Daily', text });
      } catch {
        /* user cancelled */
      }
    } else {
      await this.copyToClipboard(text);
    }
  }

  protected async copy(): Promise<void> {
    await this.copyToClipboard(this.buildShareText());
  }

  private buildShareText(): string {
    const r = this.result();
    const pattern = r.answers.map((c) => (c ? '🟩' : '🟥')).join('');
    return (
      `Tenserium Daily ${r.date}\n` +
      `${pattern}\n` +
      `Score: ${r.score} · ${Math.round(r.accuracy * 100)}% accuracy\n` +
      `tenserium.netlify.app/daily`
    );
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }
}
