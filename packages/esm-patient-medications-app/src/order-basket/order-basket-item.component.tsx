import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ClickableTile, Tile, IconButton } from '@carbon/react';
import { TrashCan, Warning, Add } from '@carbon/react/icons';
import { OrderBasketItem } from '../types/order-basket-item';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './order-basket-item.scss';

export interface OrderBasketItemTileProps {
  orderBasketItem: OrderBasketItem;
  onItemClick: () => void;
  onRemoveClick: () => void;
}

export default function OrderBasketItemTile({ orderBasketItem, onItemClick, onRemoveClick }: OrderBasketItemTileProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  // This here is really dirty, but required.
  // If the ref's value is false, we won't react to the ClickableTile's handleClick function.
  // Why is this necessary?
  // The "Remove" button is nested inside the ClickableTile. If the button's clicked, the tile also raises the
  // handleClick event later. Not sure if this is a bug, but this shouldn't be possible in our flows.
  // Hence, we manually prevent the handleClick callback from being invoked as soon as the button is pressed once.
  const shouldOnClickBeCalled = useRef(true);

  const tileContent = (
    <div className={styles.orderBasketItemTile}>
      <p className={styles.clipTextWithEllipsis}>
        <OrderActionLabel orderBasketItem={orderBasketItem} />
        <br />
        {orderBasketItem.isFreeTextDosage ? (
          <>
            <span className={styles.drugName}>{orderBasketItem.drug?.display}</span>
            <span className={styles.dosageInfo}> &mdash; {orderBasketItem.freeTextDosage}</span>
          </>
        ) : (
          <>
            <span className={styles.drugName}>{orderBasketItem.drug?.display}</span>
            <span className={styles.dosageInfo}>
              {' '}
              &mdash; {orderBasketItem.drug?.strength}{' '}
              {orderBasketItem.drug?.dosageForm?.display && <>&mdash; {orderBasketItem.drug.dosageForm?.display}</>}
            </span>
          </>
        )}
        <br />
        <span className={styles.label01}>
          <span className={styles.doseCaption}>{t('dose', 'Dose').toUpperCase()}</span>{' '}
          <span className={styles.dosageLabel}>
            {orderBasketItem.dosage} {orderBasketItem.unit?.value}
          </span>{' '}
          <span className={styles.dosageInfo}>
            &mdash; {orderBasketItem.route?.value} &mdash; {orderBasketItem.frequency?.value} &mdash;{' '}
            {t('refills', 'Refills').toUpperCase()} {orderBasketItem.numRefills}{' '}
            {t('quantity', 'Quantity').toUpperCase()} {orderBasketItem.pillsDispensed}{' '}
          </span>
        </span>
        <br />
        <span className={styles.label01}>
          <span className={styles.indicationLabel}>{t('indication', 'Indication').toUpperCase()}</span>{' '}
          <span className={styles.dosageInfo}>
            {!!orderBasketItem.indication ? orderBasketItem.indication : <i>{t('none', 'None')}</i>}
          </span>
          {!!orderBasketItem.orderError && (
            <>
              <br />
              <span className={styles.orderErrorText}>
                <Warning size={16} /> &nbsp; <span className={styles.label01}>{t('error', 'Error').toUpperCase()}</span>{' '}
                &nbsp;
                {orderBasketItem.orderError.responseBody?.error?.message ?? orderBasketItem.orderError.message}
              </span>
            </>
          )}
        </span>
      </p>
      <Button
        className={styles.removeButton}
        kind="ghost"
        hasIconOnly={true}
        renderIcon={(props) => <TrashCan size={16} {...props} />}
        iconDescription={t('removeFromBasket', 'Remove from basket')}
        onClick={() => {
          shouldOnClickBeCalled.current = false;
          onRemoveClick();
        }}
      />
    </div>
  );

  return orderBasketItem.action === 'DISCONTINUE' ? (
    <Tile>{tileContent}</Tile>
  ) : (
    <ClickableTile
      role="listitem"
      className={isTablet ? styles.clickableTileTablet : styles.clickableTileDesktop}
      onClick={() => shouldOnClickBeCalled.current && onItemClick()}
    >
      {tileContent}
    </ClickableTile>
  );
}

function OrderActionLabel({ orderBasketItem }: { orderBasketItem: OrderBasketItem }) {
  const { t } = useTranslation();

  switch (orderBasketItem.action) {
    case 'NEW':
      return <span className={styles.orderActionNewLabel}>{t('orderActionNew', 'New')}</span>;
    case 'RENEWED':
      return <span className={styles.orderActionRenewLabel}>{t('orderActionRenewed', 'Renew')}</span>;
    case 'REVISE':
      return <span className={styles.orderActionRevisedLabel}>{t('orderActionRevised', 'Modify')}</span>;
    case 'DISCONTINUE':
      return <span className={styles.orderActionDiscontinueLabel}>{t('orderActionDiscontinue', 'Discontinue')}</span>;
    default:
      return <></>;
  }
}
