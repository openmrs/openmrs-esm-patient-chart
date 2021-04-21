import { useEffect, useState } from "react";
import { createErrorHandler } from "@openmrs/esm-framework";
import { fetchPatientOrders } from "../api/api";
import { Order } from "../types/order";

/**
 * Fetches the orders belonging of a patient and optional provides a way to trigger a re-fetch of
 * that data on demand.
 * @param patientUuid The UUID of the patient whose orders should be fetched.
 * @param status The status/the kind of orders to be fetched.
 */
export function usePatientOrders(
  patientUuid: string,
  status: "ACTIVE" | "any"
): [
  Array<Order> | null,
  (abortController?: AbortController) => Promise<unknown>
] {
  const [orders, setOrders] = useState<Array<Order>>(null);
  const fetchOrders = (abortController?: AbortController) => {
    return fetchPatientOrders(patientUuid, status, abortController).then(
      (orders) => {
        setOrders(orders);
      },
      createErrorHandler
    );
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchOrders(abortController);
    return () => abortController.abort();
  }, [patientUuid]);

  return [orders, fetchOrders];
}
