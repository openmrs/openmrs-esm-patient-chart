import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from 'carbon-components-react';
import { useRelationships } from './relationships.resource';
import styles from './contact-details.scss';

interface ContactDetailsProps {
  address: Array<fhir.Address>;
  telecom: Array<fhir.ContactPoint>;
  patientId: string;
}

const Address: React.FC<{ address: fhir.Address }> = ({ address }) => {
  const { t } = useTranslation();
  const { city, country, postalCode, state } = address;

  return (
    <div className={styles.col}>
      <p className={styles.heading}>{t('address', 'Address')}</p>
      <ul>
        <li>{postalCode}</li>
        <li>{city}</li>
        <li>{state}</li>
        <li>{country}</li>
      </ul>
    </div>
  );
};

const Contact: React.FC<{ telecom: Array<fhir.ContactPoint> }> = ({ telecom }) => {
  const { t } = useTranslation();
  const value = telecom ? telecom[0].value : '-';

  return (
    <div className={styles.col}>
      <p className={styles.heading}>{t('contactDetails', 'Contact Details')}</p>
      <ul>
        <li>{value}</li>
      </ul>
    </div>
  );
};

const Relationships: React.FC<{ patientId: string }> = ({ patientId }) => {
  const { t } = useTranslation();
  const { data: relationships, isLoading } = useRelationships(patientId);

  return (
    <div className={styles.col}>
      <p className={styles.heading}>{t('relationships', 'Relationships')}</p>
      <>
        {(() => {
          if (isLoading) return <InlineLoading description="Loading..." role="progressbar" />;
          if (relationships?.length) {
            return (
              <ul style={{ width: '50%' }}>
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
          return <p>-</p>;
        })()}
      </>
    </div>
  );
};

const ContactDetails: React.FC<ContactDetailsProps> = ({ address, telecom, patientId }) => {
  const currentAddress = address.find((a) => a.use === 'home');

  return (
    <div className={styles.verticalLine}>
      <hr className={styles.hr} />
      <div className={styles.contactDetails}>
        <div className={styles.row}>
          <Address address={currentAddress} />
          <Contact telecom={telecom} />
        </div>
        <hr className={styles.hr} />
        <div className={styles.row}>
          <Relationships patientId={patientId} />
        </div>
      </div>
      <hr className={styles.hr} />
    </div>
  );
};

export default ContactDetails;
