import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  DgaButton,
  DgaMenu,
  DgaMenuAnchor,
  DgaMenuGroup,
  DgaMenuItem,
  DgaMenuSwitch,
  DgaMenuTrail,
  DgaMenuTrailIcon,
  DgaMenuTrigger,
  DgaTag,
} from '@dga/ui';
import { DEMO_KIT, DemoOption, DemoProp } from '../../shared/demo-kit';

type Trail = 'none' | 'text' | 'check' | 'icon' | 'tag' | 'switch';
type State = 'default' | 'selected' | 'disabled';

@Component({
  selector: 'demo-menus-page',
  imports: [
    DgaButton,
    DgaMenu,
    DgaMenuAnchor,
    DgaMenuGroup,
    DgaMenuItem,
    DgaMenuSwitch,
    DgaMenuTrail,
    DgaMenuTrailIcon,
    DgaMenuTrigger,
    DgaTag,
    ...DEMO_KIT,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menus.page.html',
})
export class MenusPage {
  protected readonly trails: DemoOption<Trail>[] = [
    { value: 'none', label: 'None' },
    { value: 'text', label: 'Text (+99)' },
    { value: 'check', label: 'Check icon' },
    { value: 'icon', label: 'Arrow icon' },
    { value: 'tag', label: 'Tag' },
    { value: 'switch', label: 'Switch' },
  ];
  protected readonly states: DemoOption<State>[] = [
    { value: 'default', label: 'Default' },
    { value: 'selected', label: 'Selected (1st)' },
    { value: 'disabled', label: 'Disabled (3rd)' },
  ];

  protected readonly rtl = signal(false);
  protected readonly trail = signal<Trail>('none');
  protected readonly state = signal<State>('default');
  /** Selected item of the live demo group (single-select, like data-menu-select). */
  protected readonly liveValue = signal<unknown>(undefined);
  protected readonly liveItems = [0, 1, 2];

  protected readonly labels = computed(() =>
    this.rtl()
      ? { group: 'عنوان مجموعة', item: 'نص العنصر', tag: 'وسم' }
      : { group: 'Group label', item: 'Item Label', tag: 'Label' },
  );

  // Changing a control re-renders the original preview, resetting the selection.
  protected setState(state: State): void {
    this.state.set(state);
    this.liveValue.set(state === 'selected' ? 0 : undefined);
  }

  protected setTrail(trail: Trail): void {
    this.trail.set(trail);
    this.liveValue.set(this.state() === 'selected' ? 0 : undefined);
  }

  // Showcase state
  protected readonly trailSwitch = signal(true);
  protected readonly groupedValue = signal<unknown>('a');
  protected readonly notifications = signal(true);
  protected readonly darkMode = signal(false);
  protected readonly open = signal(false);
  protected readonly rtlValue = signal<unknown>('a');
  protected readonly rtlSwitch = signal(true);

  protected readonly menuProps: DemoProp[] = [
    { name: 'dga-menu · id', type: 'string', default: 'auto', description: 'Id of the menu element (used for the trigger aria-controls).' },
    { name: 'dga-menu · aria-label', type: 'string', default: "''", description: 'Accessible name of the menu.' },
    { name: 'dga-menu · rtl', type: 'boolean', default: 'false', description: 'Forces the RTL layout (menu--rtl) regardless of the page direction.' },
    { name: 'dga-menu · closeOnSelect', type: 'boolean', default: 'true', description: 'When anchored: close the menu after an item is activated.' },
    { name: 'dga-menu-anchor · open', type: 'model<boolean>', default: 'false', description: 'Whether the anchored dropdown menu is open. Outside click and Esc close it.' },
    { name: 'dgaMenuTrigger', type: 'directive', description: 'On a button inside dga-menu-anchor: click toggles the menu, ArrowDown opens it; keeps aria-expanded in sync.' },
    { name: 'dga-menu-group · label', type: 'string', default: "''", description: 'Uppercase group heading. Adjacent groups are separated by a divider.' },
    { name: 'dga-menu-group · selectable', type: 'boolean', default: 'false', description: 'Single-select behavior: activating an item sets value to the item value.' },
    { name: 'dga-menu-group · value', type: 'model<unknown>', default: 'undefined', description: 'Value of the selected item when selectable.' },
    { name: 'dga-menu-divider', type: 'component', description: 'Standalone 1px divider between items.' },
    { name: 'dga-menu-item · icon', type: 'string', default: "''", description: 'Leading 16px font icon name, without the dga-icon- prefix.' },
    { name: 'dga-menu-item · trailText', type: 'string', default: "''", description: 'Trailing small count / label text.' },
    { name: 'dga-menu-item · trailIcon', type: 'string', default: "''", description: 'Trailing font icon name. Replaces the selected checkmark.' },
    { name: 'dga-menu-item · selected', type: 'boolean', default: 'false', description: 'Selected state: primary-50 green tint with primary text / icon.' },
    { name: 'dga-menu-item · disabled', type: 'boolean', default: 'false', description: 'Disabled state; the item is skipped by keyboard navigation.' },
    { name: 'dga-menu-item · checkmark', type: 'boolean', default: 'true', description: 'Show a trailing check icon while selected.' },
    { name: 'dga-menu-item · value', type: 'unknown', default: 'undefined', description: 'Value used by a selectable dga-menu-group.' },
    { name: 'dga-menu-item · (activated)', type: 'output<void>', description: 'Emitted on click / Enter / Space when the item is enabled.' },
    { name: 'dgaMenuTrail', type: 'directive', description: 'Marks projected content (e.g. a tag) as the trailing element of an item.' },
    { name: 'dgaMenuTrailIcon', type: 'directive', description: 'Marks a projected inline SVG wrapper as the 20px trailing icon of an item.' },
    { name: 'dga-menu-switch · checked', type: 'model<boolean>', default: 'false', description: 'Trailing toggle state (is-on).' },
    { name: 'dga-menu-switch · disabled', type: 'boolean', default: 'false', description: 'Disables the trailing toggle.' },
    { name: 'dga-menu-switch · aria-label', type: 'string', default: "''", description: 'Accessible name of the toggle.' },
  ];
}
