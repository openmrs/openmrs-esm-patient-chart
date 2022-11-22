export const renderTitle = (t, title) =>
  t('openWorkspaceWarningHeader', "You haven't saved the {formTitle}", { formTitle: title });

export const renderTextBody = (t, type, workspaceTitle) =>
  type === 'form'
    ? workspaceTitle
      ? t(
          'openFormSpecificWarningText',
          'The {workspaceTitle} form will not be saved if you exit the patient chart now, please or discard the form before you exit.',
          { workspaceTitle },
        )
      : t(
          'openFormWarningText',
          'The form will not be saved if you exit the patient chart now, please or discard the form before you exit.',
        )
    : type === 'order'
    ? t(
        'openOrderBasketWarningText',
        'The orders will not be saved if you exit the patient chart now, please or discard the form before you exit.',
      )
    : t(
        'openVisitNoteWarningText',
        'The visit note will not be saved if you exit the patient chart now, please or discard the note before you exit.',
      );
