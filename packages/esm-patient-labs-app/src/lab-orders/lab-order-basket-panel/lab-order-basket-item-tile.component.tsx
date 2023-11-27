import React, { useRef } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ClickableTile } from '@carbon/react';
import { TrashCan, Warning } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import { type LabOrderBasketItem } from '../api';
import styles from './lab-order-basket-item-tile.scss';

export interface OrderBasketItemTileProps {
  orderBasketItem: LabOrderBasketItem;
  onItemClick: () => void;
  onRemoveClick: () => void;
}

export function LabOrderBasketItemTile({ orderBasketItem, onItemClick, onRemoveClick }: OrderBasketItemTileProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  // This here is really dirty, but required.
  // If the ref's value is false, we won't react to the ClickableTile's handleClick function.
  // Why is this necessary?
  // The "Remove" button is nested inside the ClickableTile. If the button's clicked, the tile also raises the
  // handleClick event later. Not sure if this is a bug, but this shouldn't be possible in our flows.
  // Hence, we manually prevent the handleClick callback from being invoked as soon as the button is pressed once.
  const shouldOnClickBeCalled = useRef(true);

  return (
    <ClickableTile
      role="listitem"
      className={classNames({
        [styles.clickableTileTablet]: isTablet,
        [styles.clickableTileDesktop]: !isTablet,
      })}
      onClick={() => shouldOnClickBeCalled.current && onItemClick()}
    >
      <div className={styles.orderBasketItemTile}>
        <div className={styles.clipTextWithEllipsis}>
          <span className={styles.orderActionNewLabel}>{t('orderActionNew', 'New')}</span>
          <br />
          <>
            <span className={styles.name}>{orderBasketItem.testType?.label}</span>
          </>
          <span className={styles.label01}>
            {!!orderBasketItem.orderError && (
              <>
                <br />
                <span className={styles.orderErrorText}>
                  <Warning size={16} /> &nbsp;{' '}
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
          renderIcon={(props) => <TrashCan size={16} {...props} />}
          iconDescription={t('removeFromBasket', 'Remove from basket')}
          onClick={() => {
            shouldOnClickBeCalled.current = false;
            onRemoveClick();
          }}
          tooltipPosition="left"
        />
      </div>
    </ClickableTile>
  );
}
