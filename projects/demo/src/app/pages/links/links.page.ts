import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DgaIcon, DgaLink, DgaLinkSize, DgaLinkUnderline, DgaLinkVariant } from '@dga/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

@Component({
  selector: 'demo-links-page',
  imports: [DgaLink, DgaIcon, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Links</h1>
      <p class="content-description">Link components for navigation.</p>
    </div>

    <demo-live
      heading="Link"
      description="Links navigate to another page or resource. Switch the style, underline and size to explore the variants."
      [rtl]="rtl()"
    >
      <a
        dga-link
        href="#"
        [variant]="variant()"
        [underline]="underline()"
        [size]="size()"
        [external]="external()"
        [withIcon]="leadIcon() || trailIcon()"
        [disabled]="state() === 'disabled'"
        (click)="$event.preventDefault()"
      >
        @if (leadIcon()) {
          <dga-icon [name]="rtl() ? 'arrow-right-01' : 'arrow-left-01'" [size]="16" />
        }
        {{ label() }}
        @if (trailIcon()) {
          <dga-icon [name]="rtl() ? 'arrow-left-01' : 'arrow-right-01'" [size]="16" />
        }
      </a>

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Size" [options]="sizes" [(value)]="size" />
      <demo-select label="State" [options]="states" [(value)]="state" />
      <demo-select label="Style" [options]="variants" [(value)]="variant" />
      <demo-select label="Underline" [options]="underlines" [(value)]="underline" />
      <demo-switch label="External" [(checked)]="external" />
      <demo-switch label="Lead Icon" [(checked)]="leadIcon" />
      <demo-switch label="Trail Icon" [(checked)]="trailIcon" />
    </demo-live>

    <demo-props
      description="Inputs of the dga-link component. Apply it to a native anchor: <a dga-link href=&quot;…&quot;>."
      [props]="props"
    />

    <demo-showcase heading="Link Styles">
      <div style="display: flex; flex-direction: column; gap: var(--spacing-lg); width: 100%;">
        <a dga-link href="#" (click)="$event.preventDefault()">Primary Link</a>
        <a dga-link underline="always" href="#" (click)="$event.preventDefault()">Underlined Link</a>
        <a dga-link variant="muted" href="#" (click)="$event.preventDefault()">Secondary Link</a>
      </div>
    </demo-showcase>

    <demo-showcase heading="Variants" description="Four color variants: primary, secondary, muted and danger.">
      <div class="showcase-row">
        @for (v of variants; track v.value) {
          <a dga-link [variant]="v.value" href="#" (click)="$event.preventDefault()">{{ v.label }} link</a>
        }
      </div>
    </demo-showcase>

    <demo-showcase heading="Underline" description="No underline, always underlined, or underlined on hover.">
      <div class="showcase-row">
        @for (u of underlines; track u.value) {
          <a dga-link [underline]="u.value" href="#" (click)="$event.preventDefault()">{{ u.label }}</a>
        }
      </div>
    </demo-showcase>

    <demo-showcase heading="Sizes" description="Small, medium (inherits the surrounding font size) and large.">
      <div class="showcase-row">
        @for (s of sizes; track s.value) {
          <a dga-link [size]="s.value" href="#" (click)="$event.preventDefault()">{{ s.label }} link</a>
        }
      </div>
    </demo-showcase>

    <demo-showcase heading="Icon, external and disabled">
      <div class="showcase-row">
        <a dga-link withIcon href="#" (click)="$event.preventDefault()">
          <dga-icon name="arrow-left-01" [size]="16" /> Back
        </a>
        <a dga-link withIcon href="#" (click)="$event.preventDefault()">
          Continue <dga-icon name="arrow-right-01" [size]="16" />
        </a>
        <a dga-link external underline="hover" href="https://dga.gov.sa" target="_blank" rel="noopener noreferrer">
          External link
        </a>
        <a dga-link disabled underline="always" href="#">Disabled link</a>
      </div>
    </demo-showcase>

    <demo-showcase heading="RTL Support" description="The external glyph mirrors in right-to-left layouts." subtle>
      <div class="showcase-row" dir="rtl">
        <a dga-link href="#" (click)="$event.preventDefault()">رابط أساسي</a>
        <a dga-link underline="always" href="#" (click)="$event.preventDefault()">رابط مسطر</a>
        <a dga-link external href="#" (click)="$event.preventDefault()">رابط خارجي</a>
      </div>
    </demo-showcase>
  `,
})
export class LinksPage {
  protected readonly variants: DemoOption<DgaLinkVariant>[] = [
    { value: 'primary', label: 'Primary' },
    { value: 'secondary', label: 'Secondary' },
    { value: 'muted', label: 'Muted' },
    { value: 'danger', label: 'Danger' },
  ];
  protected readonly underlines: DemoOption<DgaLinkUnderline>[] = [
    { value: 'none', label: 'None' },
    { value: 'always', label: 'Always' },
    { value: 'hover', label: 'On hover' },
  ];
  protected readonly sizes: DemoOption<DgaLinkSize>[] = [
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
  ];
  protected readonly states: DemoOption<'default' | 'disabled'>[] = [
    { value: 'default', label: 'Default' },
    { value: 'disabled', label: 'Disabled' },
  ];

  protected readonly rtl = signal(false);
  protected readonly variant = signal<DgaLinkVariant>('primary');
  protected readonly underline = signal<DgaLinkUnderline>('none');
  protected readonly size = signal<DgaLinkSize>('md');
  protected readonly state = signal<'default' | 'disabled'>('default');
  protected readonly external = signal(false);
  protected readonly leadIcon = signal(false);
  protected readonly trailIcon = signal(false);

  protected readonly label = computed(() => (this.rtl() ? 'رابط' : 'Link'));

  protected readonly props: DemoProp[] = [
    { name: 'variant', type: "'primary' | 'secondary' | 'muted' | 'danger'", default: "'primary'", description: 'Color of the link.' },
    { name: 'underline', type: "'none' | 'always' | 'hover'", default: "'none'", description: 'Underline mode: never, always, or only on hover.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Font size. Medium inherits the surrounding font size.' },
    { name: 'external', type: 'boolean', default: 'false', description: 'Appends the external-link glyph (mirrored in RTL).' },
    { name: 'withIcon', type: 'boolean', default: 'false', description: 'Inline-flex layout with a gap, for links that contain a leading or trailing icon.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Grays the link out, removes it from the tab order and blocks activation.' },
    { name: 'href', type: 'native attribute', description: 'Native href of the anchor element; target and rel work as usual.' },
  ];
}
