import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-present-simple-learn-page',
  imports: [],
  template: `
    <h1>Learn</h1>

    <h2>Grammar Rules</h2>
    <ul>
      <li>Used for general facts, habits, and routines.</li>
      <li>Formed with the base verb (+s/es for third-person singular).</li>
      <li>Negative form: "do/does not + base verb" (e.g., He does not like coffee.)</li>
      <li>Question form: "Do/Does + subject + base verb" (e.g., Does she play tennis?)</li>
    </ul>

    <h2>Examples</h2>
    <ul>
      <li>I eat breakfast at 7 AM.</li>
      <li>She goes to work every day.</li>
      <li>They do not like spicy food.</li>
      <li>Does he play football?</li>
    </ul>

    <h2>Time Markers</h2>
    <ul>
      <li>Always, usually, often, sometimes, rarely, never.</li>
      <li>Every day, every week, every month.</li>
      <li>On Mondays, in the morning, at night.</li>
    </ul>

    <h2>Context</h2>
    <p>The Present Simple tense is mainly used for:</p>
    <ul>
      <li>Habitual actions (e.g., I go to the gym on Fridays.)</li>
      <li>General truths (e.g., The sun rises in the east.)</li>
      <li>Fixed schedules (e.g., The train leaves at 6 PM.)</li>
    </ul>

    <h2>FAQ</h2>
    <div class="faq">
      <h3>When should I use Present Simple?</h3>
      <p>Use it for habits, general facts, and schedules.</p>

      <h3>How do I form negatives?</h3>
      <p>Use "do not" (don't) or "does not" (doesn't) before the base verb.</p>

      <h3>What should I keep in mind?</h3>
      <p>Remember to add -s/-es for third-person singular subjects (he, she, it).</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ``,
})
export class PresentSimpleLearnPageComponent {}
