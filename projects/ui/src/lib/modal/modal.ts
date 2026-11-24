import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { listenOnDocumentWhile } from '../internal/listen-while';
import { overlayStack } from '../internal/overlay-stack';
import { lockBodyScroll } from '../internal/scroll-lock';

export type DgaModalSize = 'default' | 'mobile';
export type DgaModalAlign = 'start' | 'center';
export type DgaModalPosition = 'start' | 'center' | 'end';
export type DgaModalIconColor = 'neutral' | 'brand' | 'gray' | 'success' | 'error' | 'warning' | 'info';
export type DgaModalIconVariant = 'light' | 'dark' | 'outlined';
export type DgaModalCloseReason = 'escape' | 'backdrop' | 'close-button' | 'action' | 'api';

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
  'select:not([disabled]), textarea:not([disabled]), iframe, [contenteditable="true"], ' +
  '[tabindex]:not([tabindex="-1"])';

let nextId = 0;


/**
 * Actions row of a `<dga-modal>`. Buttons must be direct children:
 *
 *   <dga-modal-actions>
 *     <button dga-button variant="secondary-outline" dgaModalClose>Cancel</button>
 *     <button dga-button (click)="save()">Save</button>
 *   </dga-modal-actions>
 *
 * With three or more buttons the first one is pushed to the leading edge.
 */
@Component({
  selector: 'dga-modal-actions',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
})
export class DgaModalActions {
  /** Vertical, full-width buttons (put the primary button first). */
  readonly stack = input(false, { transform: booleanAttribute });
  /** Every button stretches to share the row equally. */
  readonly fill = input(false, { transform: booleanAttribute });
  /** Groups the buttons in the centre. */
  readonly center = input(false, { transform: booleanAttribute });
  /** Keeps the inline layout below 480px instead of stacking. */
  readonly keepInline = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => {
    const list = ['modal-actions'];
    if (this.stack()) list.push('modal-actions--stack');
    if (this.fill()) list.push('modal-actions--fill');
    if (this.center()) list.push('modal-actions--center');
    if (this.keepInline()) list.push('modal-actions--inline-keep');
    return list.join(' ');
  });
}

/**
 * DGA modal dialog.
 *
 *   <dga-modal [(open)]="isOpen" heading="Delete file?" description="This cannot be undone." icon="information-circle">
 *     <p>Any extra body content</p>
 *     <dga-modal-actions>
 *       <button dga-button variant="secondary-outline" dgaModalClose>Cancel</button>
 *       <button dga-button destructive (click)="remove()">Delete</button>
 *     </dga-modal-actions>
 *   </dga-modal>
 *
 * Slots: default content goes in the body, `[dgaModalHeader]` adds content to
 * the header under the title, `<dga-modal-actions>` is the footer.
 */
