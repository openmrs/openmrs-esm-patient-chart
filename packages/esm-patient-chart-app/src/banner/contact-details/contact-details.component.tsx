import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonText, Button } from '@carbon/react';
import { ChevronDown, ChevronUp } from '@carbon/react/icons';
import { ConfigurableLink, ErrorState, navigate } from '@openmrs/esm-framework';

import { usePatientContactAttributes } from '../hooks/usePatientAttributes';
import { usePatientLists } from './patient-list.resource';
import { useRelationships } from './relationships.resource';
import styles from './contact-details.scss';

interface ContactDetailsProps {
  address: Array<fhir.Address>;
  telecom: Array<fhir.ContactPoint>;
  patientId: string;
}

const Address: React.FC<{ address?: fhir.Address }> = ({ address }) => {
  const { t } = useTranslation();

  return (
    <>
      <p className={styles.heading}>{t('address', 'Address')}</p>
      <div className={styles.listItem}>
        {(() => {
          if (Object.keys(address).length) {
            return (
              <ul>
                <li>{address.postalCode}</li>
                <li>{address.city}</li>
                <li>{address.state}</li>
                <li>{address.country}</li>
              </ul>
            );
          }

          if (Object.keys(address).length === 0) {
            return <p>--</p>;
          }
        })()}
      </div>
    </>
  );
};

const Contact: React.FC<{ telecom: Array<fhir.ContactPoint>; patientUuid: string }> = ({ telecom, patientUuid }) => {
  const { t } = useTranslation();
  const { isLoading, contactAttributes } = usePatientContactAttributes(patientUuid);
  const telecomValue = telecom?.length ? telecom[0].value : '--';

  return (
    <>
      <p className={styles.heading}>{t('contactDetails', 'Contact Details')}</p>
      <div className={styles.listItem}>
        {(() => {
          if (isLoading) return <SkeletonText />;
          if (contactAttributes?.length) {
            return (
              <ul>
                {contactAttributes?.map(({ attributeType, value, uuid }) => (
                  <li key={uuid}>
                    {attributeType.display} : {value}
                  </li>
                ))}
              </ul>
            );
          }

          return <p>--</p>;
        })()}
      </div>
    </>
  );
};

const Relationships: React.FC<{ patientId: string }> = ({ patientId }) => {
  const { t } = useTranslation();
  const { data: relationships, isLoading } = useRelationships(patientId);

  return (
    <>
      <p className={styles.heading}>{t('relationships', 'Relationships')}</p>
      <div className={styles.listItem}>
        {(() => {
          if (isLoading) return <SkeletonText />;
          if (relationships?.length) {
            return (
              <ul>
                {relationships.map((r) => (
                  <li key={r.uuid} className={styles.relationship}>
                    <div>{r.display}</div>
                    <div>{r.relationshipType}</div>
                    <div>{`${r.relativeAge} ${r.relativeAge === 1 ? 'yr' : 'yrs'}`}</div>
                  </li>
                ))}
              </ul>
            );
          }
          return <p>--</p>;
        })()}
      </div>
    </>
  );
};

const PatientLists: React.FC<{ patientId: string }> = ({ patientId }) => {
  const { t } = useTranslation();
  const { lists, isLoading, isError } = usePatientLists(patientId);
  const headerTitle = t('contactDetails', 'Contact Details');

  return (
    <>
      <div className={styles.container}>
        <p className={styles.heading}>
          <span>{t('patientLists', 'Patient Lists')}</span>
          {lists?.length ? <span style={{ marginLeft: '0.25rem' }}>({lists?.length})</span> : null}
        </p>
        <ConfigurableLink style={{ textDecoration: 'none' }} to={`\${openmrsSpaBase}/patient-list`}>
          {t('seeAll', 'See all')}
        </ConfigurableLink>
      </div>
      <div className={styles.patientLists}>
        {(() => {
          if (isLoading) return <SkeletonText />;
          if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
          if (lists?.length) {
            return (
              <ul>
                {lists.slice(0, 5).map((r) => (
                  <li key={r.uuid} className={styles.relationship}>
                    <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/patient-list/${r.uuid}`}>
                      {r.display}
                    </ConfigurableLink>
                  </li>
                ))}
              </ul>
            );
          }
          return <p>--</p>;
        })()}
      </div>
    </>
  );
};

const ContactDetails: React.FC<ContactDetailsProps> = ({ address, telecom, patientId }) => {
  const currentAddress = address ? address.find((a) => a.use === 'home') : undefined;
  return (
    <div className={styles.contactDetails}>
      <div className={styles.row}>
        <div className={styles.col}>
          <Address address={currentAddress} />
        </div>
        <div className={styles.col}>
          <Contact telecom={telecom} patientUuid={patientId} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Relationships patientId={patientId} />
        </div>
        <div className={styles.col}>
          <PatientLists patientId={patientId} />
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
