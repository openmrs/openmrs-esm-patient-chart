import React from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonText, Button } from '@carbon/react';
import { ChevronDown, ChevronUp, OverflowMenuVertical } from '@carbon/react/icons';

import { useRelationships } from './relationships.resource';
import { usePatientContactAttributes } from '../hooks/usePatientAttributes';
import styles from './contact-details.scss';
import { usePatientLists } from './patientList.resource';
import { ConfigurableLink } from '@openmrs/esm-framework';

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
      <ul>
        {address ? (
          <>
            <li>{address.postalCode}</li>
            <li>{address.city}</li>
            <li>{address.state}</li>
            <li>{address.country}</li>
          </>
        ) : (
          '--'
        )}
      </ul>
    </>
  );
};

const Contact: React.FC<{ telecom: Array<fhir.ContactPoint>; patientUuid: string }> = ({ telecom, patientUuid }) => {
  const { t } = useTranslation();
  const value = telecom?.length ? telecom[0].value : '--';
  const { isLoading, contactAttributes } = usePatientContactAttributes(patientUuid);

  return (
    <>
      <p className={styles.heading}>{t('contactDetails', 'Contact Details')}</p>

      <ul>
        <li>{value}</li>
        {isLoading ? (
          <SkeletonText />
        ) : (
          contactAttributes?.map(({ attributeType, value, uuid }) => (
            <li key={uuid}>
              {attributeType.display} : {value}
            </li>
          ))
        )}
      </ul>
    </>
  );
};

const Relationships: React.FC<{ patientId: string }> = ({ patientId }) => {
  const { t } = useTranslation();
  const { data: relationships, isLoading } = useRelationships(patientId);

  return (
    <>
      <p className={styles.heading}>{t('relationships', 'Relationships')}</p>
      <>
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
      </>
    </>
  );
};

const PatientLists: React.FC<{ patientId: string }> = ({ patientId }) => {
  const { t } = useTranslation();
  const { data: formattedPatientLists, isLoading } = usePatientLists(patientId);
  const [showPatientListDetails, setShowPatientListDetails] = React.useState(false);
  const togglePatientListDetails = React.useCallback((event: MouseEvent) => {
    event.stopPropagation();
    setShowPatientListDetails((value) => !value);
  }, []);

  return (
    <>
      <p className={styles.heading}>
        {t('patientLists', 'Patient Lists')}({formattedPatientLists?.length})
        <Button
          kind="ghost"
          renderIcon={(props) =>
            showPatientListDetails ? <ChevronUp size={16} {...props} /> : <ChevronDown size={16} {...props} />
          }
          iconDescription="Toggle patient List Details"
          onClick={togglePatientListDetails}
          style={{ marginTop: '-0.25rem' }}
        >
          {showPatientListDetails ? t('seeLess', 'See less') : t('seeAll', 'See All')}
        </Button>
      </p>
      <>
        {(() => {
          if (isLoading) return <SkeletonText />;
          if (formattedPatientLists?.length && !showPatientListDetails) {
            return (
              <ul>
                {formattedPatientLists.slice(0, 1).map((r) => (
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
      </>
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
