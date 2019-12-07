# openmrs-esm-patient-chart

[![Build Status](https://travis-ci.org/openmrs/openmrs-esm-patient-chart.svg?branch=master)](https://travis-ci.org/openmrs/openmrs-esm-patient-chart)


## Overview
This module allows developers to quickly and easily put together a 'chart' or 'flowsheet' style user interface for a patient, as opposed to an encounter-form-based UI.

The flowsheet can have a bunch of tabs (representing physical pages) each having a different table. For example, there can be a history, physical condition, allergy, reactions and summary table.

## Documentation

### Instructions
- This module depends on the HTML Form Entry Module
- To use this module properly you need to create your own module that depends on this one, and put your own custom configuration in your `moduleApplicationContext.xml` in a controller bean that extends the PatientChartController provided by this module.
- For each "page" (or tab) you want in your "chart", you need to create an HTML form. Preferably a short one.
- Instantiate a controller bean, like below
- Map the bean in your module's urlMapping

Here is an example of how to configure a chart with 2 tabs. The first is labeled "Vitals", shows encounter type 1 and uses form 18 for entry. The second is labeled "Labs", shows encounter type 2 and uses form 19 for entry.
```
<bean id="testPatientChartController">
 <property name="configuration">
     <bean>
         <property name="tabs">
             <list>
                 <bean>
                     <property name="title"><value>Vitals</value></property>
                     <property name="tabType"><value>encounterChart</value></property>
                     <property name="encounterTypeId"><value>1</value></property>
                     <property name="formId"><value>18</value></property>
                 </bean>
                 <bean>
                     <property name="title"><value>Labs</value></property>
                     <property name="tabType"><value>encounterChart</value></property>
                     <property name="encounterTypeId"><value>2</value></property>
                     <property name="formId"><value>19</value></property>
                 </bean>
             </list>
         </property>
     </bean>
 </property>
</bean>
```

## Wiki Documentation
- [OpenMRS Wiki - Patient Chart](https://wiki.openmrs.org/display/docs/Patient+Chart+Widgets+Module)
- [OpenMRS Wiki - Patients](https://wiki.openmrs.org/display/docs/Patients)
- [OpenMRS Wiki - Patient History](https://wiki.openmrs.org/display/docs/Patient+History)

## License
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
