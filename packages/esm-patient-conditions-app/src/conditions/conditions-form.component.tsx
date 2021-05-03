import React, { SyntheticEvent } from "react";
import dayjs from "dayjs";
import debounce from "lodash-es/debounce";
import { useTranslation } from "react-i18next";
import {
  createErrorHandler,
  detach,
  showToast,
  useSessionUser,
} from "@openmrs/esm-framework";
import Button from "carbon-components-react/es/components/Button";
import DatePicker from "carbon-components-react/es/components/DatePicker";
import DatePickerInput from "carbon-components-react/es/components/DatePickerInput";
import Form from "carbon-components-react/es/components/Form";
import FormGroup from "carbon-components-react/es/components/FormGroup";
import RadioButton from "carbon-components-react/es/components/RadioButton";
import RadioButtonGroup from "carbon-components-react/es/components/RadioButtonGroup";
import Search from "carbon-components-react/es/components/Search";
import SearchSkeleton from "carbon-components-react/es/components/Search/Search.Skeleton";
import { Tile } from "carbon-components-react/es/components/Tile";
import {
  searchConditionConcepts,
  createPatientCondition,
  CodedCondition,
} from "./conditions.resource";
import styles from "./conditions-form.scss";

interface ConditionsFormProps {
  patientUuid: string;
}
const ConditionsForm: React.FC<ConditionsFormProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const searchTimeoutInMs = 300;
  const session = useSessionUser();
  const [onsetDate, setOnsetDate] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<
    Array<CodedCondition>
  >(null);
  const [condition, setCondition] = React.useState<any>(null);
  const [clinicalStatus, setClinicalStatus] = React.useState("active");
  const [endDate, setEndDate] = React.useState(null);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const closeWorkspace = React.useCallback(
    () => detach("patient-chart-workspace-slot", "conditions-form-workspace"),
    []
  );

  const handleConditionChange = (selectedCondition: CodedCondition) => {
    resetSearch();
    setCondition(selectedCondition);
  };

  const resetSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    event.preventDefault();

    const payload = {
      clinicalStatus: clinicalStatus,
      code: condition?.concept,
      onsetDateTime: onsetDate ? dayjs(onsetDate).format() : null,
      subject: {
        reference: `Patient/${patientUuid}`,
      },
      recorder: {
        reference: `Practitioner/${session?.user?.uuid}`,
      },
      recordedDate: new Date().toISOString(),
      resourceType: "Condition",
    };

    const sub = createPatientCondition(payload).subscribe(
      (response) => {
        if (response.status === 201) {
          closeWorkspace();
          showToast({
            description: t("conditionSaved", "Condition saved successfully"),
          });
        }
      },
      (err) => {
        console.error(err);
        createErrorHandler();
      },
      () => setIsSubmitting(false)
    );
    return () => sub.unsubscribe();
  };

  const debouncedSearch = React.useMemo(
    () =>
      debounce((searchTerm) => {
        if (searchTerm) {
          const sub = searchConditionConcepts(searchTerm).subscribe(
            (results: Array<CodedCondition>) => setSearchResults(results),
            createErrorHandler(),
            () => setIsSearching(false)
          );
          return () => sub.unsubscribe();
        } else {
          setSearchResults(null);
        }
      }, searchTimeoutInMs),
    []
  );

  React.useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  return (
    <Form style={{ margin: "2rem" }} onSubmit={handleSubmit}>
      <FormGroup
        style={{ width: "50%" }}
        legendText={t("condition", "Condition")}
      >
        <Search
          id="conditionsSearch"
          labelText={t("enterCondition", "Enter condition")}
          placeholder={t("searchConditions", "Search conditions")}
          onChange={(event) => {
            setIsSearching(true);
            setCondition(null);
            setSearchTerm(event.target.value);
          }}
          value={condition?.display || searchTerm}
          light
        />
        <div>
          {searchTerm ? (
            searchResults && searchResults.length ? (
              <ul className={styles.conditionsList}>
                {searchResults.map((condition, index) => (
                  <li
                    role="menuitem"
                    className={styles.condition}
                    key={index}
                    onClick={() => handleConditionChange(condition)}
                  >
                    {condition.display}
                  </li>
                ))}
              </ul>
            ) : isSearching ? (
              <SearchSkeleton />
            ) : (
              <Tile light className={styles.emptyResults}>
                <span>
                  {t("noResultsFor", "No results for")}{" "}
                  <strong>"{searchTerm}"</strong>
                </span>
              </Tile>
            )
          ) : null}
        </div>
      </FormGroup>
      <FormGroup legendText={t("onsetDate", "Onset date")}>
        <DatePicker
          id="onsetDate"
          datePickerType="single"
          dateFormat="d/m/Y"
          maxDate={new Date().toISOString()}
          name="onsetDate"
          placeholder="dd/mm/yyyy"
          onChange={([date]) => setOnsetDate(date)}
          value={onsetDate}
          light
        >
          <DatePickerInput id="onsetDateInput" labelText="" />
        </DatePicker>
      </FormGroup>
      <FormGroup legendText={t("currentStatus", "Current status")}>
        <RadioButtonGroup
          defaultSelected="active"
          name="clinicalStatus"
          valueSelected="active"
          orientation="vertical"
          onChange={(status) => setClinicalStatus(status.toString())}
        >
          <RadioButton id="active" labelText="Active" value="active" />
          <RadioButton id="inactive" labelText="Inactive" value="inactive" />
        </RadioButtonGroup>
      </FormGroup>
      {clinicalStatus === "inactive" ? (
        <DatePicker
          id="endDate"
          datePickerType="single"
          dateFormat="d/m/Y"
          minDate={new Date(onsetDate).toISOString()}
          maxDate={dayjs().utc().format()}
          name="endDate"
          placeholder="dd/mm/yyyy"
          onChange={([date]) => setEndDate(date)}
          value={endDate}
          light
        >
          <DatePickerInput
            id="endDateInput"
            labelText={t("endDate", "End date")}
          />
        </DatePicker>
      ) : null}
      <div style={{ marginTop: "1.625rem" }}>
        <Button
          style={{ width: "50%" }}
          kind="secondary"
          type="button"
          onClick={closeWorkspace}
        >
          {t("cancel", "Cancel")}
        </Button>
        <Button
          style={{ width: "50%" }}
          kind="primary"
          type="submit"
          disabled={isSubmitting}
        >
          {t("saveAndClose", "Save & Close")}
        </Button>
      </div>
    </Form>
  );
};

export default ConditionsForm;
