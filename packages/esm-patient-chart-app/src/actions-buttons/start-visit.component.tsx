import React from "react";
import { useTranslation } from "react-i18next";
import { switchTo, useVisit } from "@openmrs/esm-framework";

export default function StartVisitOverflowMenuItem({ patientUuid }) {
  const { t } = useTranslation();
  const { currentVisit, error } = useVisit(patientUuid);
  const handleClick = () => {
    switchTo("dialog", "/start-visit/prompt", {});
  };
  return (
    !currentVisit && (
      <button
        className="bx--overflow-menu-options__btn"
        role="menuitem"
        title={t("Add Past Visit", "Add Past Visit")}
        data-floating-menu-primary-focus
        onClick={handleClick}
        style={{
          maxWidth: "100vw"
        }}
      >
        <span className="bx--overflow-menu-options__option-content">
          {t("Start Visit", "Start Visit")}
        </span>
      </button>
    )
  );
}
