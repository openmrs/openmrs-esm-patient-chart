import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import styles from './loader.scss';

const Loader: React.FC = () => {
  const { t } = useTranslation();
  return <InlineLoading className={styles.loading} description={`${t('loading', 'Loading')} ...`} />;
};

export default Loader;
