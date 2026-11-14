import { ROUTINE } from '../config.js';

// Rutina ditore (Faza 8): kur është ndezur, karakteri ndjek orën e lojës:
// punon në tavolinë, lexon, ecën, fle (tabela ROUTINE në config.js).
// Një klik i lojtarit e ndërpret rutinën deri te blloku tjetër i orarit.
// Rubrika "Animation / Interaction": një state machine e thjeshtë mbi orën.

const WANDER_PAUSE = 4; // s: sa pret në këmbë para se të ecë diku tjetër

export class Routine {
  /**
   * @param {object} o
   *  day        DayCycle (lexojmë day.hour)
   *  character  Character (lexojmë state)
   *  doAction(name)  shko te SPOTS[name] dhe vepro (main.js)
   *  wander()        ec drejt një pike të rastësishme (main.js)
   */
  constructor({ day, character, doAction, wander }) {
    this.day = day;
    this.character = character;
    this.doAction = doAction;
    this.wander = wander;
    this.enabled = false;
    this.block = -1; // indeksi i bllokut aktual në ROUTINE
    this.overridden = false; // lojtari klikoi: rutina pret bllokun tjetër
    this.idleTime = 0;
  }

  setEnabled(on) {
    this.enabled = on;
    this.block = -1; // që në update-in e ardhshëm të nisë veprimi i orës aktuale
    this.overridden = false;
  }

  /** Thirret kur lojtari klikon dyshemenë ose një objekt. */
  override() {
    if (this.enabled) this.overridden = true;
  }

  /** Blloku i fundit që ka nisur para orës `hour`. */
  blockAt(hour) {
    let index = 0;
    ROUTINE.forEach(([start], i) => {
      if (hour >= start) index = i;
    });
    return index;
  }

  /** Emri i veprimit tani, për HUD-in. */
  get action() {
    return ROUTINE[this.blockAt(this.day.hour)][1];
  }

  update(dt) {
    if (!this.enabled) return;
    const index = this.blockAt(this.day.hour);

    // Bllok i ri: harrojmë klikimin e lojtarit dhe nisim veprimin e ri
    if (index !== this.block) {
      this.block = index;
      this.overridden = false;
      this.run(ROUTINE[index][1]);
      return;
    }
    if (this.overridden) return;

    // "wander": pasi qëndron pak në këmbë, ecën diku tjetër
    if (ROUTINE[index][1] === 'wander' && this.character.state === 'idle') {
      this.idleTime += dt;
      if (this.idleTime > WANDER_PAUSE) this.run('wander');
    } else {
      this.idleTime = 0;
    }
  }

  run(action) {
    this.idleTime = 0;
    if (action === 'wander') this.wander();
    else this.doAction(action);
  }
}
