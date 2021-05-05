import React from 'react';
import InlineLoading from 'carbon-components-react/es/components/InlineLoading';
import { createErrorHandler } from '@openmrs/esm-framework';
import { fetchPatientRelationships, Relationship } from './relationships.resource';
import styles from './contact-details.scss';
import { useTranslation } from 'react-i18next';

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
  const [relationships, setRelationships] = React.useState<Array<ExtractedRelationship>>(null);

  React.useEffect(() => {
    function extractRelationshipData(relationships: Array<Relationship>): Array<ExtractedRelationship> {
      const relationshipsData = [];
      for (const r of relationships) {
        if (patientId === r.personA.uuid) {
          relationshipsData.push({
            uuid: r.uuid,
            display: r.personB.person.display,
            relativeAge: r.personB.person.age,
            relativeUuid: r.personB.uuid,
            relationshipType: r.relationshipType.bIsToA,
          });
        } else {
          relationshipsData.push({
            uuid: r.uuid,
            display: r.personA.person.display,
            relativeAge: r.personA.person.age,
            relativeUuid: r.personA.uuid,
            relationshipType: r.relationshipType.aIsToB,
          });
        }
      }
      return relationshipsData;
    }

    fetchPatientRelationships(patientId)
      .then(({ data: { results } }) => {
        if (results.length) {
          const relationships = extractRelationshipData(results);
          setRelationships(relationships);
        }
      })
      .catch(createErrorHandler());
  }, [patientId]);

  const RenderRelationships: React.FC = () => {
    if (relationships.length) {
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
  };

  return (
    <div className={styles.col}>
      <p className={styles.heading}>Relationships</p>
      {relationships ? <RenderRelationships /> : <InlineLoading description="Loading..." />}
    </div>
  );
};

const ContactDetails: React.FC<ContactDetailsProps> = ({ address, telecom, patientId }) => {
  const currentAddress = address.find((a) => a.use === 'home');

  return (
    <div className={styles.contactDetails}>
      <div className={styles.row}>
        <Address address={currentAddress} />
        <Contact telecom={telecom} />
      </div>
      <div className={styles.row}>
        <Relationships patientId={patientId} />
      </div>
    </div>
  );
};

export default ContactDetails;

type ContactDetailsProps = {
  address: Array<fhir.Address>;
  telecom: Array<fhir.ContactPoint>;
  patientId: string;
};

type ExtractedRelationship = {
  uuid: string;
  display: string;
  relativeAge: number;
  relativeUuid: string;
  relationshipType: string;
};
