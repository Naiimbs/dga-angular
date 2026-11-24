import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import type { DgaToastVariant } from './notification-toast';

export interface DgaToastAction {
  label: string;
  /** Called when the action button is pressed. */
  handler?: () => void;
  /** Dismiss the toast after the handler runs. Default `true`. */
  dismissOnClick?: boolean;
}

export interface DgaToastOptions {
  /** Toast title. */
  title: string;
  /** Helper text under the title. */
  message?: string;
  variant?: DgaToastVariant;
  /** Auto-dismiss delay in milliseconds. `0` keeps the toast until dismissed. Default 5000. */
  duration?: number;
  /** Shows the close button. Default `true`. */
  dismissible?: boolean;
  /** Accessible label of the close button. Default "Dismiss". */
  closeLabel?: string;
  /** Up to two action buttons. */
  actions?: readonly DgaToastAction[];
}

/** A toast currently shown by the service. */
export interface DgaToastItem {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly variant: DgaToastVariant;
  readonly duration: number;
  readonly dismissible: boolean;
  readonly closeLabel: string;
  readonly actions: readonly DgaToastAction[];
}

/** Handle returned by `DgaToastService.show()`. */
export interface DgaToastRef {
  readonly id: string;
  dismiss(): void;
}

interface ToastTimer {
  handle: ReturnType<typeof setTimeout> | undefined;
  remaining: number;
  startedAt: number;
}

/**
 * Shows transient toasts in the `<dga-toast-container>` placed once in the
 * application shell.
 *
 *   const ref = toast.show({ title: 'Saved', variant: 'success' });
 *   ref.dismiss();
 */
@Injectable({ providedIn: 'root' })
export class DgaToastService {
  private readonly items = signal<readonly DgaToastItem[]>([]);
  private readonly timers = new Map<string, ToastTimer>();
  private counter = 0;

  /** Toasts currently shown, oldest first. */
  readonly toasts = this.items.asReadonly();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const timer of this.timers.values()) clearTimeout(timer.handle);
      this.timers.clear();
    });
  }

  show(options: DgaToastOptions): DgaToastRef {
    const id = `dga-toast-${this.counter++}`;
    const item: DgaToastItem = {
      id,
      title: options.title,
      message: options.message ?? '',
      variant: options.variant ?? 'neutral',
      duration: options.duration ?? 5000,
      dismissible: options.dismissible ?? true,
      closeLabel: options.closeLabel ?? 'Dismiss',
      actions: options.actions ?? [],
    };
    this.items.update((list) => [...list, item]);
    if (item.duration > 0) {
      this.timers.set(id, { handle: undefined, remaining: item.duration, startedAt: 0 });
      this.resume(id);
    }
    return { id, dismiss: () => this.dismiss(id) };
  }

  /** Removes one toast. */
  dismiss(id: string): void {
    this.clearTimer(id);
    this.items.update((list) => list.filter((item) => item.id !== id));
  }

  /** Removes every toast. */
  clear(): void {
    for (const id of [...this.timers.keys()]) this.clearTimer(id);
    this.items.set([]);
  }

  /** Pauses the auto-dismiss timer (the container calls this on hover / focus). */
  pause(id: string): void {
    const timer = this.timers.get(id);
    if (!timer || timer.handle === undefined) return;
    clearTimeout(timer.handle);
    timer.handle = undefined;
    timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
  }

  /** Restarts a paused auto-dismiss timer with the time that was left. */
  resume(id: string): void {
    const timer = this.timers.get(id);
    if (!timer || timer.handle !== undefined) return;
    timer.startedAt = Date.now();
    timer.handle = setTimeout(() => this.dismiss(id), timer.remaining);
  }

  private clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (!timer) return;
    clearTimeout(timer.handle);
    this.timers.delete(id);
  }
}
