# dga-angular

Angular workspace providing `@dga/ui` — standalone Angular UI library implementing the design system components, accompanied by an interactive documentation and demo application.

## Overview

- **Angular**: 20+, 21+, 22+
- **Architecture**: Standalone components, Angular Signals (`input()`, `model()`, `computed()`), `OnPush` change detection
- **Styling**: Native CSS tokens, Light and Dark themes, bidirectional (RTL and LTR) layout support
- **Forms**: Implements `ControlValueAccessor` for integration with Reactive Forms and Template Forms
- **Dependencies**: Zero runtime UI dependencies beyond Angular core packages

## Workspace Structure

| Directory | Purpose |
| :--- | :--- |
| `projects/ui` | The `@dga/ui` component library (components, tokens, styles, icons) |
| `projects/demo` | Interactive documentation and demo application |
| `tools/gen-routes.mjs` | Route generation utility for documentation pages |

## Available Components

The library includes 40+ standalone UI components and templates:

- **Actions & Inputs**: Button, TextInput, Textarea, SearchBox, Dropdown, Checkbox, Radio, DatePicker, FileUpload, Rating, DigitalStamp
- **Navigation**: NavHeader, SecondNavHeader, NavDrawer, Sidebar, SlideoutMenu, Breadcrumbs, Tabs, Menus, Pagination, Footer
- **Feedback & Overlays**: Modal, Tooltip, Notification, NotificationToast, InlineAlert
- **Data & Layout**: Cards, Tables, Avatar, Chips, Tags, StatusTag, Filters, Accordion, ProgressBar, ProgressIndicator, Skeleton, Icons
- **Screens & Patterns**: FormTemplate, ServicePage, System Screens (Error, Success, Maintenance)

## Installation & Consumption

### 1. Build and Package

```bash
# Build the UI library
npm run build:ui

# Create local tarball in dist/ui/
npm run pack:ui
```

### 2. Install in an Angular Application

```bash
npm install ../dga-angular/dist/ui/dga-ui-0.1.0.tgz
```

### 3. Configure Styles (`angular.json`)

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

## Development

```bash
# Install dependencies
npm install

# Run the local documentation and demo application
npm start
```

The interactive demo will be available at `http://localhost:4200`.

### Scripts

- `npm start`: Starts the demo application with live reload
- `npm run build:ui`: Builds `@dga/ui` via `ng-packagr`
- `npm run pack:ui`: Generates the `.tgz` package in `dist/ui`
- `npm run build`: Builds both the library and the demo app
- `npm run gen:routes`: Regenerates demo routes after adding component pages
- `npm test`: Runs Karma / Jasmine test suite

## Author

Developed and maintained by [Naiim Bsili](https://github.com/naiimbs).

## License

MIT
