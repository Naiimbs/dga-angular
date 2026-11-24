import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

export type DgaScreenGridColumns = 1 | 2 | 3 | 4;
export type DgaScreenPlaceholderSize = 'sm' | 'md' | 'lg';

/**
 * Screen template frame: a bordered preview surface with an optional header
 * bar and a content area.
 *
 *   <dga-screen dashboard>
 *     <img dgaScreenLogo src="logo.svg" alt="Portal" />
 *     <button dgaScreenActions dga-button size="small">Sign in</button>
 *     <dga-screen-grid [columns]="2">
 *       <dga-screen-placeholder size="sm" />
 *       <dga-screen-placeholder size="sm" />
 *       <dga-screen-placeholder size="lg" full />
 *     </dga-screen-grid>
 *   </dga-screen>
 *
 * Without projected `[dgaScreenLogo]` / `[dgaScreenActions]` content the
 * header shows the source's skeleton logo and avatar placeholders.
 */
@Component({
  selector: 'dga-screen',
  template: `
    @if (!hideHeader()) {
      <div class="screen-header">
        <ng-content select="[dgaScreenLogo]"><div class="screen-header__logo"></div></ng-content>
        <div class="screen-header__actions">
          <ng-content select="[dgaScreenActions]"><div class="screen-header__avatar"></div></ng-content>
        </div>
      </div>
    }
    <div class="screen-content"><ng-content /></div>
  `,
  styleUrl: './screens.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'screen-preview', '[class.screen-dashboard]': 'dashboard()' },
})
export class DgaScreen {
  /** Fixed-height dashboard layout (header + clipped content). */
  readonly dashboard = input(false, { transform: booleanAttribute });
  /** Removes the header bar. */
  readonly hideHeader = input(false, { transform: booleanAttribute });
}

/** Grid of screen regions (`.screen-grid`), 1–4 equal columns. */
@Component({
  selector: 'dga-screen-grid',
  template: '<ng-content />',
  styleUrl: './screens.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
})
export class DgaScreenGrid {
  readonly columns = input<DgaScreenGridColumns>(1);

  protected readonly classes = computed(() => {
    const columns = this.columns();
    return columns > 1 ? `screen-grid screen-grid--${columns}` : 'screen-grid';
  });
}

/** Skeleton block standing in for a screen region (`.screen-placeholder`). */
@Component({
  selector: 'dga-screen-placeholder',
  template: '<ng-content />',
  styleUrl: './screens.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
})
export class DgaScreenPlaceholder {
  readonly size = input<DgaScreenPlaceholderSize>('sm');
  /** Spans every column of the parent grid. */
  readonly full = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(
    () =>
      `screen-placeholder screen-placeholder--${this.size()}${this.full() ? ' screen-placeholder--full' : ''}`,
  );
}
