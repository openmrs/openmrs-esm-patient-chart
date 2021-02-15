import React from "react";
import { reportError, ExtensionSlot } from "@openmrs/esm-framework";
import { useUrlData } from "../../useUrlData";

export interface WidgetProps {
  widgetConfig: WidgetConfig;
}

export interface WidgetConfig {
  name: string;
  extensionSlotName?: string;
  layout?: {
    rowSpan?: number;
    columnSpan?: number;
  };
  props?: object;
  config?: object;
  basePath?: string;
}

export default function Widget({ widgetConfig }: WidgetProps) {
  const { patientUuid } = useUrlData();
  const { name, extensionSlotName, props = {}, ...rest } = widgetConfig;

  if (!extensionSlotName) {
    reportError(`No extension slot provided in the config for widget: ${name}`);
    return null;
  }

  return (
    <ExtensionSlot
      extensionSlotName={extensionSlotName}
      state={{ ...props, ...rest, patientUuid }}
    />
  );
}
