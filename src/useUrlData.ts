import { useRouteMatch } from "react-router-dom";
import { basePath } from "./constants";

interface RouteParams {
  patientUuid: string;
}

export function useUrlData() {
  const match = useRouteMatch<RouteParams>(basePath);

  if (!match) {
    return {
      basePath: "/",
      patientUuid: undefined
    };
  }

  return {
    basePath: match.url,
    patientUuid: match.params.patientUuid
  };
}
