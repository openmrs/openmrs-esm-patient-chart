import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonText, Button } from '@carbon/react';
import { ChevronDown, ChevronUp } from '@carbon/react/icons';
import { ConfigurableLink, ErrorState } from '@openmrs/esm-framework';

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
  const headerTitle = t('contactDetails', 'Contact Details');
  const { data: formattedPatientLists, isLoading, isError } = usePatientLists(patientId);
  const [showPatientListDetails, setShowPatientListDetails] = React.useState(false);
  const togglePatientListDetails = React.useCallback((event: MouseEvent) => {
    event.stopPropagation();
    setShowPatientListDetails((value) => !value);
  }, []);

  return (
    <>
      <p className={styles.patientListsHeading}>
        {t('patientLists', 'Patient Lists')}{' '}
        {formattedPatientLists?.length ? <span>({formattedPatientLists?.length})</span> : null}
        <Button
          size="sm"
          kind="ghost"
          renderIcon={(props) =>
            showPatientListDetails ? <ChevronUp size={16} {...props} /> : <ChevronDown size={16} {...props} />
          }
          iconDescription={t('TogglePatientListDetails', 'Toggle patient List Details')}
          onClick={togglePatientListDetails}
        >
          {showPatientListDetails ? t('seeLess', 'See less') : t('seeAll', 'See all')}
        </Button>
      </p>
      <div className={styles.patientLists}>
        {(() => {
          if (isLoading) return <SkeletonText />;
          if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
          if (formattedPatientLists?.length && !showPatientListDetails) {
            return (
              <ul>
                {formattedPatientLists.slice(0, 5).map((r) => (
                  <li key={r.uuid} className={styles.relationship}>
                    <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/patient-list/${r.uuid}`}>
                      {r.display}
                    </ConfigurableLink>
                  </li>
                ))}
              </ul>
            );
          } else if (formattedPatientLists?.length && showPatientListDetails) {
            return (
              <ul>
                {formattedPatientLists.map((r) => (
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
