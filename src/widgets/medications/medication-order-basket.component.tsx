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
import { getDosage } from "./medication-orders-utils";

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
    if (params.drugUuid) {
      setShowOrderMedication(true);
      setEditProperty([
        {
          DrugName: params.drugUuid,
          Action: params.action,
          OrderUuid: params.orderUuid
        }
      ]);
      setDrugName(params.drugUuid);
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
  };

  const resetParams = () => {
    props.match.params = {};
  };

  function navigate() {
    window.location.href = `https://openmrs-spa.org/openmrs/spa/patient/${patientUuid}/chart/medications`;
  }

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
            styles={{ width: "100%", maxHeight: "2.5rem" }}
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

      <div
        style={{
          height: "fit-content",
          width: "100%",
          margin: "1.25rem",
          padding: "1.25rem"
        }}
      >
        {orderBasket &&
          orderBasket.map(order => {
            return (
              <SummaryCardRow>
                <SummaryCardRowContent>
                  <span>
                    <b>{order.drugName}</b>
                    {" \u2014 "} {String(order.dosageForm).toLocaleLowerCase()}
                    {" \u2014 "} {String(order.routeName).toLocaleLowerCase()}
                    {" \u2014 "}{" "}
                    {`DOSE ${getDosage(order.drugStrength, order.dose)}`}{" "}
                    <b>{String(order.frequencyName).toLocaleLowerCase()}</b>
                  </span>
                </SummaryCardRowContent>
              </SummaryCardRow>
            );
          })}
      </div>

      {showOrderMedication && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <MedicationOrder
              match={props.match}
              drugUuid={drugName}
              setOrderBasket={setOrderBasket}
              orderBasket={orderBasket}
              hideModal={hideModal}
              editProperty={editProperty}
              resetParams={resetParams}
            />
          </div>
        </div>
      )}

      <div className={styles.medicationOrderFooter}>
        <button
          className="omrs-btn omrs-outlined-neutral"
          style={{ width: "50%" }}
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
