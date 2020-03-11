import React, { FunctionComponent, useContext } from "react";
import { AppPropsContext } from "../../app-props-context";
import singleSpa, { SingleSpaContext } from "single-spa-react";

export default function Widget(props) {
  const [widget, setWidget] = React.useState(null);
  const app = useContext(AppPropsContext);

  React.useEffect(() => {
    loadWidgetFromConfig(props.widgetConfig);
  }, [props.widgetConfig, loadWidgetFromConfig]);

  function loadWidgetFromConfig(widgetConfig: WidgetConfig) {
    let Component: FunctionComponent<ComponentProps>;
    let widget: WidgetConfig = widgetConfig;
    if (widgetConfig.esModule) {
      System.import(widgetConfig.esModule)
        .then(module => {
          if (module[widgetConfig.name]) {
            Component = module[widgetConfig.name];
            if (widgetConfig.createParcel) {
              <SingleSpaContext.Consumer>
                {context => {
                  //create and mount the parcel
                }}
              </SingleSpaContext.Consumer>;
            }
            widget.component = () => (
              <Component {...props.widgetConfig.params} {...app.appProps} />
            );
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
        <div>No module provided in the config for widget: {widget.name}></div>
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
  widgetConfig: WidgetConfig;
};

type GridSize = {
  gridRow: string;
  gridColumn: string;
};

export type WidgetConfig = {
  name: string;
  esModule?: string;
  createParcel?: boolean;
  layout?: {
    rowSpan?: number;
    columnSpan?: number;
  };
  component?: Function;
};

type ComponentProps = {
  props: any;
};
