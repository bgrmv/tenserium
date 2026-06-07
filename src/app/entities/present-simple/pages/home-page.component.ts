import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-present-simple-page',
  imports: [RouterModule, RouterOutlet],
  template: `
    <ul>
      <li><a [routerLink]="['/', 'home']">Home</a></li>
      <li><a [routerLink]="['/', 'present-simple', 'learn']">Learn</a></li>
      <li><a [routerLink]="['/', 'present-simple', 'exam']">Exam</a></li>
    </ul>

    <h1>Present Simple Tense</h1>
    <router-outlet />
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class HomePageComponent {}
