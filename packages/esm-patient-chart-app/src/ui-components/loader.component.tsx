import React from 'react';
import InlineLoading from 'carbon-components-react/es/components/InlineLoading';
import { useTranslation } from 'react-i18next';
import styles from './loader.component.scss';

const Loader: React.FC = () => {
  const { t } = useTranslation();
  return <InlineLoading className={styles.loading} description={`${t('loading', 'Loading')} ...`} />;
};

export default Loader;