@Component({
  selector: 'dga-modal',
  template: `
    <div
      [class.modal-backdrop]="!inline()"
      [class.modal-inline]="inline()"
      [class.is-open]="!inline() && open()"
      [class.modal-backdrop--start]="!inline() && position() === 'start'"
      [class.modal-backdrop--end]="!inline() && position() === 'end'"
      (click)="onBackdropClick($event)"
      (keydown)="onKeydown($event)"
    >
      <div
        #dialog
        [class]="dialogClasses()"
        role="dialog"
        [attr.aria-modal]="inline() ? null : 'true'"
        [attr.tabindex]="inline() ? null : -1"
        [attr.aria-labelledby]="labelledBy()"
        [attr.aria-label]="labelledBy() ? null : ariaLabel() || null"
        [attr.aria-describedby]="description() ? descriptionId : null"
      >
        <div class="modal-header">
          @if (icon() || closable()) {
            <div class="modal-header__top">
              @if (icon()) {
                <span [class]="iconClasses()">
                  <span [class]="'dga-icon-' + icon()" aria-hidden="true"></span>
                </span>
              }
              @if (closable()) {
                <button
                  type="button"
                  class="modal-close"
                  [attr.aria-label]="closeLabel()"
                  (click)="close('close-button')"
                >
                  <span class="dga-icon-cancel-01" aria-hidden="true"></span>
                </button>
              }
            </div>
          }
          @if (heading()) {
            <h3 class="modal-title" [id]="titleId">{{ heading() }}</h3>
          }
          <ng-content select="[dgaModalHeader]" />
        </div>
        <div class="modal-body">
          @if (description()) {
            <p class="modal-description" [id]="descriptionId">{{ description() }}</p>
          }
          <ng-content />
        </div>
        <ng-content select="dga-modal-actions" />
      </div>
    </div>
  `,
  styleUrl: './modal.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape($event)',
  },
})
export class DgaModal {
  /** Whether the modal is open. Two-way bindable. */
  readonly open = model(false);
  /**
   * Renders the dialog in the page flow, always visible, without backdrop,
   * focus trap or scroll lock (for previews and documentation). `open` is ignored.
   */
  readonly inline = input(false, { transform: booleanAttribute });
  /** Title text; also labels the dialog. */
  readonly heading = input<string>('');
  /** Description paragraph at the top of the body. */
  readonly description = input<string>('');
  /** `mobile` narrows the dialog to 320px. */
  readonly size = input<DgaModalSize>('default');
  /** `center` centres the featured icon and title. */
  readonly align = input<DgaModalAlign>('start');
  /** Vertical position of the dialog in the viewport. */
  readonly position = input<DgaModalPosition>('center');
  /** Featured icon name without the `dga-icon-` prefix. Empty hides it. */
  readonly icon = input<string>('');
  readonly iconColor = input<DgaModalIconColor>('neutral');
  /** Applies only when `iconColor` is not `neutral`. */
  readonly iconVariant = input<DgaModalIconVariant>('light');
  /** Shows the close (X) button. */
  readonly closable = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });
  /** Accessible label of the close button. */
  readonly closeLabel = input<string>('Close');
  /** Accessible name when there is no `heading`. */
  readonly ariaLabel = input<string>('');
  /** Id of an external element that labels the dialog (overrides `heading`). */
  readonly ariaLabelledby = input<string>('');

  /** Emits after the modal opens. */
  readonly opened = output<void>();
  /** Emits after the modal closes, with what caused it. */
  readonly closed = output<DgaModalCloseReason>();

  private readonly document = inject(DOCUMENT);
  private readonly dialog = viewChild.required<ElementRef<HTMLElement>>('dialog');

  private readonly uid = nextId++;
  protected readonly titleId = `dga-modal-title-${this.uid}`;
  protected readonly descriptionId = `dga-modal-description-${this.uid}`;

  private isActive = false;
  private lastFocused: HTMLElement | null = null;
  private closeReason: DgaModalCloseReason = 'api';
  private focusTimer: ReturnType<typeof setTimeout> | undefined;
  private releaseScroll: (() => void) | null = null;

  protected readonly labelledBy = computed(
    () => this.ariaLabelledby() || (this.heading() ? this.titleId : null),
  );

  protected readonly dialogClasses = computed(() => {
    const list = ['modal'];
    if (this.size() === 'mobile') list.push('modal--mobile');
    if (this.align() === 'center') list.push('modal--center');
    return list.join(' ');
  });

  protected readonly iconClasses = computed(() => {
    const list = ['modal-icon'];
    const color = this.iconColor();
    if (color !== 'neutral') {
      list.push(`modal-icon--${color}`);
      const variant = this.iconVariant();
      if (variant !== 'light') list.push(`modal-icon--${variant}`);
    }
    return list.join(' ');
  });

  constructor() {
    effect(() => {
      const open = this.open() && !this.inline();
      untracked(() => (open ? this.activate() : this.deactivate()));
    });

    // Keep focus inside the dialog even when it is moved from outside the
    // dialog's own Tab handling (e.g. Tab pressed after clicking the backdrop).
    listenOnDocumentWhile<FocusEvent>(
      () => this.open() && !this.inline(),
      'focusin',
      (event) => this.onDocumentFocusIn(event),
    );

    inject(DestroyRef).onDestroy(() => this.deactivate(true));
  }

  private onDocumentFocusIn(event: FocusEvent): void {
    if (!this.isActive || !overlayStack.isTop(this)) return;
    const dialog = this.dialog().nativeElement;
    const target = event.target;
    if (target instanceof Node && dialog.contains(target)) return;
    const focusable = this.focusableElements();
    // Same preference as on open: not the close button when there is another control.
    const next =
      focusable.find((el) => !el.classList.contains('modal-close')) ?? focusable[0] ?? dialog;
    next.focus();
  }

  /** Closes the modal. */
  close(reason: DgaModalCloseReason = 'api'): void {
    if (this.inline()) {
      this.closed.emit(reason);
      return;
    }
    if (!this.open()) return;
    this.closeReason = reason;
    this.open.set(false);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && this.closeOnBackdrop()) this.close('backdrop');
  }

  protected onEscape(event: Event): void {
    if (!this.isActive || !this.closeOnEscape()) return;
    if (!overlayStack.isTop(this)) return;
    event.preventDefault();
    this.close('escape');
  }

  /** Keeps Tab / Shift+Tab inside the dialog. */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.isActive) return;
    const dialog = this.dialog().nativeElement;
    const focusable = this.focusableElements();
    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.document.activeElement;
    if (event.shiftKey && (active === first || active === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusableElements(): HTMLElement[] {
    const dialog = this.dialog().nativeElement;
    return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.getClientRects().length > 0,
    );
  }

  private activate(): void {
    if (this.isActive) return;
    this.isActive = true;
    this.closeReason = 'api';

    const doc = this.document;
    const active = doc.activeElement as HTMLElement | null;
    this.lastFocused = active && typeof active.focus === 'function' ? active : null;

    this.releaseScroll = lockBodyScroll(doc);
    overlayStack.push(this);

    // Wait for the `is-open` class to be rendered: a hidden element cannot take focus.
    this.focusTimer = setTimeout(() => {
      this.focusTimer = undefined;
      if (!this.isActive) return;
      const dialog = this.dialog().nativeElement;
      if (dialog.contains(doc.activeElement)) return;
      const focusable = this.focusableElements();
      // Prefer the first control after the close button so Enter does not dismiss by accident.
      const target =
        focusable.find((el) => !el.classList.contains('modal-close')) ?? focusable[0] ?? dialog;
      target.focus();
    });

    this.opened.emit();
  }

  private deactivate(destroying = false): void {
    if (!this.isActive) return;
    this.isActive = false;
    if (this.focusTimer !== undefined) {
      clearTimeout(this.focusTimer);
      this.focusTimer = undefined;
    }

    overlayStack.remove(this);
    this.releaseScroll?.();
    this.releaseScroll = null;

    const target = this.lastFocused;
    this.lastFocused = null;
    if (target && target.isConnected) target.focus();

    if (!destroying) this.closed.emit(this.closeReason);
  }
}

/**
 * Closes the enclosing `<dga-modal>` when the host element is clicked:
 *
 *   <button dga-button variant="secondary-outline" dgaModalClose>Cancel</button>
 */
@Directive({
  selector: '[dgaModalClose]',
  host: { '(click)': 'modal.close("action")' },
})
export class DgaModalClose {
  protected readonly modal = inject(DgaModal);
}
