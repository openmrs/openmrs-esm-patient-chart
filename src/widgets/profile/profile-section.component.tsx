import React from "react";
import { match } from "react-router";
import styles from "./profile-section.component.css";
import DemographicsCard from "./demographics-card.component";
import IdentifiersCard from "./identifiers-card.component";
import ContactsCard from "./contacts-card.component";
import RelationshipsCard from "./relationships-card.component";

export default function ProfileSection(props: ProfileSectionProps) {
  const demographicCardStyles = {
    flexGrow: 1
  };
  return (
    <div className={styles.profile}>
      <div>
        <div className={styles.demographicCard}>
          <DemographicsCard
            patient={props.patient}
            cardStyles={demographicCardStyles}
          />
        </div>
        <div className={styles.otherProfileCards}>
          <IdentifiersCard patient={props.patient} />
          <div className={styles.contactsAndRelationshipsCard}>
            <ContactsCard patient={props.patient} />
            <RelationshipsCard patient={props.patient} />
          </div>
        </div>
      </div>
    </div>
  );
}

type ProfileSectionProps = {
  match: match;
  patient: fhir.Patient;
};
