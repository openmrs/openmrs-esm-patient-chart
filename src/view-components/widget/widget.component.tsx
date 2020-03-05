import React, { FunctionComponent, useContext } from "react";
import { coreWidgets } from "../core-views";
import { AppPropsContext } from "../../app-props-context";

export default function Widget(props) {
  const [widget, setWidget] = React.useState();
  const app = useContext(AppPropsContext);

  React.useEffect(() => {
    loadWidgetFromConfig(props.widgetConfig);
  }, [props.widgetConfig]);

  function loadWidgetFromConfig(widgetConfig: WidgetConfigType) {
    let Component: FunctionComponent<ComponentProps>;
    let widget = widgetConfig;
    if (widgetConfig.esModule) {
      System.import(widgetConfig.esModule).then(module => {
        Component = module[widgetConfig.name];
        widget.component = () => <Component props={app.appProps} />;
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

type ComponentProps = {
  props: any;
};
