import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from '@carbon/react';
import type { AuditEventType } from '../types';

interface AuditLogEventTagProps {
  eventType: AuditEventType | string;
}

type KnownTagType = 'green' | 'blue' | 'red';

function classifyEvent(eventType: string): KnownTagType | null {
  const normalized = eventType.toLowerCase();
  if (/\b(add|added|create|created|insert)/.test(normalized)) {
    return 'green';
  }
  if (/\b(mod|modif|modified|updat|updated|edit)/.test(normalized)) {
    return 'blue';
  }
  if (/\b(del|delet|deleted|void|voided|retire|retired|purge)/.test(normalized)) {
    return 'red';
  }
  return null;
}

const AuditLogEventTag: React.FC<AuditLogEventTagProps> = ({ eventType }) => {
  const { t } = useTranslation();
  const type = classifyEvent(String(eventType ?? ''));

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
