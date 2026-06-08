import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { tenseCssVars } from '@shared/config/tense-colors';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.component.css',
})
export class AppComponent {
  constructor() {
    const doc = inject(DOCUMENT);
    const vars = tenseCssVars('aspect');
    Object.entries(vars).forEach(([k, v]) => doc.documentElement.style.setProperty(k, v));
  }
}
