import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

export type DgaButtonVariant =
  | 'neutral'
  | 'primary'
  | 'secondary-solid'
  | 'secondary-outline'
  | 'subtle'
  | 'transparent';

export type DgaButtonSize = 'large' | 'medium' | 'small';

/**
 * DGA button. Applied to a native element so focus, keyboard and form
 * behaviour stay native:
 *
 *   <button dga-button variant="primary" size="medium">Save</button>
 *   <a dga-button variant="secondary-outline" href="/docs">Docs</a>
 *
 * Icons are projected content: wrap them in `<span class="icon">` (inline SVG)
 * or use `<dga-icon class="icon" name="add-01" />`.
 */
@Component({
  selector: 'button[dga-button], a[dga-button]',
  template: '<ng-content />',
  styleUrl: './button.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.aria-pressed]': 'selected() ? "true" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
})
export class DgaButton {
  readonly variant = input<DgaButtonVariant>('primary');
  readonly size = input<DgaButtonSize>('large');
  /** Red destructive styling for delete / irreversible actions. */
  readonly destructive = input(false, { transform: booleanAttribute });
  /** For use on dark or brand-coloured backgrounds. */
  readonly onColor = input(false, { transform: booleanAttribute });
  /** Toggle-button selected state (also sets aria-pressed). */
  readonly selected = input(false, { transform: booleanAttribute });
  /** Shows the spinner and hides the label. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Square button that contains only an icon. Provide an aria-label. */
  readonly iconOnly = input(false, { transform: booleanAttribute });
  /** Floating action button. */
  readonly fab = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => {
    const size = this.size();
    const list = ['btn', `btn-${this.variant()}`];
    if (this.fab()) {
      list.push('btn-fab');
      if (size === 'small') list.push('btn-fab-small');
    } else if (size !== 'large') {
      list.push(`btn-${size}`);
    }
    if (this.onColor()) list.push('btn-on-color');
    if (this.destructive()) list.push('destructive');
    if (this.selected()) list.push('selected');
    if (this.loading()) list.push('btn-loading');
    if (this.iconOnly()) list.push('btn-icon-only');
    return list.join(' ');
  });
}
