import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from '@carbon/react';
import type { AuditEventType, AuditFieldDiff } from '../types';

interface AuditLogEventTagProps {
  eventType: AuditEventType | string;
  changes?: AuditFieldDiff[];
}

type KnownTagType = 'green' | 'blue' | 'red';

const VOID_FLAGS = new Set(['voided', 'personVoided']);

// A void/restore is recorded by Envers as a MOD; derive it from the voided-flag transition
// so the collapsed row reads distinctly instead of a generic "Updated".
function detectVoidTransition(eventType: string, changes: AuditFieldDiff[] = []): 'void' | 'restore' | null {
  if (eventType.toUpperCase() !== 'MOD') {
    return null;
  }
  const flag = changes.find((change) => VOID_FLAGS.has(change.fieldName) && change.changed !== false);
  if (flag?.currentValue === 'true') {
    return 'void';
  }
  if (flag?.currentValue === 'false' && flag?.oldValue === 'true') {
    return 'restore';
  }
  return null;
}

function classifyEvent(eventType: string): KnownTagType | null {
  const normalized = eventType.toLowerCase();
  if (/\b(add|added|create|created|insert)/.test(normalized)) {
    return 'green';
  }
  if (/\b(mod|modif|modified|updat|updated|edit)/.test(normalized)) {
    return 'blue';
  }
  if (/\b(del|delet|deleted)/.test(normalized)) {
    return 'red';
  }
  return null;
}

const AuditLogEventTag: React.FC<AuditLogEventTagProps> = ({ eventType, changes }) => {
  const { t } = useTranslation();
  const raw = String(eventType ?? '');

  const transition = detectVoidTransition(raw, changes);
  if (transition === 'void') {
    return (
      <Tag type="magenta" size="md">
        {t('voided', 'Voided')}
      </Tag>
    );
  }
  if (transition === 'restore') {
    return (
      <Tag type="teal" size="md">
        {t('restored', 'Restored')}
      </Tag>
    );
  }

  const type = classifyEvent(raw);
  if (!type) {
    return <Tag type="gray">{eventType}</Tag>;
  }

  const labels: Record<KnownTagType, string> = {
    green: t('created', 'Created'),
    blue: t('updated', 'Updated'),
    red: t('deleted', 'Deleted'),
  };

  return (
    <Tag type={type} size="md">
      {labels[type]}
    </Tag>
  );
};

export default AuditLogEventTag;
