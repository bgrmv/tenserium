import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tense-card',
  imports: [RouterLink],
  templateUrl: './tense-card.component.html',
  styleUrl: './tense-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenseCardComponent {}
