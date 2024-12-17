import { TrashCanIcon, useLayoutType, WarningIcon } from '@openmrs/esm-framework';
import { type OrderBasketItem } from '@openmrs/esm-patient-common-lib';
import React, { type ComponentProps, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './order-basket-item-tile.scss';
import { Button, Tile, ClickableTile } from '@carbon/react';
import classNames from 'classnames';

export interface OrderBasketItemTileProps {
  orderBasketItem: OrderBasketItem;
  onItemClick: () => void;
  onRemoveClick: () => void;
}

const OrderBasketItemTile: React.FC<OrderBasketItemTileProps> = ({ orderBasketItem, onItemClick, onRemoveClick }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  // This here is really dirty, but required.
  // If the ref's value is false, we won't react to the ClickableTile's handleClick function.
  // Why is this necessary?
  // The "Remove" button is nested inside the ClickableTile. If the button's clicked, the tile also raises the
  // handleClick event later. Not sure if this is a bug, but this shouldn't be possible in our flows.
  // Hence, we manually prevent the handleClick callback from being invoked as soon as the button is pressed once.
  const shouldOnClickBeCalled = useRef(true);

  const labTile = (
    <div className={styles.orderBasketItemTile}>
      <div className={styles.clipTextWithEllipsis}>
        <OrderActionLabel orderBasketItem={orderBasketItem} />
        <br />
        <span className={styles.name}>{orderBasketItem.concept?.display}</span>
        <span className={styles.label01}>
          {!!orderBasketItem.orderError && (
            <>
              <br />
              <span className={styles.orderErrorText}>
                <WarningIcon size={16} />
                &nbsp;
                <span className={styles.label01}>{t('error', 'Error').toUpperCase()}</span> &nbsp;
                {orderBasketItem.orderError.responseBody?.error?.message ?? orderBasketItem.orderError.message}
              </span>
            </>
          )}
        </span>
      </div>
      <Button
        className={styles.removeButton}
        kind="ghost"
        hasIconOnly={true}
        renderIcon={(props: ComponentProps<typeof TrashCanIcon>) => <TrashCanIcon size={16} {...props} />}
        iconDescription={t('removeFromBasket', 'Remove from basket')}
        onClick={() => {
          shouldOnClickBeCalled.current = false;
          onRemoveClick();
        }}
        tooltipPosition="left"
      />
    </div>
  );
  return orderBasketItem.action === 'DISCONTINUE' ? (
    <Tile>{labTile}</Tile>
  ) : (
    <ClickableTile
      role="listitem"
      className={classNames({
        [styles.clickableTileTablet]: isTablet,
        [styles.clickableTileDesktop]: !isTablet,
      })}
      onClick={() => shouldOnClickBeCalled.current && onItemClick()}
    >
      {labTile}
    </ClickableTile>
  );
};

function OrderActionLabel({ orderBasketItem }: { orderBasketItem: OrderBasketItem }) {
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

export default OrderBasketItemTile;
