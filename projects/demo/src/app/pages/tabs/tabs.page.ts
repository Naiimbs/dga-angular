import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DgaTab, DgaTabs, DgaTabsSize } from '@dga/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

const LABELS = {
  en: ['First Tab', 'Second Tab', 'Third Tab', 'Fourth Tab', 'Fifth Tab'],
  ar: ['تبويب أول', 'تبويب ثاني', 'تبويب ثالث', 'تبويب رابع', 'تبويب خامس'],
};

@Component({
  selector: 'demo-tabs-page',
  imports: [DgaTabs, DgaTab, ...DEMO_KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-header">
      <h1 class="content-title">Tabs</h1>
      <p class="content-description">
        A tablist is a group of headers that lets people navigate between different views of related information
        without going to different pages. Available in 3 sizes with icon, divider, flush, and RTL support.
      </p>
    </div>

    <demo-live
      heading="Tabs"
      description="Tabs organize content into separate views where only one view is visible at a time. Selecting a tab reveals its associated content."
      [rtl]="rtl()"
      align="stretch"
      justify="flex-start"
    >
      <dga-tabs [(selectedIndex)]="active" [size]="size()" [divider]="divider()" aria-label="Tabs">
        @for (label of liveTabs(); track $index; let last = $last) {
          <dga-tab [label]="label" [icon]="icons() ? 'home-01' : ''" [disabled]="disabledTab() && last" />
        }
      </dga-tabs>

      <demo-switch label="RTL" [(checked)]="rtl" />
      <demo-select label="Size" [options]="sizes" [(value)]="size" />
      <demo-select label="Tab Count" [options]="counts" [value]="count()" (valueChange)="setCount($event)" />
      <demo-switch label="Icons" [(checked)]="icons" />
      <demo-switch label="Divider" [(checked)]="divider" />
      <demo-switch label="Disabled Tab" [(checked)]="disabledTab" />
    </demo-live>

    <demo-props
      description="Inputs, outputs and models of dga-tabs and its dga-tab children. The content projected into a dga-tab is its panel."
      [props]="props"
    />

    <demo-showcase
      heading="Tab Sizes"
      description="Three size options for different content density. Medium is the default, Small for compact layouts, and Large for prominent navigation."
    >
      <span class="showcase-label">Medium (Default)</span>
      <dga-tabs aria-label="Medium tabs">
        <dga-tab label="First Tab" icon="home-01" />
        <dga-tab label="Second Tab" icon="home-01" />
        <dga-tab label="Third Tab" icon="home-01" />
      </dga-tabs>

      <span class="showcase-label">Small</span>
      <dga-tabs size="sm" aria-label="Small tabs">
        <dga-tab label="First Tab" />
        <dga-tab label="Second Tab" />
        <dga-tab label="Third Tab" />
      </dga-tabs>

      <span class="showcase-label">Large</span>
      <dga-tabs size="lg" aria-label="Large tabs">
        <dga-tab label="First Tab" icon="home-01" />
        <dga-tab label="Second Tab" icon="home-01" />
        <dga-tab label="Third Tab" icon="home-01" />
      </dga-tabs>
    </demo-showcase>

    <demo-showcase
      heading="Without Icons"
      description="Tabs can be used without icons for a simpler, text-only appearance. Works with all sizes."
    >
      <dga-tabs aria-label="Tabs without icons">
        <dga-tab label="First Tab" />
        <dga-tab label="Second Tab" />
        <dga-tab label="Third Tab" />
        <dga-tab label="Fourth Tab" />
      </dga-tabs>
    </demo-showcase>

    <demo-showcase
      heading="Tab States"
      description="Interactive states provide visual feedback. The active tab shows a green indicator bar and bold text. Disabled tabs are grayed out and non-interactive. Hover and pressed states are handled by CSS."
    >
      <dga-tabs aria-label="Tab states">
        <dga-tab label="Selected" icon="home-01" />
        <dga-tab label="Default" icon="home-01" />
        <dga-tab label="Disabled" icon="home-01" disabled />
      </dga-tabs>
    </demo-showcase>

    <demo-showcase
      heading="RTL Support"
      description="Tabs in right-to-left layout for Arabic and other RTL languages. Tab order and icon positions are mirrored automatically."
      subtle
    >
      <div dir="rtl" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
        <dga-tabs aria-label="تبويبات">
          <dga-tab label="تبويب أول" icon="home-01" />
          <dga-tab label="تبويب ثاني" icon="home-01" />
          <dga-tab label="تبويب ثالث" icon="home-01" />
        </dga-tabs>
      </div>
    </demo-showcase>
  `,
})
export class TabsPage {
  protected readonly sizes: DemoOption<DgaTabsSize>[] = [
    { value: 'md', label: 'Medium' },
    { value: 'sm', label: 'Small' },
    { value: 'lg', label: 'Large' },
  ];
  protected readonly counts: DemoOption<number>[] = [
    { value: 3, label: '3 Tabs' },
    { value: 4, label: '4 Tabs' },
    { value: 5, label: '5 Tabs' },
  ];

  protected readonly rtl = signal(false);
  protected readonly size = signal<DgaTabsSize>('md');
  protected readonly count = signal(5);
  protected readonly icons = signal(true);
  protected readonly divider = signal(true);
  protected readonly disabledTab = signal(false);
  protected readonly active = signal(0);

  protected readonly liveTabs = computed(() => (this.rtl() ? LABELS.ar : LABELS.en).slice(0, this.count()));

  // Keep the active tab within bounds, as the original demo does.
  protected setCount(count: number): void {
    this.count.set(count);
    if (this.active() >= count) this.active.set(0);
  }

  protected readonly props: DemoProp[] = [
    { name: 'dga-tabs · selectedIndex', type: 'model<number>', default: '0', description: 'Index of the selected tab. Shows the green indicator bar and bold text.' },
    { name: 'dga-tabs · size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Tab size: small (8px/12px padding), medium, or large (16px padding all sides).' },
    { name: 'dga-tabs · divider', type: 'boolean', default: 'true', description: 'Full-width bottom line behind the tabs. Provides a visual baseline.' },
    { name: 'dga-tabs · flush', type: 'boolean', default: 'false', description: 'Flush variant. Removes container padding so tabs sit edge-to-edge.' },
    { name: 'dga-tabs · aria-label', type: 'string', default: "''", description: 'Accessible name of the tablist.' },
    { name: 'dga-tabs · (selectionChange)', type: 'output<DgaTabChangeEvent>', description: 'Emitted with { index, value } when the user selects another tab (click or keyboard).' },
    { name: 'dga-tab · label', type: 'string', default: 'required', description: 'Tab title.' },
    { name: 'dga-tab · icon', type: 'string', default: "''", description: 'Leading 24px font icon name, without the dga-icon- prefix.' },
    { name: 'dga-tab · disabled', type: 'boolean', default: 'false', description: 'Disables the tab. Grays out text and icon, prevents interaction.' },
    { name: 'dga-tab · value', type: 'string | undefined', default: 'undefined', description: 'Optional identifier reported in selectionChange and usable with selectByValue().' },
  ];
}
