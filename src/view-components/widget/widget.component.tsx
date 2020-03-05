import React, { FunctionComponent } from "react";
import { coreWidgets } from "../core-views";

export default function Widget(props) {
  const [widget, setWidget] = React.useState<WidgetConfigType | null>(null);

  React.useEffect(() => {
    loadWidgetFromConfig(props.widgetConfig);
  }, [props.widgetConfig]);

  function loadWidgetFromConfig(widgetConfig: WidgetConfigType) {
    let Component: FunctionComponent;
    let widget: WidgetConfigType = widgetConfig;
    if (widgetConfig.esModule) {
      System.import(widgetConfig.esModule)
        .then(module => {
          if (module[widgetConfig.name]) {
            Component = module[widgetConfig.name];
            widget.component = () => <Component />;
          } else {
            widget.component = () => (
              <div>
                {widgetConfig.name} does not exist in module{" "}
                {widgetConfig.esModule}
              </div>
            );
          }
        })
        .catch(error => {
          widget.component = () => <div>{widget.esModule} failed to load</div>;
        })
        .finally(() => {
          setWidget(widget);
        });
    } else {
      widget.component = () => (
        <div>No module provided in config from which to load widget</div>
      );
      setWidget(widget);
    }
  }

  return (
    <>
      {widget != undefined &&
        widget.component != undefined &&
        widget.component()}
    </>
  );
}

export type WidgetProps = {
  widgetConfig: WidgetConfigType;
};

type GridSizeType = {
  gridRow: string;
  gridColumn: string;
};

export type WidgetConfigType = {
  name: string;
  path?: string;
  esModule?: string;
  layout?: {
    rowSpan?: number;
    columnSpan?: number;
  };
  component?: Function;
};
