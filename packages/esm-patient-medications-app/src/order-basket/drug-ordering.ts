import dayjs from "dayjs";
import { OrderBasketItem } from "../types/order-basket-item";
import { postOrder } from "../api/api";
import { toOmrsIsoString } from "@openmrs/esm-framework";
import { OrderPost } from "../types/order";

const careSetting = "6f0c9a92-6f24-11e3-af88-005056821db0";
const orderer = "e89cae4a-3cb3-40a2-b964-8b20dda2c985";

export async function orderDrugs(
  orderBasketItems: Array<OrderBasketItem>,
  patientUuid: string,
  abortController: AbortController
) {
  const dtos = medicationOrderToApiDto(orderBasketItems, patientUuid);
  const erroredItems: Array<OrderBasketItem> = [];

  for (let i = 0; i < dtos.length; i++) {
    const dto = dtos[i];
    const orderBasketItem = orderBasketItems[i];
    await postOrder(dto, abortController).catch((error) => {
      erroredItems.push({
        ...orderBasketItem,
        orderError: error,
      });
    });
  }

  return erroredItems;
}

function medicationOrderToApiDto(
  orderBasketItems: Array<OrderBasketItem>,
  patientUuid: string
): Array<OrderPost> {
  return orderBasketItems.map((order) => {
    if (order.action === "NEW" || order.action === "RENEWED") {
      return {
        action: "NEW",
        patient: patientUuid,
        type: "drugorder",
        careSetting: careSetting,
        orderer: orderer,
        encounter: order.encounterUuid,
        drug: order.drug.uuid,
        dose: order.dosage.numberOfPills,
        doseUnits: order.dosageUnit.uuid,
        route: order.route.conceptUuid,
        frequency: order.frequency.conceptUuid,
        asNeeded: order.asNeeded,
        asNeededCondition: order.asNeededCondition,
        numRefills: order.numRefills,
        quantity: order.pillsDispensed,
        quantityUnits: "162396AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        duration: order.duration,
        durationUnits: order.durationUnit.uuid,
        dosingType: order.isFreeTextDosage
          ? "org.openmrs.FreeTextDosingInstructions"
          : "org.openmrs.SimpleDosingInstructions",
        dosingInstructions: order.isFreeTextDosage
          ? order.freeTextDosage
          : order.patientInstructions,
        concept: order.drug.concept.uuid,
        orderReasonNonCoded: order.indication,
        dateActivated: toOmrsIsoString(order.startDate),
      };
    } else if (order.action === "REVISE") {
      return {
        action: "REVISE",
        patient: patientUuid,
        type: "drugorder",
        previousOrder: order.previousOrder,
        careSetting: careSetting,
        orderer: orderer,
        encounter: order.encounterUuid,
        drug: order.drug.uuid,
        dose: order.dosage.numberOfPills,
        doseUnits: order.dosageUnit.uuid,
        route: order.route.conceptUuid,
        frequency: order.frequency.conceptUuid,
        asNeeded: order.asNeeded,
        asNeededCondition: order.asNeededCondition,
        numRefills: order.numRefills,
        quantity: order.pillsDispensed,
        quantityUnits: "162396AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        duration: order.duration,
        durationUnits: order.durationUnit.uuid,
        dosingType: order.isFreeTextDosage
          ? "org.openmrs.FreeTextDosingInstructions"
          : "org.openmrs.SimpleDosingInstructions",
        dosingInstructions: order.isFreeTextDosage
          ? order.freeTextDosage
          : order.patientInstructions,
        concept: order.drug.concept.uuid,
        orderReasonNonCoded: order.indication,
        dateActivated: toOmrsIsoString(order.startDate),
      };
    } else if (order.action === "DISCONTINUE") {
      return {
        action: "DISCONTINUE",
        type: "drugorder",
        previousOrder: order.previousOrder,
        patient: patientUuid,
        careSetting: careSetting,
        encounter: order.encounterUuid,
        orderer: orderer,
        concept: order.drug.concept.uuid,
        drug: order.drug.uuid,
        orderReasonNonCoded: null,
      };
    } else {
      throw new Error(
        `Unknown order type ${order.action}. This is a development error.`
      );
    }
  });
}

function calculateEndDate(orderBasketItem: OrderBasketItem) {
  const dayJsDuration = orderBasketItem.durationUnit.display
    .substring(0, orderBasketItem.durationUnit.display.lastIndexOf("s"))
    .toLowerCase();

  return (
    dayjs(orderBasketItem.startDate)
      // @ts-ignore
      .add(orderBasketItem.duration, dayJsDuration)
      .toDate()
  );
}
