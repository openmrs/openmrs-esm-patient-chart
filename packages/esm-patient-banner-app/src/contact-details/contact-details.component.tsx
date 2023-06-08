import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { ConfigurableLink, navigate, parseDate, useConfig } from '@openmrs/esm-framework';
import { useRelationships } from './relationships.resource';
import { usePatientContactAttributes, usePatientListsForPatient } from '../hooks/usePatientAttributes';
import { ConfigObject } from '../config-schema';
import styles from './contact-details.scss';

interface ContactDetailsProps {
  address: Array<fhir.Address>;
  telecom: Array<fhir.ContactPoint>;
  patientId: string;
  deceased: boolean;
  isPatientBannerSmallSize: boolean;
}

const PatientList: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { data: cohorts, isLoading, mutateLists } = usePatientListsForPatient(patientUuid);
  const { t } = useTranslation();

  if (isLoading) {
    return <InlineLoading />;
  }

  if (cohorts.length > 0) {
    const sorted = cohorts.sort((a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime());
    const slicedLists = sorted.slice(0, 3);
    return (
      <>
        <p className={styles.heading}>
          {t('patientLists', 'Patient Lists ({totalLists})', {
            totalLists: cohorts.length,
          })}
        </p>
        {slicedLists.map((cohort) => (
          <p>
            <ConfigurableLink
              to={`${window.spaBase}/home/patient-lists/${cohort.uuid}`}
              className={styles.pLink}
              key={cohort.uuid}
            >
              {cohort.name}
            </ConfigurableLink>
          </p>
        ))}
        <p>
          {cohorts.length > 3
            ? t('seeMore', 'see all {moreLists} lists', {
                moreLists: cohorts.length - 3,
              })
            : ''}
        </p>
      </>
    );
  }
};

const Address: React.FC<{ address?: fhir.Address }> = ({ address }) => {
  const { t } = useTranslation();
  const { customAddressLabel } = useConfig() as ConfigObject;

  const getAddressKey = (url) => url.split('#')[1];
  /*
    DO NOT REMOVE THIS COMMENT UNLESS YOU UNDERSTAND WHY IT IS HERE

    t('postalCode', 'Postal code')
    t('address1', 'Address line 1')
    t('address2', 'Address line 2')
    t('countyDistrict', 'District')
    t('stateProvince', 'State')
    t('cityVillage', 'City')
    t('country', 'Country')
    t('countyDistrict', 'District')
    t('state', 'State')
    t('city', 'City')
    t('district', 'District')
  */

  return (
    <>
      <p className={styles.heading}>{t('address', 'Address')}</p>
      <ul>
        {address ? (
          <>
            {Object.entries(address)
              .filter(([key]) => !['use', 'id'].some((k) => k === key))
              .map(([key, value]) =>
                key === 'extension' ? (
                  address?.extension[0]?.extension.map((add, i) => (
                    <li key={`address-${key}-${i}`}>
                      {customAddressLabel ? t(customAddressLabel[getAddressKey(add.url)]) : t(getAddressKey(add.url))}:{' '}
                      {add.valueString}
                    </li>
                  ))
                ) : (
                  <li>
                    {customAddressLabel ? t(customAddressLabel[key]) : t(key)}: {value}
                  </li>
                ),
              )}
          </>
        ) : (
          '--'
        )}
      </ul>
    </>
  );
};

const Contact: React.FC<{ telecom: Array<fhir.ContactPoint>; patientUuid: string; deceased?: boolean }> = ({
  telecom,
  patientUuid,
}) => {
  const { t } = useTranslation();
  const value = telecom?.length ? telecom[0].value : '--';
  const { isLoading, contactAttributes } = usePatientContactAttributes(patientUuid);

  return (
    <>
      <p className={styles.heading}>{t('contactDetails', 'Contact Details')}</p>
      <ul>
        <li>{value}</li>
        {isLoading ? (
          <InlineLoading description={`${t('loading', 'Loading')} ...`} />
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
          if (isLoading) return <InlineLoading description="Loading..." role="progressbar" />;
          if (relationships?.length) {
            return (
              <ul>
                {relationships.map((r) => (
                  <li key={r.uuid} className={styles.relationship}>
                    <div>{r.display}</div>
                    <div>{r.relationshipType}</div>
                    <div>
                      {`${r.relativeAge ? r.relativeAge : '--'} ${
                        r.relativeAge ? (r.relativeAge === 1 ? 'yr' : 'yrs') : ''
                      }`}
                    </div>
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

const ContactDetails: React.FC<ContactDetailsProps> = ({
  address,
  telecom,
  patientId,
  deceased,
  isPatientBannerSmallSize,
}) => {
  const currentAddress = address ? address.find((a) => a.use === 'home') : undefined;

  return (
    <div
      className={`${styles.contactDetails} ${deceased && styles.deceased} ${
        isPatientBannerSmallSize && styles.smallBannerSize
      }`}
    >
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
          <PatientList patientUuid={patientId} />
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
