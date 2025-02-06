import React, { useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { ClickableTile, IconButton, Tile } from '@carbon/react';
import { ExtensionSlot, TrashCanIcon, useLayoutType, WarningIcon } from '@openmrs/esm-framework';
import { type DrugOrderBasketItem } from '../types';
import styles from './order-basket-item-tile.scss';

export interface OrderBasketItemTileProps {
  orderBasketItem: DrugOrderBasketItem;
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

  const additionalInfoSlotState = useMemo(
    () => ({
      orderItemUuid: orderBasketItem.drug.uuid,
    }),
    [orderBasketItem],
  );

  const tileContent = (
    <div>
      <div className={styles.orderBasketItemTile}>
        <div className={styles.clipTextWithEllipsis}>
          <OrderActionLabel orderBasketItem={orderBasketItem} />
          {orderBasketItem.isFreeTextDosage ? (
            <div>
              <span className={styles.drugName}>{orderBasketItem.drug?.display}</span>
              {orderBasketItem.freeTextDosage && (
                <span className={styles.dosageInfo}> &mdash; {orderBasketItem.freeTextDosage}</span>
              )}
            </div>
          ) : (
            <div>
              <span className={styles.drugName}>{orderBasketItem.drug?.display}</span>
              <span className={styles.dosageInfo}>
                {' '}
                {orderBasketItem.drug?.strength && <>&mdash; {orderBasketItem.drug?.strength}</>}{' '}
                {orderBasketItem.drug?.dosageForm?.display && <>&mdash; {orderBasketItem.drug.dosageForm?.display}</>}
              </span>
            </div>
          )}
          <span className={styles.label01}>
            <span className={styles.doseCaption}>{t('dose', 'Dose').toUpperCase()}</span>{' '}
            <span className={styles.dosageLabel}>
              {orderBasketItem.dosage} {orderBasketItem.unit?.value}
            </span>{' '}
            <span className={styles.dosageInfo}>
              &mdash; {orderBasketItem.route?.value ? <>{orderBasketItem.route.value} &mdash; </> : null}
              {orderBasketItem.frequency?.value ? <>{orderBasketItem.frequency.value} &mdash; </> : null}
              {t('refills', 'Refills').toUpperCase()} {orderBasketItem.numRefills}{' '}
              {t('quantity', 'Quantity').toUpperCase()}{' '}
              {`${orderBasketItem.pillsDispensed} ${orderBasketItem.quantityUnits?.value?.toLowerCase() ?? ''}`}
              {orderBasketItem.patientInstructions && <>&mdash; {orderBasketItem.patientInstructions}</>}
            </span>
          </span>
          <br />
          <span className={styles.label01}>
            <span className={styles.indicationLabel}>{t('indication', 'Indication').toUpperCase()}</span>{' '}
            <span className={styles.dosageInfo}>
              {!!orderBasketItem.indication ? (
                orderBasketItem.indication
              ) : (
                <i>{t('noIndicationProvided', 'No indication provided')}</i>
              )}
            </span>
            {!!orderBasketItem.orderError && (
              <>
                <br />
                <span className={styles.orderErrorText}>
                  <WarningIcon size={16} /> &nbsp;{' '}
                  <span className={styles.label01}>{t('error', 'Error').toUpperCase()}</span> &nbsp;
                  {orderBasketItem.orderError.responseBody?.error?.message ?? orderBasketItem.orderError.message}
                </span>
              </>
            )}
          </span>
        </div>
        <IconButton
          kind="ghost"
          align="left"
          size={isTablet ? 'lg' : 'sm'}
          label={t('removeFromBasket', 'Remove from basket')}
          onClick={() => {
            shouldOnClickBeCalled.current = false;
            onRemoveClick();
          }}
        >
          <TrashCanIcon size={16} className={styles.removeButton} />
        </IconButton>
      </div>
      <ExtensionSlot
        name="order-item-additional-info-slot"
        state={additionalInfoSlotState}
        className={styles.additionalInfoContainer}
      />
    </div>
  );

  return orderBasketItem.action === 'DISCONTINUE' ? (
    <Tile>{tileContent}</Tile>
  ) : (
    <ClickableTile
      role="listitem"
      className={classNames({
        [styles.clickableTileTablet]: isTablet,
        [styles.clickableTileDesktop]: !isTablet,
      })}
      onClick={() => shouldOnClickBeCalled.current && onItemClick()}
    >
      {tileContent}
    </ClickableTile>
  );
}

function OrderActionLabel({ orderBasketItem }: { orderBasketItem: DrugOrderBasketItem }) {
  const { t } = useTranslation();

  if (orderBasketItem.isOrderIncomplete) {
    return (
      <span
        className={styles.orderActionIncompleteLabel}
        role="status"
        aria-atomic
        aria-label={t('orderActionIncomplete', 'Incomplete')}
      >
        {t('orderActionIncomplete', 'Incomplete')}
      </span>
    );
  }

  switch (orderBasketItem.action) {
    case 'NEW':
      return (
        <span className={styles.orderActionNewLabel} role="status" aria-atomic aria-label={t('orderActionNew', 'New')}>
          {t('orderActionNew', 'New')}
        </span>
      );
    case 'RENEW':
      return (
        <span
          className={styles.orderActionRenewLabel}
          role="status"
          aria-atomic
          aria-label={t('orderActionRenew', 'Renew')}
        >
          {t('orderActionRenew', 'Renew')}
        </span>
      );
    case 'REVISE':
      return (
        <span
          className={styles.orderActionReviseLabel}
          role="status"
          aria-atomic
          aria-label={t('orderActionRevise', 'Modify')}
        >
          {t('orderActionRevise', 'Modify')}
        </span>
      );
    case 'DISCONTINUE':
      return (
        <span
          className={styles.orderActionDiscontinueLabel}
          role="status"
          aria-atomic
          aria-label={t('orderActionDiscontinue', 'Discontinue')}
        >
          {t('orderActionDiscontinue', 'Discontinue')}
        </span>
      );
    default:
      return <></>;
  }
}
