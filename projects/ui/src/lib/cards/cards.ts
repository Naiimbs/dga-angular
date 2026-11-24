import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
} from '@angular/core';

export type DgaCardType = 'default' | 'expandable' | 'selectable';
export type DgaCardEffect = 'shadow' | 'no-shadow' | 'stroke';
export type DgaCardStarState = 'filled' | 'half' | 'empty';

let nextCardId = 0;

/** Image slot: `<div dgaCardImage><img src="…" alt="" /></div>`. */
@Directive({ selector: '[dgaCardImage]', host: { class: 'card-image' } })
export class DgaCardImage {}

/** Featured icon slot: `<div dgaCardIcon><dga-icon name="…" /></div>`. */
@Directive({ selector: '[dgaCardIcon]', host: { class: 'card-icon' } })
export class DgaCardIcon {}

/** Custom component slot rendered between the content and the tags row. */
@Directive({ selector: '[dgaCardCustom]', host: { class: 'card-custom' } })
export class DgaCardCustom {}

/** Tags row slot. */
@Directive({ selector: '[dgaCardTags]', host: { class: 'card-tags' } })
export class DgaCardTags {}

/** Footer slot holding the action buttons. */
@Directive({ selector: '[dgaCardActions]', host: { class: 'card-footer' } })
export class DgaCardActions {}

/**
 * DGA card. The host element is the `.card` surface.
 *
 *   <dga-card heading="Title" description="Body" icon="checkmark-circle-02">
 *     <div dgaCardActions>
 *       <button dga-button variant="secondary-outline">Cancel</button>
 *       <button dga-button>Save</button>
 *     </div>
 *   </dga-card>
 *
 *   <dga-card type="selectable" [(selected)]="picked" heading="Option A" />
 *   <dga-card type="expandable" [(expanded)]="open" heading="Details" />
 *
 * Slots: `[dgaCardImage]`, `[dgaCardIcon]`, default content (inside
 * `.card-content`, after the heading and description), `[dgaCardCustom]`,
 * `[dgaCardTags]`, `[dgaCardActions]`.
 */
@Component({
  selector: 'dga-card',
  templateUrl: './cards.html',
  styleUrl: './cards.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'type() === "selectable" ? "checkbox" : "article"',
    '[attr.tabindex]': 'interactive() ? (disabled() ? -1 : 0) : null',
    '[attr.aria-checked]': 'type() === "selectable" ? selected() : null',
    '[attr.aria-expanded]': 'type() === "expandable" ? expanded() : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.aria-labelledby]': 'heading() ? titleId : null',
    '(click)': 'toggle()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class DgaCard {
  readonly type = input<DgaCardType>('default');
  readonly effect = input<DgaCardEffect>('shadow');
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Card title, rendered as `<h3 class="card-title">`. */
  readonly heading = input('');
  /** Body copy, rendered as `<p class="card-body">`. */
  readonly description = input('');
  /** Font icon name (without `dga-icon-`) for the featured icon. */
  readonly icon = input('');
  /** Image URL for the image slot. */
  readonly image = input('');
  readonly imageAlt = input('');

  /** Star rating (0–`ratingMax`, halves supported). `null` hides the rating. */
  readonly rating = input<number | null>(null);
  readonly ratingMax = input(5);
  /** Text under the stars, e.g. "12 reviews". */
  readonly ratingCount = input('');
  /** Accessible label of the stars. Defaults to "<rating> out of <max>". */
  readonly ratingLabel = input('');

  /** Selected state of a selectable card. */
  readonly selected = model(false);
  /** Expanded state of an expandable card. */
  readonly expanded = model(false);

  readonly expandLabel = input('Expand card');
  readonly collapseLabel = input('Collapse card');

  protected readonly titleId = `dga-card-title-${nextCardId++}`;

  protected readonly interactive = computed(() => this.type() !== 'default');

  protected readonly classes = computed(() => {
    const type = this.type();
    const effect = this.effect();
    const list = ['card'];
    if (effect !== 'shadow') list.push(`card--${effect}`);
    if (type !== 'default') list.push(`card--${type}`);
    if (type === 'selectable' && this.selected()) list.push('card--selected');
    if (type === 'expandable' && this.expanded()) list.push('card--expanded');
    if (this.disabled()) list.push('card--disabled');
    return list.join(' ');
  });

  protected readonly stars = computed<DgaCardStarState[]>(() => {
    const score = this.rating();
    if (score === null) return [];
    const result: DgaCardStarState[] = [];
    for (let i = 1; i <= this.ratingMax(); i++) {
      if (i <= Math.floor(score)) result.push('filled');
      else if (i - 0.5 <= score) result.push('half');
      else result.push('empty');
    }
    return result;
  });

  protected readonly starsLabel = computed(
    () => this.ratingLabel() || `${this.rating()} out of ${this.ratingMax()}`,
  );

  /** Toggles the selected / expanded state (no-op for default or disabled cards). */
  toggle(): void {
    if (this.disabled()) return;
    const type = this.type();
    if (type === 'selectable') this.selected.update((v) => !v);
    else if (type === 'expandable') this.expanded.update((v) => !v);
  }

  protected onKeydown(event: KeyboardEvent): void {
    // Only keys pressed on the card itself, not on controls inside it.
    if (event.target !== event.currentTarget || !this.interactive()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle();
    }
  }
}
