import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

export type DgaStatusTagVariant = 'neutral' | 'info' | 'success' | 'warning' | 'error';
export type DgaStatusTagSize = 'md' | 'sm' | 'xs';
export type DgaStatusTagAppearance = 'subtle' | 'inverted' | 'ghost';

/**
 * DGA status tag — a dot plus a label that communicates a status.
 *
 *   <dga-status-tag variant="success">Active</dga-status-tag>
 *   <dga-status-tag variant="error" appearance="inverted" size="sm">Rejected</dga-status-tag>
 *
 * Colour alone does not convey the status to assistive tech: use a
 * self-explanatory label, or set `statusLabel` to add screen-reader-only
 * text before the label (e.g. "Status:").
 */
@Component({
  selector: 'dga-status-tag',
  template: `
    <span class="status-tag__dot" aria-hidden="true"></span>
    <span class="status-tag__label">
      @if (statusLabel(); as sr) {
        <span class="status-tag__sr-only">{{ sr }} </span>
      }
      <ng-content />
    </span>
  `,
  styleUrl: './status-tag.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
})
export class DgaStatusTag {
  readonly variant = input<DgaStatusTagVariant>('neutral');
  readonly size = input<DgaStatusTagSize>('md');
  /** Visual style: light background, solid background or no background. */
  readonly appearance = input<DgaStatusTagAppearance>('subtle');
  /** Optional screen-reader-only prefix for the label. */
  readonly statusLabel = input<string>('');

  protected readonly classes = computed(
    () =>
      `status-tag status-tag--${this.size()} status-tag--${this.appearance()} status-tag--${this.variant()}`,
  );
}
