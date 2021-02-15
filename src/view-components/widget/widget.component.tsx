import React, { FunctionComponent } from "react";
import { reportError, ExtensionSlot } from "@openmrs/esm-framework";
import { useUrlData } from "../../useUrlData";

export interface WidgetProps {
  widgetConfig: WidgetConfig;
}

export interface WidgetConfig {
  name: string;
  esModule?: string;
  extensionSlotName?: string;
  usesSingleSpaContext?: boolean;
  layout?: {
    rowSpan?: number;
    columnSpan?: number;
  };
  props?: object;
  config?: object;
  basePath?: string;
}

interface ComponentProps {
  props: any;
  basePath?: string;
}

export default function Widget(props: WidgetProps) {
  const [component, setComponent] = React.useState<JSX.Element>(null);
  const { patientUuid } = useUrlData();

  React.useEffect(() => {
    //This function is moved inside of the effect to avoid change on every render
    const loadWidgetFromConfig = (widgetConfig: WidgetConfig) => {
      let Component: FunctionComponent<ComponentProps>;

      if (widgetConfig.esModule) {
        System.import(widgetConfig.esModule)
          .then(module => {
            if (module[widgetConfig.name]) {
              Component = module[widgetConfig.name];
              const widgetProps = { ...props.widgetConfig.props };

              if (props.widgetConfig.config) {
                widgetProps["config"] = props.widgetConfig.config;
              }

              setComponent(() => (
                <Component
                  props={widgetProps}
                  basePath={widgetConfig.basePath}
                />
              ));
            } else {
              const message = `${widgetConfig.name} does not exist in module ${widgetConfig.esModule}`;
              reportError(message);
              setComponent(() => <div>${message}</div>);
            }
          })
          .catch(error => {
            const message = `${widgetConfig.esModule} failed to load`;
            reportError(`${message}:\n` + error);
            setComponent(() => <div>${message}</div>);
          });
      } else if (widgetConfig.extensionSlotName) {
        setComponent(() => (
          <ExtensionSlot
            extensionSlotName={widgetConfig.extensionSlotName}
            state={{ ...widgetConfig, patientUuid }}
          />
        ));
      } else {
        // config schema should be fixed so that this is caught in validation
        reportError(
          `No esModule provided in the config for widget: ${widgetConfig.name}`
        );
        setComponent(() => <div>No module provided</div>);
      }
    };
    loadWidgetFromConfig(props.widgetConfig);
  }, [patientUuid, props.widgetConfig]);

  return <>{component || <div>Loading</div>}</>;
}
