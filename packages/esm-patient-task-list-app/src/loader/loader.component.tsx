import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { getCoreTranslation } from '@openmrs/esm-framework';
import styles from './loader.scss';

const Loader: React.FC = () => {
  const { t } = useTranslation();
  return <InlineLoading className={styles.loading} description={`${getCoreTranslation('loading')} ...`} />;
};

export default Loader;
