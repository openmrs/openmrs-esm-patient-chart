import React from 'react';
import styles from './loader.scss';
import { InlineLoading } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';

const Loader: React.FC = () => {
  const { t } = useTranslation();
  return <InlineLoading className={styles.loading} description={`${t('loading', 'Loading')} ...`} />;
};

export default Loader;
