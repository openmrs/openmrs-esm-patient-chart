import React from "react";
import { useTranslation } from "react-i18next";
import { useVisit } from "@openmrs/esm-framework";

interface StartVisitOverflowMenuItemProps {
  patientUuid: string;
}

const StartVisitOverflowMenuItem: React.FC<StartVisitOverflowMenuItemProps> = ({
  patientUuid,
}) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const handleClick = React.useCallback(
    () =>
      window.dispatchEvent(
        new CustomEvent("visit-dialog", {
          detail: {
            type: "prompt",
          },
        })
      ),
    []
  );

  return (
    !currentVisit && (
      <li className="bx--overflow-menu-options__option">
        <button
          className="bx--overflow-menu-options__btn"
          role="menuitem"
          title={t("startVisit", "Start visit")}
          data-floating-menu-primary-focus
          onClick={handleClick}
          style={{
            maxWidth: "100vw",
          }}
        >
          <span className="bx--overflow-menu-options__option-content">
            {t("startVisit", "Start visit")}
          </span>
        </button>
      </li>
    )
  );
};

export default StartVisitOverflowMenuItem;
