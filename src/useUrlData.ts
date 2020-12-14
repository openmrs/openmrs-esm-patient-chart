import { useRouteMatch } from "react-router-dom";

interface RouteParams {
  patientUuid: string;
}

export function useUrlData() {
  const match = useRouteMatch<RouteParams>();
  return {
    basePath: match.url,
    patientUuid: match.params.patientUuid
  };
}
