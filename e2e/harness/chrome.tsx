import React from 'react';

/**
 * A static replica of the patient chart's surroundings — top nav, left nav, patient banner and the
 * vitals strip. None of it is under test; it exists so the screenshots show the notification
 * components in the context a clinician actually sees them in, rather than floating on white.
 */

const navItems = [
  'Patient summary',
  'Vitals & Biometrics',
  'Medications',
  'Orders',
  'Results',
  'Visits',
  'Allergies',
  'Conditions',
  'Procedures',
  'Immunizations',
  'Attachments',
  'Programs',
  'Appointments',
  'Billing history',
];

const vitals = [
  { label: 'BP', value: '120/90', units: 'mmHg', flag: 'warn' },
  { label: 'Heart rate', value: '101', units: 'bpm', flag: 'warn' },
  { label: 'R. rate', value: '25', units: '/min', flag: 'danger' },
  { label: 'SpO₂', value: '95', units: '%' },
  { label: 'Temp', value: '37.7', units: '°C' },
  { label: 'Weight', value: '63', units: 'kg' },
  { label: 'Height', value: '163', units: 'cm' },
  { label: 'BMI', value: '23.7', units: 'kg/m²' },
];

interface ChromeProps {
  activeNavItem: string;
  bell?: React.ReactNode;
  children?: React.ReactNode;
}

const Chrome: React.FC<ChromeProps> = ({ activeNavItem, bell, children }) => (
  <div className="harnessRoot">
    {/* The Carbon header class names matter: HeaderGlobalAction (which the bell renders) takes its
        sizing and inverse colours from `.cds--header__global`, exactly as in the real top nav. */}
    <header className="harnessTopNav cds--header">
      <span className="harnessBrand">OpenMRS</span>
      <span className="harnessDivider" />
      <span className="harnessLocation">Outpatient Clinic</span>
      <div className="harnessTopNavActions cds--header__global">
        <span className="harnessTopNavIcon" />
        <span className="harnessTopNavIcon" />
        <span className="harnessTopNavIcon" />
        {bell}
        <span className="harnessTopNavIcon" />
        <span className="harnessTopNavIcon" />
      </div>
    </header>

    <div className="harnessColumns">
      <nav className="harnessLeftNav">
        {navItems.map((item) => (
          <span className={item === activeNavItem ? 'harnessNavItemActive' : 'harnessNavItem'} key={item}>
            {item}
          </span>
        ))}
      </nav>

      <main className="harnessMain">
        <div className="harnessBanner">
          <span className="harnessBannerAvatar">BB</span>
          <div>
            <p className="harnessBannerName">Betty Bliss</p>
            <p className="harnessBannerMeta">
              Female · 26 yrs · 08-Apr-2000 · <strong>OpenMRS ID: 100065E</strong>
            </p>
          </div>
          <span className="harnessBannerTag">Active Visit</span>
          <span className="harnessBannerMeta">Outpatient Triage</span>
        </div>

        <section className="harnessVitals">
          <h2 className="harnessVitalsTitle">Vitals and biometrics</h2>
          <div className="harnessVitalsRow">
            {vitals.map((vital) => (
              <div className={`harnessVital harnessVital--${vital.flag ?? 'normal'}`} key={vital.label}>
                <p className="harnessVitalLabel">{vital.label}</p>
                <p className="harnessVitalValue">
                  {vital.value} <span className="harnessVitalUnits">{vital.units}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="harnessContent">{children}</div>
      </main>
    </div>
  </div>
);

export default Chrome;
