import React from "react";
import { useTranslation } from "react-i18next";
import { switchTo, useVisit } from "@openmrs/esm-framework";

interface StopVisitOverflowMenuItemProps {
  patientUuid: string;
}

const StopVisitOverflowMenuItem: React.FC<StopVisitOverflowMenuItemProps> = ({
  patientUuid,
}) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const handleClick = React.useCallback(
    () =>
      switchTo("dialog", "/end-visit/prompt", { visitData: currentVisit }),
    [currentVisit]
  );

  return (
    currentVisit && (
      <li className="bx--overflow-menu-options__option">
        <button
          className="bx--overflow-menu-options__btn"
          role="menuitem"
          title={t("End Visit", "End Visit")}
          data-floating-menu-primary-focus
          onClick={handleClick}
          style={{
            maxWidth: "100vw",
          }}
        >
          <span className="bx--overflow-menu-options__option-content">
            {t("End Visit", "End Visit")}
          </span>
        </button>
      </li>
    )
  );
};

export default StopVisitOverflowMenuItem;
