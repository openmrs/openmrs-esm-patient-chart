import React from "react";
import { match } from "react-router";
import SummaryCard from "../cards/summary-card.component";
import SummaryCardRow from "../cards/summary-card-row.component";
import { getAllForms, Form } from "./form-list.resource";
export default function FormList(props: FormListProps) {
  // TODO LIST:
  // 1. Make filtering configurable e.g AMRS uses name filters for q=POC
  // 2. Make redirect link when a certain form is clicked configurable
  // 3. Add ability to filter by retired/published/encounter type
  // 4. Add "exclude" and "include" properties, to specify which forms to include or exclude
  // 5. Ability to order forms by a) favourites b) defined form orders

  const [forms, setForms] = React.useState(new Array<Form>());

  React.useEffect(() => {
    getAllForms().subscribe(forms => {
      setForms(forms);
    });
  }, []);

  return (
    <SummaryCard
      name="Form List"
      match={props.match}
      styles={{ margin: "1.25rem, 1.5rem", width: "100%", maxWidth: "45rem" }}
      hideHeaderRightButton={true}
    >
      {forms &&
        forms.map(form => {
          return (
            <SummaryCardRow key={form.uuid} linkTo={`chart/forms/${form.uuid}`}>
              {form.name}
            </SummaryCardRow>
          );
        })}
    </SummaryCard>
  );
}

type FormListProps = {
  match: match;
};
