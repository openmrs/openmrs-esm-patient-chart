interface HTMLForm {
  formUuid: string;
  formName: string;
  formAppUrl: string;
  UIPage: 'enterHtmlFormWithSimpleUi' | 'enterHtmlFormWithStandardUi';
}

export const CoreHTMLForms: Array<HTMLForm> = [
  {
    formUuid: 'd2c7532c-fb01-11e2-8ff2-fd54ab5fdb2a',
    formName: 'Admission (Simple)',
    formAppUrl: 'simpleAdmission',
    UIPage: 'enterHtmlFormWithStandardUi',
  },
  {
    formUuid: 'b5f8ffd8-fbde-11e2-8ff2-fd54ab5fdb2a',
    formName: 'Discharge (Simple)',
    formAppUrl: 'simpleDischarge',
    UIPage: 'enterHtmlFormWithStandardUi',
  },
  {
    formUuid: 'a007bbfe-fbe5-11e2-8ff2-fd54ab5fdb2a',
    formName: 'Transfer Within Hospital (Simple)',
    formAppUrl: 'simpleTransfer',
    UIPage: 'enterHtmlFormWithStandardUi',
  },
  {
    formUuid: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
    formName: 'Visit Note',
    formAppUrl: 'simpleVisitNote',
    UIPage: 'enterHtmlFormWithStandardUi',
  },
  {
    formUuid: 'a000cb34-9ec1-4344-a1c8-f692232f6edd',
    formName: 'Vitals',
    formAppUrl: 'vitals',
    UIPage: 'enterHtmlFormWithSimpleUi',
  },
];
