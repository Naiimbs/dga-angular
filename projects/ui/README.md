# @dga/ui

Angular components for the DGA (Saudi Digital Government Authority) design system.
Ported from the vanilla HTML/CSS/JS design system (branch `v2.0.0`), keeping its class
names, tokens and markup so the visual result is the same.

- Angular 20, 21 and 22
- Standalone components, signals, OnPush
- RTL (`dir="rtl"`) and dark mode (`<html data-theme="dark">`) through CSS
- No runtime dependencies besides Angular (`@angular/core`, `@angular/common`, `@angular/forms`)

**Contents:** [Requirements](#requirements) · [1. Install](#1-install) ·
[2. Add the styles](#2-add-the-styles) · [3. Add the font](#3-add-the-font) ·
[4. Use a component](#4-use-a-component) · [Forms](#forms) ·
[Modal and toast](#modal-and-toast) · [RTL and dark mode](#rtl-and-dark-mode) ·
[Components](#components) · [Troubleshooting](#troubleshooting) ·
[Updating](#updating) · [Developing the library](#developing-the-library)

---

## Requirements

| | |
| --- | --- |
| Angular | 20.x, 21.x or 22.x |
| Application style | Standalone components (the default since Angular 17). NgModule apps can import the components into a module's `imports` array. |
| `@angular/forms` | Required (installed by default in CLI projects). Form controls implement `ControlValueAccessor`. |

The steps below were tested on a new Angular 20 application created with `ng new`.

---

## 1. Install

The package is not on a public registry. Pick one of the two routes.

### Option A — install the tarball

In this workspace (`dga-angular`), build and pack the library:

```bash
npm run build:ui
```

```bash
npm run pack:ui
```

This creates `dist/ui/dga-ui-0.1.0.tgz`. In **your application**, install it by path:

```bash
npm install ../dga-angular/dist/ui/dga-ui-0.1.0.tgz
```

Adjust the path to where the file is. You can also copy the `.tgz` into your project
(for example `vendor/dga-ui-0.1.0.tgz`) and commit it, so teammates and CI install the same
file:

```bash
npm install ./vendor/dga-ui-0.1.0.tgz
```

### Option B — publish to your private registry

If your organisation has an npm registry (Azure Artifacts, GitHub Packages, Nexus,
Verdaccio…), publish once and install by name everywhere:

```bash
npm run build:ui
```

```bash
npm publish dist/ui --registry https://your-registry.example.com/
```

Then, in your application:

```bash
npm install @dga/ui
```

The `@dga` scope must be mapped to that registry in your `.npmrc`
(`@dga:registry=https://your-registry.example.com/`).

---

## 2. Add the styles

Open `angular.json` in your application and edit `projects → <app> → architect → build →
options → styles`.

```json
"styles": [
  "node_modules/@dga/ui/styles/dga.css",
  {
    "input": "node_modules/@dga/ui/styles/icons.css",
    "bundleName": "dga-icons",
    "inject": false
  },
  "src/styles.css"
]
```

Then load the icon bundle from `src/index.html`, inside `<head>`:

```html
<link rel="stylesheet" href="dga-icons.css">
```

What the two files are:

| File | Size | What it contains |
| --- | --- | --- |
| `dga.css` | about 150 kB (17 kB compressed) | Tokens, the DGA theme utilities, reset, accessibility helpers, dark mode. **Required.** |
| `icons.css` | about 9 MB (400 kB compressed) plus 61 font files | The DGA icon fonts. Needed by `<dga-icon>` and by every component that shows an icon (dropdown, checkbox, modal close button, alerts, …). |

`icons.css` is loaded as a separate bundle (`inject: false`) on purpose. Putting it
directly in the `styles` array works too, but it then counts toward the initial bundle
budget, and a production build fails with the default budget (`bundle initial exceeded
maximum budget`).

Each component brings its own CSS; nothing else has to be imported.

---

## 3. Add the font

The design system uses IBM Plex Sans Arabic. Add it to `src/index.html`, inside `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet">
```

If your environment cannot reach Google Fonts, host the font files yourself and declare the
`IBM Plex Sans Arabic` family with `@font-face` in your own stylesheet.

---

## 4. Use a component

Import what you need from `@dga/ui` into the component's `imports` array.

```ts
import { Component, signal } from '@angular/core';
import { DgaButton, DgaIcon, DgaTextInput } from '@dga/ui';

@Component({
  selector: 'app-root',
  imports: [DgaButton, DgaIcon, DgaTextInput],
  template: `
    <button dga-button variant="primary" (click)="save()">
      <dga-icon name="add-01" /> Save
    </button>

    <dga-text-input label="Full name" placeholder="Enter your name" [(value)]="name" />
    <p>Hello {{ name() }}</p>
  `,
})
export class App {
  protected readonly name = signal('');

  protected save(): void {}
}
```

Run `ng serve`. You should see a green DGA button with a plus icon and a labelled text field.

Notes:

- The button is an attribute on the native element: `<button dga-button>` or
  `<a dga-button>`. Links (`<a dga-link>`), chips (`<button dga-chip>`) and header actions
  work the same way. Everything else is an element such as `<dga-text-input>`.
- Icon names are the DGA icon names without the `dga-icon-` prefix (`add-01`, `search-01`).
- Boolean inputs can be written as bare attributes: `<button dga-button destructive>`.

---

## Forms

Form controls work three ways: their own two-way binding (`[(value)]`), reactive forms
(`formControlName` / `[formControl]`), and template-driven forms (`[(ngModel)]`).

```ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DgaButton, DgaCheckbox, DgaDropdown, DgaDropdownOption, DgaTextInput } from '@dga/ui';

@Component({
  selector: 'app-request-form',
  imports: [ReactiveFormsModule, DgaButton, DgaTextInput, DgaDropdown, DgaCheckbox],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <dga-text-input label="Email" type="email" formControlName="email" required />
      <dga-dropdown label="Region" placeholder="Select a region" [options]="regions" formControlName="region" />
      <dga-checkbox formControlName="terms">I accept the terms</dga-checkbox>
      <button dga-button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  `,
})
export class RequestForm {
  protected readonly regions: DgaDropdownOption<string>[] = [
    { value: 'riyadh', label: 'Riyadh' },
    { value: 'makkah', label: 'Makkah' },
  ];

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    region: new FormControl<string | null>(null, Validators.required),
    terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });

  protected submit(): void {}
}
```

Form controls: `dga-text-input`, `dga-textarea`, `dga-search-box`, `dga-dropdown`,
`dga-checkbox`, `dga-checkbox-group`, `dga-radio-group`, `dga-rating`, `dga-date-picker`,
`dga-date-range-picker`, `dga-file-upload`.

The components do not read validator state on their own. To show a validation error on a
text input, bind its `error` flag and put the message in `helperText`:

```html
<dga-text-input
  label="Email"
  formControlName="email"
  [error]="form.controls.email.touched && form.controls.email.invalid"
  [helperText]="form.controls.email.touched && form.controls.email.invalid ? 'Enter a valid email' : ''"
/>
```

Error inputs differ a little between controls (some take a message string); check the
component's props table in the demo app.

---

## Modal and toast

```ts
import { Component, inject, signal } from '@angular/core';
import { DgaButton, DgaModal, DgaModalActions, DgaToastContainer, DgaToastService } from '@dga/ui';

@Component({
  selector: 'app-root',
  imports: [DgaButton, DgaModal, DgaModalActions, DgaToastContainer],
  template: `
    <button dga-button variant="secondary-outline" (click)="confirmOpen.set(true)">Delete</button>

    <dga-modal [(open)]="confirmOpen" heading="Delete request?" description="This cannot be undone.">
      <dga-modal-actions>
        <button dga-button variant="secondary-outline" (click)="confirmOpen.set(false)">Cancel</button>
        <button dga-button destructive (click)="remove()">Delete</button>
      </dga-modal-actions>
    </dga-modal>

    <dga-toast-container position="top-end" />
  `,
})
export class App {
  private readonly toast = inject(DgaToastService);
  protected readonly confirmOpen = signal(false);

  protected remove(): void {
    this.confirmOpen.set(false);
    this.toast.show({ title: 'Deleted', variant: 'critical' });
  }
}
```

- Place **one** `<dga-toast-container />` in the root component. `DgaToastService` can then
  be injected anywhere; `show()` returns a handle with `dismiss()`.
- The modal traps focus, closes on Escape and backdrop click (both configurable), and
  restores focus when it closes.

---

## RTL and dark mode

Both are attributes on the root element. Set them in `index.html`, or switch at runtime.

```html
<html lang="ar" dir="rtl" data-theme="dark">
```

```ts
document.documentElement.dir = 'rtl';
document.documentElement.setAttribute('data-theme', 'dark');   // remove the attribute for light
```

`dir="rtl"` also works on any container to mirror only that part of the page.

Component texts (labels, aria-labels, "No results", month names…) are inputs with English
defaults. Pass Arabic strings through those inputs; the library does not switch language
by itself.

---

## Components

Everything is exported from `@dga/ui`. The class name is the selector in PascalCase with a
`Dga` prefix (`dga-text-input` → `DgaTextInput`).

| Group | Selectors |
| --- | --- |
| Actions | `button[dga-button]`, `a[dga-button]`, `a[dga-link]`, `button[dga-chip]`, `dga-icon` |
| Form inputs | `dga-text-input`, `dga-textarea`, `dga-search-box`, `dga-dropdown`, `dga-checkbox`, `dga-checkbox-group`, `dga-radio`, `dga-radio-group`, `dga-rating`, `dga-file-upload` |
| Dates | `dga-date-picker`, `dga-date-range-picker`, `dga-calendar`, `dga-date-field` |
| Navigation | `dga-nav-header`, `[dga-header-action]`, `dga-second-nav-header`, `dga-nav-drawer`, `dga-sidebar`, `dga-sidebar-nav`, `dga-slideout-menu`, `dga-footer`, `dga-breadcrumbs`, `dga-tabs` + `dga-tab`, `dga-pagination` |
| Menus | `dga-menu`, `dga-menu-item`, `dga-menu-group`, `dga-menu-divider`, `dga-menu-switch`, `dga-menu-anchor` + `[dgaMenuTrigger]` |
| Feedback | `dga-modal` + `dga-modal-actions`, `[dgaTooltip]`, `dga-tooltip`, `dga-notification`, `dga-toast` + `dga-toast-container` + `DgaToastService`, `dga-inline-alert`, `dga-progress-bar`, `dga-circular-progress`, `dga-progress-indicator`, `dga-skeleton` |
| Data display | `dga-card`, `dga-table`, `dga-tag`, `dga-status-tag`, `dga-avatar`, `dga-avatar-group`, `dga-accordion` + `dga-accordion-item`, `dga-filters` |
| Government | `dga-digital-stamp` |
| Page templates | `dga-form-template` (+ `dga-form-row`, `dga-form-feedback`, `dga-service-tabs`), `dga-service-page`, `dga-screen` (+ `dga-screen-grid`, `dga-screen-placeholder`) |

For each component's inputs, outputs and live examples, run the demo app in this workspace
(`npm start`, then http://localhost:4200). Every component page has a live demo with a
control panel and a props table. Your editor also shows the inputs from the package's type
definitions.

---

## Troubleshooting

**`bundle initial exceeded maximum budget` in a production build**
`icons.css` is in the `styles` array as a plain string. Load it as a separate bundle as
shown in [step 2](#2-add-the-styles), or raise the `initial` budget in `angular.json`.

**Icons show as empty squares or nothing at all**
The icon stylesheet is not loaded. Check that the `dga-icons` entry is in `angular.json`
and that `index.html` has `<link rel="stylesheet" href="dga-icons.css">`. Restart
`ng serve` after editing `angular.json`.

**Components appear unstyled, or colours are missing**
`dga.css` is not loaded; all components read their colours and spacing from its tokens.
Check the path in `angular.json` and restart `ng serve`.

**Production build is slow after adding the icons**
Expected: minifying the 9 MB icon stylesheet took about two minutes on the test machine.
`ng serve` is not affected in the same way.

**`npm install` reports a peer dependency conflict**
The package supports Angular 20 to 22. Projects on Angular 19 or older need to upgrade
first (`ng update @angular/core @angular/cli`).

**`'dga-…' is not a known element`**
The component class is missing from the `imports` array of the component whose template
uses it.

**Plain markup with design-system classes (`class="btn btn-primary"`) is unstyled**
Component CSS is loaded when the Angular component is rendered. Use the component
(`<button dga-button>`) instead of raw class names.

**Requests to `/DGA_UI/…woff` return 404**
The vendored DGA theme declares font files at that path that are not part of the design
system repository. The Google Fonts link from [step 3](#3-add-the-font) provides the same
typeface, so the 404s are harmless.

---

## Updating

For a new version of the library:

1. Raise `version` in `projects/ui/package.json`.
2. Run `npm run build:ui`, then `npm run pack:ui` (or publish to the registry).
3. In the application, install the new tarball or `npm install @dga/ui@latest`.

---

## Developing the library

Run these in the `dga-angular` workspace.

| Command | What it does |
| --- | --- |
| `npm start` | Runs the demo app at http://localhost:4200 against the library source |
| `npm run build:ui` | Builds the library to `dist/ui` |
| `npm run pack:ui` | Creates the installable `.tgz` in `dist/ui` |
| `npm run gen:routes` | Regenerates demo routes from `projects/demo/src/app/pages` |

`CONVENTIONS.md` (next to this file) describes how components are ported and structured.
