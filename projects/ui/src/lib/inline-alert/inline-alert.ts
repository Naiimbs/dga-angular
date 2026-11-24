import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  input,
  model,
  output,
} from '@angular/core';
import { DgaButton } from '../button/button';

export type DgaInlineAlertVariant = 'neutral' | 'info' | 'error' | 'warning' | 'success';

const DEFAULT_ICONS: Record<DgaInlineAlertVariant, string> = {
  neutral: 'help-circle',
  info: 'help-circle',
  error: 'help-circle',
  warning: 'alert-02',
  success: 'tick-02',
};

/**
 * Marks the action buttons of a `<dga-inline-alert>`. Put it on an
 * `<ng-container>` wrapping the buttons:
 *
 *   <ng-container dgaInlineAlertActions>
 *     <button dga-button variant="subtle" size="small">Retry</button>
 *   </ng-container>
 */
@Directive({ selector: '[dgaInlineAlertActions]' })
export class DgaInlineAlertActions {}

/**
 * Optional alternative buttons for the mobile layout (the source renders a
 * second, full-width row below 600px). When omitted, the regular actions
 * are stacked full-width on mobile instead.
 */
@Directive({ selector: '[dgaInlineAlertMobileActions]' })
export class DgaInlineAlertMobileActions {}

/**
 * DGA inline alert.
 *
 *   <dga-inline-alert variant="error" heading="Payment failed" message="Check the card details." dismissible />
 *
 * Extra rich content can be projected; it renders under the message.
 */
@Component({
  selector: 'dga-inline-alert',
  imports: [DgaButton],
  template: `
    <div class="inline-alert__header" [class.inline-alert__header--centered]="isCentered()">
      @if (showIcon()) {
        <div class="inline-alert__icon">
          <span [class]="'icon dga-icon-' + iconName()" aria-hidden="true"></span>
        </div>
      }
      <div class="inline-alert__body">
        @if (heading()) {
          <h4 class="inline-alert__title text-md-semibold" [style.margin-bottom]="isCentered() ? '0' : null">
            {{ heading() }}
          </h4>
        }
        @if (message()) {
          <p class="inline-alert__content text-sm-regular">{{ message() }}</p>
        }
        <ng-content />
      </div>
      @if (dismissible()) {
        <div class="inline-alert__close">
          <button
            dga-button
            type="button"
            variant="transparent"
            size="small"
            iconOnly
            [attr.aria-label]="closeLabel()"
            (click)="dismiss()"
          >
            <span class="icon dga-icon-multiplication-sign" aria-hidden="true"></span>
          </button>
        </div>
      }
    </div>
    @if (actions()) {
      <div class="inline-alert__action" [class.inline-alert__action--responsive]="!mobileActions()">
        <ng-content select="[dgaInlineAlertActions]" />
      </div>
    }
    @if (mobileActions()) {
      <div class="inline-alert__action-mobile">
        <ng-content select="[dgaInlineAlertMobileActions]" />
      </div>
    }
  `,
  styleUrl: './inline-alert.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[style.display]': 'visible() ? null : "none"',
    '[attr.role]': 'role()',
  },
})
export class DgaInlineAlert {
  readonly variant = input<DgaInlineAlertVariant>('neutral');
  /** Tinted background and border in the variant colour. */
  readonly colored = input(false, { transform: booleanAttribute });
  /** Alert title. */
  readonly heading = input<string>('');
  /** Supporting text under the title. */
  readonly message = input<string>('');
  readonly showIcon = input(true, { transform: booleanAttribute });
  /** Icon name without the `dga-icon-` prefix. Defaults per variant. */
  readonly icon = input<string>('');
  /**
   * Vertically centres the header row. Defaults to `true` when there is no
   * `message` (title-only alert), as in the source.
   */
  readonly centered = input<boolean | undefined, unknown>(undefined, {
    transform: (value: unknown) => (value === undefined ? undefined : booleanAttribute(value)),
  });
  /** Shows the close button. */
  readonly dismissible = input(false, { transform: booleanAttribute });
  /** Accessible label of the close button. */
  readonly closeLabel = input<string>('Dismiss');
  /** Whether the alert is shown. Set back to `true` to show it again. */
  readonly visible = model(true);

  /** Emits after the user dismisses the alert. */
  readonly dismissed = output<void>();

  protected readonly actions = contentChild(DgaInlineAlertActions);
  protected readonly mobileActions = contentChild(DgaInlineAlertMobileActions);

  protected readonly iconName = computed(() => this.icon() || DEFAULT_ICONS[this.variant()]);
  protected readonly isCentered = computed(() => this.centered() ?? !this.message());

  protected readonly classes = computed(() => {
    const variant = this.variant();
    const list = ['inline-alert', `inline-alert--${variant}`];
    if (this.colored()) list.push(`inline-alert--${variant}-bg`);
    return list.join(' ');
  });

  protected readonly role = computed(() => {
    const variant = this.variant();
    return variant === 'error' || variant === 'warning' ? 'alert' : 'status';
  });

  /** Hides the alert and emits `dismissed`. */
  dismiss(): void {
    if (!this.visible()) return;
    this.visible.set(false);
    this.dismissed.emit();
  }
}
