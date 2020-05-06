[![Build Status](https://travis-ci.org/openmrs/openmrs-esm-patient-chart.svg?branch=master)](https://travis-ci.org/openmrs/openmrs-esm-patient-chart)

# Openmrs ESM Patient Chart

## What is this?

openmrs-esm-patient-chart is a patient dashboard microfrontend for the 
OpenMRS SPA. It provides a simple dashboard with cards detailing the 
patient's information, such as vitals, demographic and relationships.

## How do I install this?

Requirements: Java 8, Latest NodeJS & NPM, Latest Git, Latest OpenMRS 
Platform with the Latest [SPA Module](https://github.com/openmrs/openmrs-module-spa) 
installed

Currently, there are no compiled releases for openmrs-esm-patient-chart. 
To obtain this module, use the following steps:

```bash
git clone https://github.com/openmrs/openmrs-esm-patient-chart
cd openmrs-esm-patient-chart
npm install
npm run build
```

Serve the built dist/openmrs-esm-patient-chart.js and configure it in your SPA Module's root-config

Then, have a look at the
[Frontend Implementer Documentation](https://wiki.openmrs.org/display/projects/Frontend+Implementer+Documentation)
for installing microfrontends for the SPA Module.

## How do I use this?

openmrs-esm-patient-chart is registered as a
[core application](https://github.com/openmrs/openmrs-esm-root-config/blob/master/src/single-spa-applications/core-applications.js)
inside of openmrs-esm-root-config. This means that it will automatically 
activate whenever you are on one of the frontend routes that it controls. 
The openmrs-esm-patient-chart module serves the route
`<spa root>/patient/:uuid/chart`.

## What is the layout of patient chart?

openmrs-esm-patient-chart consists of four parts: patient banner, primary navigation, chart review and a workspace. 

**Patient banner**: This is always displayed at the top of the screen. It displays the patients name, age, birthdate, gender and the preferred OpenMRS identifier for that patient. Additional demographic data may be displayed by clicking on more. Presently, there are no configuration options for this component.

![image2020-3-7_14-52-22](https://user-images.githubusercontent.com/1031876/81237394-65060500-8fb4-11ea-8318-39031036303e.png)

**Primary navigation**: This component is presently rendered underneath the patient banner and renders items horizontally. The default setting displays the following items: Summary, Results, Orders, Encounters, Conditions, Programs, Allergies, Appointments. This is a rapidly changing area of the module and the preceding items are frequently changing. The primary nav bar is 100% configurable. An implementation can utilize any of the core widgets (please see openmrs-esm-patient-chart-widgets to learn more) or utilize widgets from an external es6 module. 

![image2020-3-7_14-56-53](https://user-images.githubusercontent.com/1031876/81237430-82d36a00-8fb4-11ea-94ac-f1c7e1622656.png)

**Chart review**: The chart review section is the primary area of the window for displaying historical patient data. It will use the whole screen under the navigation bar unless the workspace is active (which utilizes the right side of the screen). Click on items in the navigation pane will cause them to render here. 

**Workspace**: The workspace exists to allow a user to simultaneously be "doing" work, e.g. writing a note, placing an order, etc, while reviewing patient data. 

![image2020-3-7_15-3-27](https://user-images.githubusercontent.com/1031876/81237493-a3032900-8fb4-11ea-8e25-0bac0377f173.png)

## How do I configure this module?

This module is is designed to be driven by configuration files. 
*openmrs-esm-patient-chart itself contains no components for displaying 
patient data*. Instead, the implementation must use either the default 
configuration (see below) or create its own configuration to drive the 
patient chart.

Configurations can also be hot-loaded such that different 
configurations could be used to support different user roles. 

Please see 
[esm-module-config](https://github.com/openmrs/openmrs-esm-module-config#openmrs-esm-config)
for information about how to configure your implementation.

A patient chart configuration consists of four primary sections: primaryNavbar, 
widgetDefinitions, dashboardDefinitions, tabbedViewDefinitions. We will discuss 
each of these in sections and then provide a comprehensive example of a configuration 
file at the end. 

Routes are mapped to views. We provide three types of views: a *widget*, a *dashboard*,
and a *tabbedView*. 

### Widgets

A widget is simply a component. As of this writing, all widgets are React components,
but widgets can be written in different frameworks.
A widget might be something like a card displaying conditions, or a set of cards
for displaying orders.

Widgets are defined using the `widgetDefinitions` configuration option. 

```json
{
  "widgetDefinitions": [
    {
      "name": "myWidget",
      "esModule" : "@my-moodule-with-widgets"
    }
  ]
}
```

The chart rendering engine will attempt to load the above module, using SystemJS 
to dynamically load my-module-with-widgets. Note: this module must be listed in 
your import map in order for SystemJS to be able to import it. Please see here 
for more instructions on managing your import map. On import, System.JS provides 
an es6 module. Based on the above configuration, the rendering engine expects there 
to be a property within the module called "myWidget".  If you are creating your 
own module to serve widgets, please be sure to use the exact same name to export 
the widget as you use in the widget definition.

## Dashboards

A dashboard is a collection of widgets with a layout. We provide a simple layout manager to make it relatively straightforward to configure your dashboards. A dashboard definition consists of the following

```json
{
  "name": "dashboardName",
  "title": "title of dashboard",
  "layout": {
    "columns": 3
  },
  "widgets": [
    {
      "name": "widget1",
      "esModule": "@widget1-module",
      "layout": {
        "columnSpan": 2,
        "rowSpan": 1
      }
    },
    {
      "name": "widget2",
      "esModule": "@widget2-module"
    }
  ]
}
```

Dashboards display a collection of widgets in a grid layout (see 
[css-grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout), if you're interested).
The number of columns is configurable.

You can specify the number of columns and rows you want each widget to occupy 
using `layout.columnSpan` and `layout.rowSpan` properties within the widget
configuration. The widgets are rendered in the order they are listed in the config.

*Example*: Let's set up a dashboard with 4 columns. If `widget1` is set to 3 
columns, and `widget2` is set to 2 columns, then `widget1` will be displayed on the first 
row. Because 3 + 2 = 5 > 4, `widget2` will be bumped to the next row and occupy the first 
two columns.

If no layout is specified in the configuration, the dashboard will default 
to using 1 column and 1 row to display the widget. 

## TabbedViews

TabbedViews exist to support scenarios where the user may want to have a second level of navigation under the primary navigation bar. In configuration consists solely of defining a name, title and navbar:

```json
{
  "name": "resultsTabbedView",
  "title": "Results",
  "navbar": [
    {
      "label": "Overview",
      "path": "/overview",
      "view": "resultsOverviewDashboard"
    },
    {
      "label": "Vitals",
      "path": "/vitals",
      "view": "VitalsSummary"
    },
    {
      "label": "Height and Weight",
      "path": "/heightAndWeight",
      "view": "HeightAndWeightSummary"
    }
  ]
}
```

![image2020-3-7_17-25-21](https://user-images.githubusercontent.com/1031876/81238826-e57a3500-8fb7-11ea-984b-176257e9736e.png)

### Primary navigation bar

The primary navigation bar uses an identical configuration set up as the navbar in the TabbedView.

```json
{
  "primaryNavbar": [
    {
      "label": "Summary",
      "view": "summaryDashboard",
      "path": "/summary"
    },
    {
      "label": "Results",
      "view": "resultsTabbedView",
      "path": "/results"
    },
    {
      "label": "Conditions",
      "view": "conditionsOverview",
      "path": "/conditions"
    }
  ]
}
```

This will generate a primary navigation bar with three items. Each item has 
three required properties: `label`, `view` and `path`.
- `label` is what will be displayed to the user on the navigation bar
- `view` is a generic term we will use to refer to what will be displayed by clicking on the link
- `path` assigns the widget a path so that it can be linked to directly. In the example above,
    the conditionsOverview widget will be served at `/patient/:patientUuuid/chart/conditions`.
