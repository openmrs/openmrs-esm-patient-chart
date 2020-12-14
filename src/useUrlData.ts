import { useRouteMatch } from "react-router-dom";
import { basePath } from "./constants";

interface RouteParams {
  patientUuid: string;
}

export function useUrlData() {
  const match = useRouteMatch<RouteParams>(basePath);

  return {
    basePath: match.url,
    patientUuid: match.params.patientUuid
  };
}
