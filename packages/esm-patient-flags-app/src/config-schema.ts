import { Type, validators } from '@openmrs/esm-framework';

export interface FlagAction {
  flagName: string;
  url?: string;
  workspace?: string;
}

export interface TagAction {
  tagName: string;
  url?: string;
  workspace?: string;
}

/**
 * Available tag color options based on Carbon 'Tag' component 'type' prop.
 */
export const carbonTagColors = [
  'red',
  'magenta',
  'purple',
  'blue',
  'cyan',
  'teal',
  'green',
  'gray',
  'cool-gray',
  'warm-gray',
  'high-contrast',
  'outline',
] as const;
export type CarbonTagColor = (typeof carbonTagColors)[number];

export const tagColors = [...carbonTagColors, 'orange'] as const;
export type TagColor = (typeof tagColors)[number];

export interface PriorityConfig {
  priority: string;
  color: TagColor;
  isRiskPriority: boolean;
}

export interface ConfigObject {
  allowFlagDeletion: boolean;
  flagActions: Array<FlagAction>;
  tagActions: Array<TagAction>;
  priorities: Array<PriorityConfig>;
}

export const configSchema = {
  allowFlagDeletion: {
    _type: Type.Boolean,
    _default: true,
    _description:
      'If true, an edit button will be shown with the flags list. This edit button will launch a workspace that allows the user to hide/delete a flag for a particular patient. If the flag is generated again, it will reappear.',
  },
  flagActions: {
    _type: Type.Array,
    _default: [],
    _description: 'Actions to perform when a specific flag is clicked. Each flag can have a url or workspace action.',
    _elements: {
      flagName: {
        _type: Type.String,
        _description: 'The name of the flag definition (not the message).',
      },
      url: {
        _type: Type.String,
        _description:
          'URL to navigate to when the flag is clicked. Supports template variables: ${patientUuid}, ${openmrsSpaBase}.',
        _default: null,
      },
      workspace: {
        _type: Type.String,
        _description: 'Name of the workspace to launch when the flag is clicked.',
        _default: null,
      },
    },
  },
  tagActions: {
    _type: Type.Array,
    _default: [],
    _description:
      'Actions to perform when a flag with a specific tag is clicked. Each tag can have a url or workspace action. Flag-specific actions take precedence over tag actions. If a flag has multiple tags, the first configured tag action that matches will be used.',
    _elements: {
      tagName: {
        _type: Type.String,
        _description: 'The display name of the tag.',
      },
      url: {
        _type: Type.String,
        _description:
          'URL to navigate to when the flag is clicked. Supports template variables: ${patientUuid}, ${openmrsSpaBase}.',
        _default: null,
        _validators: [validators.isUrlWithTemplateParameters(['patientUuid'])],
      },
      workspace: {
        _type: Type.String,
        _description: 'Name of the workspace to launch when the flag is clicked.',
        _default: null,
      },
    },
  },
  priorities: {
    _type: Type.Array,
    _default: [
      { priority: 'risk', color: 'high-contrast', isRiskPriority: true },
      { priority: 'info', color: 'orange', isRiskPriority: false },
    ],
    _description:
      'Styling configuration for flag priorities. Each entry maps a priority name to its visual appearance. Priority matching is case-insensitive.',
    _elements: {
      priority: {
        _type: Type.String,
        _description: 'The name of the priority, as configured in the backend (case-insensitive).',
      },
      color: {
        _type: Type.String,
        _description: `The color for flags with this priority. Must be one of: ${tagColors.join(', ')}.`,
        _default: 'orange',
        _validators: [validators.oneOf(tagColors)],
      },
      isRiskPriority: {
        _type: Type.Boolean,
        _description:
          'Whether this priority is considered a "risk" priority. Risk priorities show the 🚩 flag icon and are counted by the risk count extension.',
        _default: false,
      },
    },
  },
};
