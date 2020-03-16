import React, { FunctionComponent, useContext } from "react";
//@ts-ignore The present types for single-spa-react are not updated yet for 2.9 which has SingleSpaContext
import s, { SingleSpaContext } from "single-spa-react";

export default function Widget(props) {
  const [widget, setWidget] = React.useState(null);

  const { mountParcel } = useContext(SingleSpaContext);

  React.useEffect(() => {
    //This function is moved inside of the effect to avoid change on every render
    const loadWidgetFromConfig = (widgetConfig: WidgetConfig) => {
      let Component: FunctionComponent<ComponentProps>;
      let widget: WidgetConfig = widgetConfig;
      if (widgetConfig.esModule) {
        System.import(widgetConfig.esModule)
          .then(module => {
            if (module[widgetConfig.name]) {
              Component = module[widgetConfig.name];
              if (widgetConfig.usesSingleSpaContext) {
                widget.component = () => (
                  <Component
                    {...props.widgetConfig.params}
                    singleSpaContext={{ mountParcel: mountParcel }}
                  />
                );
              } else {
                widget.component = () => (
                  <Component {...props.widgetConfig.params} />
                );
              }
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
            widget.component = () => (
              <div>{widget.esModule} failed to load</div>
            );
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
    };
    loadWidgetFromConfig(props.widgetConfig);
  }, [props.widgetConfig]);

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
  usesSingleSpaContext?: boolean;
  layout?: {
    rowSpan?: number;
    columnSpan?: number;
  };
  component?: Function;
};

type ComponentProps = {
  props: any;
};
