import React from "react";
import Search from "carbon-components-react/es/components/Search";
import Checkbox from "carbon-components-react/es/components/Checkbox";
import Button from "carbon-components-react/es/components/Button";
import styles from "./clinical-view-form.component.scss";
import debounce from "lodash-es/debounce";
import { useTranslation } from "react-i18next";
import { useExtensionStore } from "@openmrs/esm-framework";
import { isEmpty } from "lodash";
import { useClinicalView } from "../store";

interface ClinicalViewFormProps {}
interface View {
  slotName: string;
  slot: string;
}

const ClinicalViewForm: React.FC<ClinicalViewFormProps> = ({}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [views, setViews] = React.useState<Array<View>>(useClinicalView());
  const [searchResults, setSearchResult] = React.useState<Array<View>>([]);

  React.useEffect(() => {
    !isEmpty(views) && setSearchResult(views);
  }, [views]);

  React.useEffect(() => {
    const results = views.filter(
      (view) =>
        view.slotName
          .toLocaleLowerCase()
          .search(searchTerm.toLocaleLowerCase()) !== -1
    );
    setSearchResult(results);
  }, [searchTerm]);

  const handleSearch = debounce((searchTerm) => {
    setSearchTerm(searchTerm);
  }, 300);

  console.log(views);

  return (
    <div className={styles.formContainer}>
      <Search
        placeholder={t("searchForView", "Search for a view")}
        id="search"
        onChange={(event) => handleSearch(event.target.value)}
        labelText=""
      />
      <div className={styles.checkboxContainer}>
        {searchResults.map((view) => (
          <Checkbox
            key={view.slot}
            id={view.slot}
            labelText={view.slotName}
            className={styles.checkBox}
          />
        ))}
      </div>
      <div className={styles.buttonContainer}>
        <Button kind="secondary">{t("cancel", "Cancel")}</Button>
        <Button kind="primary">{t("saveAndClose", "Save & Close")}</Button>
      </div>
    </div>
  );
};

export default ClinicalViewForm;
