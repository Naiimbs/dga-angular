import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

export type DgaLinkVariant = 'primary' | 'secondary' | 'muted' | 'danger';
export type DgaLinkUnderline = 'none' | 'always' | 'hover';
export type DgaLinkSize = 'sm' | 'md' | 'lg';

/**
 * DGA link. Applied to a native anchor so navigation, focus and keyboard
 * behaviour stay native:
 *
 *   <a dga-link href="/docs">Docs</a>
 *   <a dga-link variant="danger" underline="always" href="/delete">Delete</a>
 *   <a dga-link external href="https://example.com" target="_blank" rel="noopener">Site</a>
 *
 * For a leading/trailing icon set `withIcon` and project an element with
 * the `link__icon` class (inline SVG) or a `<dga-icon>`.
 */
@Component({
  selector: 'a[dga-link]',
  template: '<ng-content />',
  styleUrl: './links.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.tabindex]': 'disabled() ? -1 : null',
    '(click)': 'onClick($event)',
  },
})
export class DgaLink {
  readonly variant = input<DgaLinkVariant>('primary');
  readonly underline = input<DgaLinkUnderline>('none');
  /** `md` inherits the surrounding font size. */
  readonly size = input<DgaLinkSize>('md');
  /** Appends the external-link glyph. */
  readonly external = input(false, { transform: booleanAttribute });
  /** Inline-flex layout with a gap, for links that contain an icon. */
  readonly withIcon = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => {
    const list = ['link'];
    const variant = this.variant();
    if (variant !== 'primary') list.push(`link--${variant}`);
    const underline = this.underline();
    if (underline === 'always') list.push('link--underline');
    else if (underline === 'hover') list.push('link--hover-underline');
    const size = this.size();
    if (size !== 'md') list.push(`link--${size}`);
    if (this.withIcon()) list.push('link--with-icon');
    if (this.external()) list.push('link--external');
    if (this.disabled()) list.push('link--disabled');
    return list.join(' ');
  });

  protected onClick(event: Event): void {
    // pointer-events: none covers the mouse; this covers keyboard / programmatic clicks.
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
