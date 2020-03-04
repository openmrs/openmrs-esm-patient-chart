import React, { FunctionComponent } from "react";
import { coreWidgets } from "../core-views";

export default function Widget(props) {
  const [widget, setWidget] = React.useState();

  React.useEffect(() => {
    loadWidgetFromConfig(props.widgetConfig);
  }, [props.widgetConfig]);

  function loadWidgetFromConfig(widgetConfig: WidgetConfigType) {
    let Component: FunctionComponent;
    let widget = widgetConfig;
    if (widgetConfig.esModule) {
      System.import(widgetConfig.esModule).then(module => {
        Component = module[widgetConfig.name];
        widget.component = () => <Component />;
        setWidget(widget);
      });
    } else {
      widget.component = coreWidgets[widget.name].component;

      setWidget(widget);
    }
  }

  return <>{widget !== undefined && widget.component()}</>;
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
