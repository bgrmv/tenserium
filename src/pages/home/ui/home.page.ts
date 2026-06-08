import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TenseCardComponent } from '@entities/tense';

@Component({
  selector: 'app-home-page',
  imports: [TenseCardComponent],
  template: `
    <div class="container">
      <!-- Tense blocks -->
      <div id="present">Present</div>
      <div id="past">Past</div>
      <div id="future">Future</div>

      <!-- Tense categories -->
      <div id="simple">Simple</div>
      <div id="continuous">Continuous</div>
      <div id="perfect">Perfect</div>
      <div id="perfect-continuous">Perfect Continuous</div>

      <!-- Present Tenses -->
      <app-tense-card />

      <div id="present-continuous">Present Continuous</div>
      <div id="present-perfect">Present Perfect</div>
      <div id="present-perfect-continuous">Present Perfect Continuous</div>

      <!-- Past Tenses -->
      <div id="past-simple">Past Simple</div>
      <div id="past-continuous">Past Continuous</div>
      <div id="past-perfect">Past Perfect</div>
      <div id="past-perfect-continuous">Past Perfect Continuous</div>

      <!-- Future Tenses -->
      <div id="future-simple">Future Simple</div>
      <div id="future-continuous">Future Continuous</div>
      <div id="future-perfect">Future Perfect</div>
      <div id="future-perfect-continuous">Future Perfect Continuous</div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .container {
      height: 97vh;
      display: grid;
      grid-template-rows: 200px repeat(3, 1fr);
      grid-template-columns: 300px repeat(4, 1fr);
      gap: 0.3vh 0.3vw;
      grid-template-areas:
        '. simple continuous perfect perfect-continuous'
        'present present-simple present-continuous present-perfect present-perfect-continuous'
        'past past-simple past-continuous past-perfect past-perfect-continuous'
        'future future-simple future-continuous future-perfect future-perfect-continuous';
      justify-content: space-evenly;
      align-content: space-evenly;
      > div {
        border: 1px solid black;
      }
    }

    #present { grid-area: present; }
    #past { grid-area: past; }
    #future { grid-area: future; }
    #simple { grid-area: simple; }
    #continuous { grid-area: continuous; }
    #perfect { grid-area: perfect; }
    #perfect-continuous { grid-area: perfect-continuous; }

    app-tense-card { grid-area: present-simple; }

    #present-continuous { grid-area: present-continuous; }
    #present-perfect { grid-area: present-perfect; }
    #present-perfect-continuous { grid-area: present-perfect-continuous; }

    #past-simple { grid-area: past-simple; }
    #past-continuous { grid-area: past-continuous; }
    #past-perfect { grid-area: past-perfect; }
    #past-perfect-continuous { grid-area: past-perfect-continuous; }

    #future-simple { grid-area: future-simple; }
    #future-continuous { grid-area: future-continuous; }
    #future-perfect { grid-area: future-perfect; }
    #future-perfect-continuous { grid-area: future-perfect-continuous; }
  `,
})
export class HomePageComponent {}
