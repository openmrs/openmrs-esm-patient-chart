import React from "react";
import { useTranslation } from "react-i18next";
import { openVisitDashboard } from "../visit/visit-button.component";

interface AddPastVisitOverflowMenuItemProps {}

const AddPastVisitOverflowMenuItem: React.FC<AddPastVisitOverflowMenuItemProps> = () => {
  const { t } = useTranslation();
  const handleClick = React.useCallback(
    () => openVisitDashboard(`${t("visitDashboard", "Visit Dashboard")}`),
    []
  );

  return (
    <li className="bx--overflow-menu-options__option">
      <button
        className="bx--overflow-menu-options__btn"
        role="menuitem"
        title={t("Add Past Visit", "Add Past Visit")}
        data-floating-menu-primary-focus
        onClick={handleClick}
        style={{
          maxWidth: "100vw",
        }}
      >
        <span className="bx--overflow-menu-options__option-content">
          {t("Add Past Visit", "Add Past Visit")}
        </span>
      </button>
    </li>
  );
};

export default AddPastVisitOverflowMenuItem;
