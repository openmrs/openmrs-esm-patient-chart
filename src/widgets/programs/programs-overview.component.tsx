import React from "react";
import dayjs from "dayjs";
import SummaryCard from "../cards/summary-card.component";
import SummaryCardRow from "../cards/summary-card-row.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import { match } from "react-router";
import { fetchPatientPrograms } from "./programs.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import HorizontalLabelValue from "../cards/horizontal-label-value.component";
import { useCurrentPatient } from "@openmrs/esm-api";
import SummaryCardFooter from "../cards/summary-card-footer.component";
import { Trans, useTranslation } from "react-i18next";

export default function Programs(props: ProgramsOverviewProps) {
  const [patientPrograms, setPatientPrograms] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (patientUuid) {
      const subscription = fetchPatientPrograms(patientUuid).subscribe(
        programs => setPatientPrograms(programs),
        createErrorHandler()
      );

      return () => subscription.unsubscribe();
    }
  }, [patientUuid]);

  return (
    <SummaryCard
      name={t("care programs", "Care Programs")}
      match={props.match}
      link={`/patient/${patientUuid}/chart/programs`}
      styles={{ margin: "1.25rem, 1.5rem" }}
    >
      <SummaryCardRow>
        <SummaryCardRowContent>
          <HorizontalLabelValue
            label={t("Active Programs", "Active Programs")}
            labelStyles={{
              color: "var(--omrs-color-ink-medium-contrast)",
              fontFamily: "Work Sans"
            }}
            value={t("Since", "Since")}
            valueStyles={{
              color: "var(--omrs-color-ink-medium-contrast)",
              fontFamily: "Work Sans"
            }}
          />
        </SummaryCardRowContent>
      </SummaryCardRow>
      {patientPrograms &&
        patientPrograms.map(program => {
          return (
            <SummaryCardRow key={program.uuid} linkTo="">
              <HorizontalLabelValue
                label={program.display}
                labelStyles={{ fontWeight: 500 }}
                value={dayjs(program.dateEnrolled).format("MMM-YYYY")}
                valueStyles={{ fontFamily: "Work Sans" }}
              />
            </SummaryCardRow>
          );
        })}
      <SummaryCardFooter linkTo={`/patient/${patientUuid}/chart/programs`} />
    </SummaryCard>
  );
}

type ProgramsOverviewProps = {
  match: match;
};
