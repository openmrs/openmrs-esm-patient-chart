import React from "react";
import { reportError, ExtensionSlot } from "@openmrs/esm-framework";
import { useUrlData } from "../../useUrlData";

export interface WidgetProps {
  widgetConfig: WidgetConfig;
  patientUuid: string;
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

const withPatientUuid = <T extends Record<string, any>>(
  WrappedComponent: React.FC<T>
): React.FC<Omit<T, "patientUuid">> => {
  const PureWrappedComponent = React.memo(WrappedComponent);
  PureWrappedComponent.displayName = WrappedComponent.displayName;
  return (props: T) => {
    const { patientUuid } = useUrlData();
    return <PureWrappedComponent {...props} patientUuid={patientUuid} />;
  };
};

function Widget({ widgetConfig, patientUuid }: WidgetProps) {
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

export default withPatientUuid(Widget);
