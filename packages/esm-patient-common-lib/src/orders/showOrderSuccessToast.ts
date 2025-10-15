import { showSnackbar } from '@openmrs/esm-framework';
import { type TFunction } from 'i18next';
import { type OrderBasketItem } from './types';

export function showOrderSuccessToast(t: TFunction, patientOrderItems: OrderBasketItem[]) {
  const orderedString = patientOrderItems
    .filter((item) => ['NEW', 'RENEW'].includes(item.action))
    .map((item) => item.display)
    .join(', ');
  const updatedString = patientOrderItems
    .filter((item) => item.action === 'REVISE')
    .map((item) => item.display)
    .join(', ');
  const discontinuedString = patientOrderItems
    .filter((item) => item.action === 'DISCONTINUE')
    .map((item) => item.display)
    .join(', ');

  showSnackbar({
    isLowContrast: true,
    kind: 'success',
    title: t('orderCompleted', 'Placed orders'),
    subtitle:
      (orderedString && `${t('ordered', 'Placed order for')} ${orderedString}. `) +
      (updatedString && `${t('updated', 'Updated')} ${updatedString}. `) +
      (discontinuedString && `${t('discontinued', 'Discontinued')} ${discontinuedString}.`),
  });
}
