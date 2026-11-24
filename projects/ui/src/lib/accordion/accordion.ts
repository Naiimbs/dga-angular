import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';

export type DgaAccordionSize = 'lg' | 'md' | 'sm';
export type DgaAccordionIconPosition = 'leading' | 'trailing';

let nextAccordionId = 0;

/**
 * DGA accordion container.
 *
 *   <dga-accordion size="md" [multiple]="false">
 *     <dga-accordion-item heading="Question?">Answer.</dga-accordion-item>
 *   </dga-accordion>
 *
 * `size`, `iconPosition` and `flush` apply to every item unless the item
 * overrides them.
 */
@Component({
  selector: 'dga-accordion',
  template: '<ng-content />',
  styleUrl: './accordion.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'accordion' },
})
export class DgaAccordion {
  readonly size = input<DgaAccordionSize>('lg');
  readonly iconPosition = input<DgaAccordionIconPosition>('trailing');
  /** Inset ("cut") separators. */
  readonly flush = input(false, { transform: booleanAttribute });
  /** Allow several items to be open at once (source behaviour). Set to false for single-expand. */
  readonly multiple = input(true, { transform: booleanAttribute });

  private readonly items = contentChildren(DgaAccordionItem);

  /** @internal Called by an item when the user opens it. */
  itemOpened(opened: DgaAccordionItem): void {
    if (this.multiple()) return;
    for (const item of this.items()) {
      if (item !== opened && item.expanded()) item.expanded.set(false);
    }
  }
}

/**
 * One collapsible section. The projected content is the body; the header text
 * comes from `heading`, or project rich content with the `dgaAccordionHeading`
 * attribute.
 */
@Component({
  selector: 'dga-accordion-item',
  templateUrl: './accordion-item.html',
  styleUrl: './accordion.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
})
export class DgaAccordionItem {
  readonly heading = input('');
  readonly expanded = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Overrides the accordion's `size`. */
  readonly size = input<DgaAccordionSize | undefined>(undefined);
  /** Overrides the accordion's `iconPosition`. */
  readonly iconPosition = input<DgaAccordionIconPosition | undefined>(undefined);
  /** Overrides the accordion's `flush`. */
  readonly flush = input<boolean | undefined, unknown>(undefined, {
    transform: (value: unknown) => (value === undefined ? undefined : booleanAttribute(value)),
  });

  private readonly accordion = inject(DgaAccordion, { optional: true });
  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');

  private readonly uid = nextAccordionId++;
  protected readonly headerId = `dga-accordion-header-${this.uid}`;
  protected readonly bodyId = `dga-accordion-body-${this.uid}`;

  protected readonly leading = computed(
    () => (this.iconPosition() ?? this.accordion?.iconPosition() ?? 'trailing') === 'leading',
  );

  protected readonly classes = computed(() => {
    const list = ['accordion-item', `accordion-item--${this.size() ?? this.accordion?.size() ?? 'lg'}`];
    if (this.leading()) list.push('accordion-item--icon-leading');
    if (this.flush() ?? this.accordion?.flush() ?? false) list.push('accordion-item--flush');
    if (this.disabled()) list.push('disabled');
    if (this.expanded()) list.push('active');
    return list.join(' ');
  });

  constructor() {
    // As in the source: the body animates max-height to scrollHeight + 24
    // (the expanded bottom padding).
    afterRenderEffect(() => {
      const body = this.body().nativeElement;
      body.style.maxHeight = this.expanded() ? `${body.scrollHeight + 24}px` : '';
    });
  }

  toggle(): void {
    if (this.disabled()) return;
    const next = !this.expanded();
    this.expanded.set(next);
    if (next) this.accordion?.itemOpened(this);
  }
}
