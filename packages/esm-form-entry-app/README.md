# esm-form-entry-app

This widget encapsulates the form entry capabilities of the AMPATH form engine. It's essentially a wrapper around an Angular application that renders JSON schemas built using the AMPATH form engine as HTML forms. The user can fill and submit forms and receive success or error notifications upon submission. Read the docs [here](https://ampath-forms.vercel.app). 

## Development

From the root of the project, run:

```bash
yarn run --sources 'packages/esm-form-entry-app
```

This should fire up a development server on port --4200. You can use `--port` to specify an alternative port.