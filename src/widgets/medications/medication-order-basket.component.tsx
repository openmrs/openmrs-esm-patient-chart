import React, { useState, useEffect } from "react";
import { match } from "react-router";
import styles from "./medication-order-basket.css";
import SummaryCard from "../cards/summary-card.component";
import { isEmpty, debounce } from "lodash";
import { getDrugByName, saveNewDrugOrder } from "./medications.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { MedicationOrder } from "./medication-order.component";
import { useCurrentPatient } from "@openmrs/esm-api";
import SummaryCardRow from "../cards/summary-card-row.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import { getDosage, OrderMedication } from "./medication-orders-utils";
import { useHistory } from "react-router-dom";

export function MedicationOrderBasket(props: MedicationOrderBasketProps) {
  const searchTimeOut = 300;
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBasket, setOrderBasket] = useState([]);
  const [drugName, setDrugName] = useState();
  const [showOrderMedication, setShowOrderMedication] = useState(false);
  const [enableButtons, setEnableButtons] = useState(false);
  const [editProperty, setEditProperty] = useState([]);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();
  let history = useHistory();
  const [editOrderItem, setEditOrderItem] = React.useState<{
    orderEdit: Boolean;
    order?: OrderMedication;
  }>({ orderEdit: false, order: null });
  const handleDrugSelected = $event => {
    setDrugName(searchTerm);
    setShowOrderMedication(true);
    setSearchResults([]);
  };

  const handleChange = debounce(searchterm => {
    setSearchTerm(searchterm);
  }, searchTimeOut);

  useEffect(() => {
    const abortController = new AbortController();
    if (searchTerm && searchTerm.length >= 3) {
      getDrugByName(searchTerm, abortController).then(
        response => setSearchResults(response.data.results),
        createErrorHandler
      );
    } else {
      setSearchResults([]);
    }
    return () => abortController.abort();
  }, [searchTerm]);

  useEffect(() => {
    if (orderBasket.length > 0) {
      setEnableButtons(true);
    } else {
      setEnableButtons(false);
    }
  }, [orderBasket]);

  useEffect(() => {
    let params: any = props.match.params;
    if (params.drugName) {
      setShowOrderMedication(true);
      setEditProperty([
        {
          DrugName: params.drugName,
          Action: params.action,
          OrderUuid: params.orderUuid
        }
      ]);
      setDrugName(params.drugName);
    }
  }, [props.match.params]);

  const handleSaveOrders = () => {
    const abortController = new AbortController();
    orderBasket.forEach(order => {
      saveNewDrugOrder(abortController, order).then(response => {
        if (response.status === 201) {
          setOrderBasket([]);
          navigate();
        }
      }, createErrorHandler());
    });
    return () => abortController.abort();
  };

  const hideModal = () => {
    setShowOrderMedication(false);
    setEditProperty([]);
    setEditOrderItem({ orderEdit: false, order: null });
  };

  const resetParams = () => {
    props.match.params = {};
  };

  function navigate() {
    history.push(`/patient/${patientUuid}/chart/medications`);
  }

  const handleRemoveOrderItem = (indexNum: any) => {
    setOrderBasket(
      orderBasket.filter((order: OrderMedication, index) => index !== indexNum)
    );
  };

  const handleOrderItemEdit = (orderItem: OrderMedication, indexNum: any) => {
    setEditOrderItem({ orderEdit: true, order: orderItem });
    setShowOrderMedication(true);
    setEditProperty([]);
    setOrderBasket(
      orderBasket.filter((order: OrderMedication, index) => index !== indexNum)
    );
  };

  return (
    <div className={styles.medicationOrderBasketContainer}>
      <div
        className={`${styles.medicationHeader} ${
          !isEmpty(searchResults) ? styles.modal : ""
        }`}
      >
        <div
          className={`${styles.medicationHeader} ${
            !isEmpty(searchResults) ? styles.modalContent : ""
          }`}
        >
          <SummaryCard
            name="Order Medication"
            match={props.match}
            styles={{ width: "100%" }}
          >
            <div className={styles.medicationSearchTerm}>
              <input
                type="text"
                name="searchTerm"
                id="searchTerm"
                placeholder="medication name"
                onChange={$event => handleChange($event.target.value)}
              />
            </div>
          </SummaryCard>
          <div
            className={`${styles.searchResults} ${
              isEmpty(searchResults) ? styles.hide : ""
            }`}
          >
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Drug Name</th>
                  <th>Strength</th>
                  <th>Dosage form</th>
                </tr>
              </thead>
              <tbody>
                {searchResults &&
                  searchResults.map((result, index) => {
                    return (
                      <tr
                        key={result}
                        role="button"
                        onClick={$event => handleDrugSelected(result.uuid)}
                      >
                        <td>{index + 1}</td>
                        <td>{result.name}</td>
                        <td>{result.strength}</td>
                        <td>{result.dosageForm.display}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ width: "70%" }}>
        {orderBasket.length > 0 &&
          orderBasket.map((order, index) => {
            return (
              <div
                className={`${styles.basketStyles} ${
                  order.action === "NEW" ? styles.newOrder : styles.reviseOrder
                }`}
                key={index}
              >
                <SummaryCardRow>
                  <SummaryCardRowContent justifyContent="space-between">
                    <span>
                      <b>{order.drugName}</b>
                      {" \u2014 "}{" "}
                      {String(order.dosageForm).toLocaleLowerCase()}
                      {" \u2014 "} {String(order.routeName).toLocaleLowerCase()}
                      {" \u2014 "}{" "}
                      {`DOSE ${getDosage(order.drugStrength, order.dose)}`}{" "}
                      <b>{String(order.frequencyName).toLocaleLowerCase()}</b>
                    </span>
                    <span>
                      <button
                        className="omrs-btn-icon-medium"
                        onClick={$event => handleRemoveOrderItem(index)}
                      >
                        <svg>
                          <use
                            fill={"var(--omrs-color-ink-white)"}
                            xlinkHref="#omrs-icon-close"
                          ></use>
                        </svg>
                      </button>
                      <button
                        className="omrs-btn-icon-medium"
                        onClick={$event => handleOrderItemEdit(order, index)}
                      >
                        <svg>
                          <use
                            fill={"var(--omrs-color-ink-white)"}
                            xlinkHref="#omrs-icon-menu"
                          ></use>
                        </svg>
                      </button>
                    </span>
                  </SummaryCardRowContent>
                </SummaryCardRow>
              </div>
            );
          })}
      </div>

      {showOrderMedication && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <MedicationOrder
              match={props.match}
              drugName={drugName}
              setOrderBasket={setOrderBasket}
              orderBasket={orderBasket}
              hideModal={hideModal}
              editProperty={editProperty}
              resetParams={resetParams}
              orderEdit={editOrderItem}
            />
          </div>
        </div>
      )}

      <div className={styles.medicationOrderFooter}>
        <button
          className="omrs-btn omrs-outlined-neutral"
          style={{ width: "50%" }}
          onClick={$event => setOrderBasket([])}
        >
          Cancel
        </button>
        <button
          className={`${
            enableButtons
              ? "omrs-btn omrs-filled-action"
              : "omrs-btn omrs-outlined-neutral"
          }`}
          style={{ width: "50%" }}
          disabled={!enableButtons}
          onClick={handleSaveOrders}
        >
          Sign
        </button>
      </div>
    </div>
  );
}

type MedicationOrderBasketProps = {
  match: match;
};
