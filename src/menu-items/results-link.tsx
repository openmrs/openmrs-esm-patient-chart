import { ConfigurableLink } from "@openmrs/esm-react-utils";
import React from "react";
import { useTranslation } from "react-i18next";

export default function({ basePath }) {
  const { t } = useTranslation();

  return (
    <ConfigurableLink to={`${basePath}/results`} className="bx--side-nav__link">
      {t("Results", "Results")}
    </ConfigurableLink>
  );
}
