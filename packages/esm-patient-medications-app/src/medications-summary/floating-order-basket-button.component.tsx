import React from "react";
import Button from "carbon-components-react/es/components/Button";
import Tag from "carbon-components-react/es/components/Tag";
import styles from "./floating-order-basket-button.scss";
import ShoppingBag16 from "@carbon/icons-react/es/shopping--bag/16";
import { useTranslation } from "react-i18next";
import { connect } from "unistore/react";
import { switchTo } from "@openmrs/esm-framework";
import {
  OrderBasketStoreActions,
  OrderBasketStore
} from "../medications/order-basket-store";

export interface FloatingOrderBasketButtonProps {
  patientUuid: string;
}

const FloatingOrderBasketButton = connect<
  FloatingOrderBasketButtonProps,
  OrderBasketStoreActions,
  OrderBasketStore,
  {}
>("items")(
  ({
    patientUuid,
    items
  }: FloatingOrderBasketButtonProps & OrderBasketStore) => {
    const { t } = useTranslation();

    return (
      <Button
        kind="secondary"
        className={styles.floatingOrderBasketButton}
        style={
          // The OMRS dev tool buttons hide this button. Non-issue in prod, but makes dev harder.
          // Moving it up during development solves this.
          process.env.NODE_ENV === "production" ? {} : { bottom: "4rem" }
        }
        onClick={() => {
          const url = `/patient/${patientUuid}/drugorder/basket`;
          switchTo("workspace", url, {
            title: t("orderBasket", "Order Basket")
          });
        }}
      >
        <div className={styles.elementContainer}>
          <span>{t("orderBasket", "Order Basket")}</span>
          <ShoppingBag16 />
          {items.length > 0 && (
            <Tag className={styles.countTag}>{items.length}</Tag>
          )}
        </div>
      </Button>
    );
  }
);

export default FloatingOrderBasketButton;
