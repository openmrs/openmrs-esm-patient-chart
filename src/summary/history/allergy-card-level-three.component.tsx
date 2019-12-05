import React from "react";
import { match } from "react-router";
import SummaryCard from "../cards/summary-card.component";
import style from "./allergy-card-level-three.css";

export function AllergyCardLevelThreeAdd(props: AllergyCardLevelThreeAddProps) {
  return (
    <SummaryCard
      name="Add Allergy"
      link=""
      match={props.match}
      styles={{
        width: "100%",
        background: "var(--omrs-color-bg-medium-contrast)"
      }}
    >
      <div>
        <h4 className={style.allergyHeader}>Category of reaction</h4>
        <div className={`${style.container}`}>
          <div className="omrs-radio-button">
            <label>
              <input type="radio" name="category" defaultChecked />
              <span>Drug</span>
            </label>
          </div>
          <div className="omrs-radio-button">
            <label>
              <input type="radio" name="category" />
              <span>Food</span>
            </label>
          </div>
          <div className="omrs-radio-button">
            <label>
              <input type="radio" name="category" />
              <span>Enviromental</span>
            </label>
          </div>
          <div className="omrs-radio-button">
            <label>
              <input type="radio" name="category" />
              <span>Patient has no allergies</span>
            </label>
          </div>
        </div>
      </div>
    </SummaryCard>
  );
}

type AllergyCardLevelThreeAddProps = {
  match: match;
};
