[33mcommit 9b222a4d4bb20a540fc3481286b67a2e6cc72777[m[33m ([m[1;36mHEAD -> [m[1;32mmain[m[33m)[m
Author: Usama Idriss Kakumba <usamakakumba@gmail.com>
Date:   Wed Feb 21 17:41:28 2024 +0300

    refactor: create preview url from image base64 on attachments

[33mcommit 8c1324a40f28bf6d0b3c62b8567fab761259fc83[m
Author: Usama Idriss Kakumba <usamakakumba@gmail.com>
Date:   Thu Feb 15 12:58:17 2024 +0300

    refactor: add respective error snackbars on order saving failed

[33mcommit f9d9db4ebca9fcbfc496d69aa02785ab809601e7[m[33m ([m[1;31mupstream/main[m[33m)[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Feb 21 12:46:49 2024 +0530

    (feat) O3-2760: Present workspaces should leverage the `promptBeforeClosing` function (#1613)
    
    * Updated the workspaces.ts to accomodate proper checks when closing workspaces
    
    * Allergies workspace registered correctly with register workspace
    
    * Fixed the closing workspace prompt
    
    * Added the promptBeforeClosing in the Appointments form
    
    * Added the isDirty check in allergies form
    
    * Removed extra translations
    
    * Added the isDirty check in conditions workspace
    
    * Added the isDirty check in start-visit workspace
    
    * Updated the workspaces implementation in the forms app
    
    * Updated the workspace title and implementation in the immunization app
    
    * Updated the workspace title and workspace implementation in the patient lists
    
    * Updated the workspace title and workspace implementation in the medications app
    
    * Updated the workspace title and workspace implementation in the note app
    
    * Updated the workspace title and workspace implementation in the orders app
    
    * Updated the workspace title and workspace implementation in the programs app
    
    * Updated the workspace title and workspace implementation in the vitals app
    
    * Added JSDoc in the workspaces.ts
    
    * Removed duplicate functions from workspaces.ts
    
    * Exported getWhetherWorkspaceCanBeClosed from common-lib
    
    * Updated workspaces.ts with JS Doc
    
    * Updated and fixed failing tests
    
    * Fixed TS errors
    
    * Updated keys and values of translations
    
    * Final changes
    
    * Updated translations
    
    * Updated tests with text
    
    * Switching between order workspaces should not prompt the users to close order basket
    
    * Updated translations
    
    * Updated `ignoreChanges` description
    
    Co-authored-by: Brandon Istenes <bistenes@gmail.com>
    
    * Review changes
    
    * Introduced new function 'discardChangesAndCloseWorkspace' to close workspaces and keeping the closeWorkspace default behaviour intact
    
    * Updated text
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>
    
    * Reverted the implementation of discardChangesAndCloseWorkspace
    
    * Prompt function should be removed if the workspace is closed
    
    * Fixed failing test
    
    * Fixed TS issues
    
    * Review changes
    
    * Removed appointments workspace
    
    * Updated translation
    
    ---------
    
    Co-authored-by: Brandon Istenes <bistenes@gmail.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 059c36f13f7ea1b2be9664dba86881cd717bbec1[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Feb 20 17:09:15 2024 -0500

    BREAKING: O3-2620 Connect Lab Orders to Orderable ConvSet (#1676)
    
    * O3-2620 Connect Lab Orders to Orderable ConvSet
    
    * Clean up
    
    * Fixup
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit eb32c3e85693f3f0d8ca8bf792b2a8b532860bdb[m
Author: Mark Goodrich <mgoodrich@pih.org>
Date:   Tue Feb 20 16:03:19 2024 -0500

    (feat) O3-2859: Change Patient Appointments to use shared appointments form (#1674)
    
    
    ---------
    
    Co-authored-by: CynthiaKamau <cynthiakamau54@gmail.com>

[33mcommit 5769fa0af4e0d9caa67d226b30f6728076c8601e[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Tue Feb 20 22:38:18 2024 +0300

    Bump ip from 1.1.8 to 1.1.9 (#1682)
    
    Bumps [ip](https://github.com/indutny/node-ip) from 1.1.8 to 1.1.9.
    - [Commits](https://github.com/indutny/node-ip/compare/v1.1.8...v1.1.9)
    
    ---
    updated-dependencies:
    - dependency-name: ip
      dependency-type: indirect
    ...
    
    Signed-off-by: dependabot[bot] <support@github.com>
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit d105a5ae0a27922ef17f6e204eebaf2b7cb2e965[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Tue Feb 20 22:06:50 2024 +0300

    (fix) O3-2877: Make the drug search debounce delay value configurable (#1680)
    
    Co-authored-by: jwnasambu <wamalwa1844.com>

[33mcommit 41b890ebc2e3a65eb247623d6e89b3600a013e92[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Tue Feb 20 13:40:50 2024 -0500

    (chore) Update tx-pull.yml

[33mcommit a0cecd6b8f7b87d3da2c42d316226d29ec0bebeb[m
Author: befantasy <31535803+befantasy@users.noreply.github.com>
Date:   Wed Feb 21 02:23:21 2024 +0800

    (chore) Update translations from Transifex (#1615)
    
    Co-authored-by: OpenMRS Bot <infrastructure@openmrs.org>
    Co-authored-by: Ian <52504170+ibacher@users.noreply.github.com>

[33mcommit a460e8e246ddafa23034231367aa46c5e6db734d[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Feb 20 16:34:17 2024 +0300

    (chore) Remove timing env from lint script in all packages (#1679)
    
    * (chore) Remove timing env from lint script in all packages
    
    * Update lint script in patient-lists package
    
    * Update patient-flags package

[33mcommit 56e5362d3f3e5c61a9e5f85bea578aa6d0a00c34[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Tue Feb 20 09:56:29 2024 +0300

    (feat) Add mode prop to React Form Engine component to handle different views (#1678)
    
    (feat) Add mode prop to OHRI for component to handle different views

[33mcommit d2ea508842a1976e67952e6587d66ea2e794216c[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Mon Feb 19 16:33:59 2024 +0000

    (chore) Added French translations for "Next" and "Previous" on form entry app (#1677)
    
    Added French translations for "Next" and "Previous" on form entry app

[33mcommit 4dabd3c2417c9d0d2b54ca7e3784bd71f305385a[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Mon Feb 19 17:06:25 2024 +0530

    (fix) Workspace buttons should not be anchored at the end of the screen (#1666)
    
    * Reverting the CSS changes in individual workspaces
    
    * Workspace window should have height extending to full screen
    
    * Fixed identation in the drug order form

[33mcommit b1d72207dc0f673be0a79daf148332dc27b65d19[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sun Feb 18 07:06:41 2024 +0300

    (chore) Remove duplicated SWR config (#1675)

[33mcommit 8be52b2cbd722b5b8c946e4eda5d8322ff88f0a8[m
Author: Makombe Kennedy <kennedymakombe@gmail.com>
Date:   Fri Feb 16 13:49:53 2024 +0300

    (feat) The lab order form should have a reason for ordering field (#1458)
    
    * (feat): Lab form should have "reason for ordering
    
    * Code review changes
    
    * More fixes
    
    * code review changes
    
    * Code review changes and conflix fixes
    
    * More review changes
    
    * Remove concept label from config

[33mcommit 83542a7ca91f7a9913d72273161a7832eab513e7[m
Author: elimm <elimm@users.noreply.github.com>
Date:   Thu Feb 15 22:34:40 2024 +0200

    (fix) O3-2870: Add Hebrew translation for prev & next form nav buttons (#1668)
    
    Co-authored-by: Andrey Y <andrey.yakubyshyn@med.me>

[33mcommit 431b4e7e21ce33a53fbef6209b73ecaec418fc35[m
Author: Jayasanka Weerasinghe <33048395+jayasanka-sack@users.noreply.github.com>
Date:   Fri Feb 16 00:17:09 2024 +0530

    (chore) Upgrade peer-dependancy versions of single-spa and single-spa-react (#1669)

[33mcommit 1d74c021f27d61185b2ffe74ace6d7099330a92e[m
Author: Jayasanka Weerasinghe <33048395+jayasanka-sack@users.noreply.github.com>
Date:   Wed Feb 14 23:43:48 2024 +0530

    (test) Enhance "Start Visit" E2E Test (#1663)
    
    * Delete the patient after the Start Visit E2E test
    
    * Update steps

[33mcommit 4a9a90edf7500ba2d1e0ccee7d218425114bcec3[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Feb 13 13:51:43 2024 -0500

    (chore) Remove outdated comment (#1660)

[33mcommit e52c2e74ff9a3924941acf91252dfd892a72e8bf[m
Author: SENTHIL ATHIBAN M <93466587+senthil-k8s@users.noreply.github.com>
Date:   Tue Feb 13 16:37:26 2024 +0530

    (fix) O3-2832 : Implemented validation check for Primary Diagnosis and Secondary Diagnosis in visit-note (#1647)
    
    * fix(visit-note) : Implemented validation check for diagnosis input
    
    * refactor(visit-note) : Refactor diagnosis selection logic in VisitNotesForm component

[33mcommit a659a8e355140a45b25f893cb4bfbe1f655941cd[m
Author: McCarthy <121826239+mccarthyaaron@users.noreply.github.com>
Date:   Tue Feb 13 14:07:02 2024 +0300

    (fix) O3-2807: Quantity Units should be required when a quantity to dispense is specified (#1636)
    
    * (fix) dispensing units in drug-order-form default to dosage units with user still able to change the dispensing units
    
    * changes in dosage unit only trigger changes in the dispensing unit when the quantity to dispense is greater than 0
    
    * the dispensing units default to the dosing units when the dispensing quantity is greater than 0
    
    * Quantity units should be same as dosing units by default
    
    * Fixed the Form Provider path
    
    * Removed Form Provider
    
    * Quantity unit is required field
    
    * Better error handling for quantity units
    
    * if the default value of the quantity units is not specified, then it defaults to the dose unit
    
    * if the quantity unit is not specified, manually setting the dose unit defaults the quantity unit to the selected dose unit
    
    * quantity unit is required only when the quantity to dispense is specified
    
    * Update packages/esm-patient-medications-app/src/add-drug-order/drug-order-form.component.tsx
    
    * Final changes
    
    * removed the methods variable
    
    * Replaced watch() with getValues() where necessary
    and wrapped handlers in a useCallback()
    
    * Quantity untis should be translated
    
    ---------
    
    Co-authored-by: Vineet Sharma <sharmava05@gmail.com>

[33mcommit 4563c5f9df72a30d21331b4e5e94ab644f34b87d[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Feb 13 16:03:38 2024 +0530

    (feat) O3-2779: Error messages in drug order form should be translated (#1652)
    
    * O3-2779: Error messages in drug order form should be translated
    
    * Updated translation
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>
    
    * Revert "Updated translation"
    
    This reverts commit d11523eb89d4b8672bbe8c34baa432cb7ef94a64.
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 9cfea2fdb547957245812e94f402dc346c26b7da[m
Author: Pradip Ram <101059602+Pradipram@users.noreply.github.com>
Date:   Tue Feb 13 10:46:04 2024 +0530

    fix: Allowing image upload from computer (#1654)

[33mcommit 9c9ece813af964fcf1b7df5a5310d66c88050469[m
Author: Makombe Kennedy <kennedymakombe@gmail.com>
Date:   Tue Feb 13 01:17:20 2024 +0300

    (fix) Fix medications not loading when quantity unit property is null (#1656)
    
    (fix):Fix error medication not loading when quantity unit is null

[33mcommit 7d4d00706bf58f08c8228fa0a9cc36ae5edd05ce[m
Author: Jabar Jeremy <24471994+jabahum@users.noreply.github.com>
Date:   Mon Feb 12 17:14:00 2024 +0300

    (chore) Bump react form engine version  (#1655)
    
    * bump version
    
    * Bump FE

[33mcommit b9046f1eb7b210010555204adc425e3ad9a4cd19[m
Author: Usama Idriss Kakumba <53287480+usamaidrsk@users.noreply.github.com>
Date:   Sat Feb 10 00:05:21 2024 +0300

    (feat) O3-2814: Add field validation to the lab order form (#1649)
    
    * refactor: add validations on laborderform
    
    * add controlled fields
    
    * refactor: and error messages
    
    * fix: fix tests
    
    * fix: add lab refrence to be required
    
    * add field validations
    
    * use enableCounter on additional instructions text area
    
    * remove invalid_type_error on urgency field schema
    
    * remove counterMode on instructions textarea
    
    * fix double border on combo box when field is invalid
    
    * Tweak form CSS and error notification placement
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 28c70a1088f13c150c7e4062d78835057f99a486[m
Author: Vijay Kv <vijaykv2228@gmail.com>
Date:   Fri Feb 9 23:32:23 2024 +0530

    (fix) O3-2735: Display units for patient age in header (#1638)

[33mcommit c28cf516f70d2ba2d608aef83a5fa52ad30a2a9d[m
Author: Jayasanka Weerasinghe <33048395+jayasanka-sack@users.noreply.github.com>
Date:   Fri Feb 9 13:50:22 2024 +0530

    (chore) Release v7.0.1 (#1651)

[33mcommit 7222e818a1c158497a27f66965c059167f9cc309[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Fri Feb 9 13:10:08 2024 +0530

    (fix) Saving the medication should not send the dateActivated in the payload (#1635)
    
    Saving the medication should not send the dateActivated in the payload

[33mcommit a92f13b13c7ed055870e50f4c1705df2b5ace6d9[m
Author: Usama Idriss Kakumba <53287480+usamaidrsk@users.noreply.github.com>
Date:   Fri Feb 9 10:19:47 2024 +0300

    (fix) O3-2826: Fix reading properties of null (reading 'deceasedDateTime') when navigating to the patient chart. (#1646)
    
    fix: fix reading from null

[33mcommit 10939bc95288b03fdca761934d627fe731673357[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Feb 9 08:15:59 2024 +0300

    (feat) Anchor workspace actions to the bottom of the screen in tablet mode (#1650)

[33mcommit e2f58d690496c67a90f435b89da4da445776391e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Feb 9 00:38:34 2024 +0300

    (docs) Update links to docs in README.md

[33mcommit eb31b814b5d6eb4326b6f7772a967eadfac00505[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Feb 9 00:35:16 2024 +0300

    (fix) Fix display of menu items in the side rail and bottom nav (#1648)

[33mcommit bf1337359314b868bf42935be6a4fb0545d0a180[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Feb 8 21:46:28 2024 +0300

    (fix) Anchor allergy form action buttons to page bottom (#1644)

[33mcommit 1c19f0c83b5a876a3c27a9b1e9794b72eabe808e[m
Author: Jayasanka Weerasinghe <33048395+jayasanka-sack@users.noreply.github.com>
Date:   Thu Feb 8 17:32:28 2024 +0530

    (chore) Release v7.0.0 (#1639)

[33mcommit 1686f45846310f7cdd7881f96a6747b7c632d4d8[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Feb 8 11:52:37 2024 +0300

    (feat) Add infinite loading to the visits summary page (#1643)

[33mcommit 9cf2032d3b0f9f0bca45a556d7481458420e7703[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Feb 7 23:58:24 2024 +0300

    (fix) Fix label rendering bug in Contact details component (#1641)

[33mcommit e89b914e3055def374087252329063a8052c64f5[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Wed Feb 7 17:42:30 2024 +0000

    (feat) Bump rxjs to version 7 (#1642)

[33mcommit daf1f03d87b0f0331c66fc2d79d408df5ea4989e[m[33m ([m[1;32mfix-reading-from-null-on-patient-cahrt[m[33m)[m
Author: Magembe Sharif <48015736+sherrif10@users.noreply.github.com>
Date:   Tue Feb 6 02:35:50 2024 -0800

    O3-2720: Visit stop time input not working in edit mode (#1621)
    
    * 03-2720:Visit stop time input not working in edit mode
    
    * Update the commit
    
    * remove redudant new date()
    
    * fix
    
    * update commit

[33mcommit 6a3d787375c97d4e1acade8cc17d2afe07c9557c[m
Author: Vijay Kv <vijaykv2228@gmail.com>
Date:   Sat Feb 3 22:30:33 2024 +0530

    (fix) O3-2658: Show attachment descriptions when available (#1626)
    
    * (fix) 03-2658 Attachment description fixed  When Viewing Images
    
    * fixed the changes
    
    * Minor fixup
    
    * Show attachment description as well as fix up some more things
    
    * Fixup
    
    * Remove helper text about supported file types
    
    * Remove alignment from gallery container
    
    * Clean up most other things
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit b9192c1805bf4d2c5e223f7fa9eae16d96b74807[m
Author: Usama Idriss Kakumba <53287480+usamaidrsk@users.noreply.github.com>
Date:   Fri Feb 2 15:42:45 2024 +0300

    (feat) O3-2716: Prompt users to close workspaces when navigating from the patient chart (#1607)
    
    * feat: add prompt notification on navigating from patient chart when workspaces are open
    
    * Showing prompt when moving out of patient chart and workspaces can't be closed
    
    * Updated translations
    
    * refactor: move functions above test functions
    
    * refactor: move functions above test functions
    
    ---------
    
    Co-authored-by: Vineet Sharma <sharmava05@gmail.com>

[33mcommit 9f3f1cda612f662fd3ea0b76a9c7002f2ab01270[m
Author: Usama Idriss Kakumba <53287480+usamaidrsk@users.noreply.github.com>
Date:   Fri Feb 2 12:17:25 2024 +0300

    (feat) O3-2782: Show an inline notification for camera access errors in the add attachment modal (#1631)
    
    (feat) Show inline notification for camera access error
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 5c712877203dd3788402a89154d14f695445a556[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Feb 2 10:10:51 2024 +0300

    (fix) prevent duplicate patient enrollment and add snackbar timeout (#1634)
    
    (fix) prevent double patient enrollment while in edit mode and add `showSnackbar` time out

[33mcommit d88ad310b8f69eeac7148930b511a65068895815[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Thu Feb 1 19:38:24 2024 +0000

    (feat) Support for pre-filled questions (#1602)

[33mcommit b7b50c34d3d9f258fd802573d95e88a43727927b[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Feb 1 19:48:22 2024 +0300

    (feat) allergies detail widget should span 4 columns by default (#1632)

[33mcommit 769b3cdf17595a14f4be257ffdf0e0816472bd1a[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Jan 31 11:59:56 2024 -0500

    (chore) Only auto-generate English translations (#1629)

[33mcommit 6f81c473ccdf57f13c6eb2b92d0d5f7e16201db2[m
Author: icrc-loliveira <68058940+icrc-loliveira@users.noreply.github.com>
Date:   Tue Jan 30 18:17:45 2024 +0000

    (feat) Restrict attachments to configured allowed extensions (#1584)
    
    Co-authored-by: Ian <52504170+ibacher@users.noreply.github.com>
    Co-authored-by: Luis Oliveira <luis.oliveira@icrc.org>

[33mcommit 59c465b153de14b6f145e881d7fd8c6438a129f7[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Jan 30 22:58:49 2024 +0530

    (fix) Added translation for Lab order workspace title (#1625)
    
    Added translation for Lab order workspace title
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 9906ed5c85e7f0697206421122f1fba3c3d97c8b[m
Author: Ian <ian.c.bacher@gmail.com>
Date:   Tue Jan 30 12:10:40 2024 -0500

    (fix) Fix TS issue with types for attachments

[33mcommit 7deb35a2bb14ed6985caf0befbf133f34329f40b[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Tue Jan 30 19:26:19 2024 +0300

    (fix) O3-2662: Unable to attach images when registering/editing a patient (#1585)

[33mcommit 49ece7394a161de642c466b7526964f6e7117bf5[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Jan 30 03:32:38 2024 +0530

    (feat) Added translation for patient flags workspace (#1624)
    
    Added translation for patient flags workspace

[33mcommit daad56a33b0abdc2d761ed5553572397fe38715f[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jan 29 23:57:54 2024 +0300

    (feat) Remove ResponsiveWrapper component from common lib (#1627)

[33mcommit ac5f146ac02036214ad81240acc179817799aac4[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Jan 27 19:59:25 2024 +0300

    (fix) Remove direct dependency between common lib and forms apps (#1623)
    
    (chore) Remove direct dependency between common lib and forms apps

[33mcommit 7969e809900f76dc79f3c672655fd7838145b28e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Jan 26 19:48:31 2024 +0300

    (feat) Specify upload size limit and supported file types in file uploader (#1620)

[33mcommit c7bc6d7753ec98b3108e57c13281f5433dcb49e1[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Fri Jan 26 11:40:06 2024 -0500

    (chore) Switch to new frontend building job

[33mcommit 9b0c7bbe5fb61f7471371e38036c509771b33bf3[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Jan 26 12:29:27 2024 +0300

    (feat) Add ResponsiveWrapper to common lib (#1622)

[33mcommit bd572cee37c98ca8cc02d15caf2137757ea93256[m
Author: Ps world <45814713+psworld@users.noreply.github.com>
Date:   Thu Jan 25 17:30:03 2024 +0530

    (refactor) O3-2709: Use Camera carbon icon instead of the SVG placeholder in registration form (#1618)
    
    * (refactor): O3-2709 Used <Camera /> instead of svg in registration form
    
    * Fixup
    
    ---------
    
    Co-authored-by: Ps <ps.world.is.here@gmal.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 0c55f93cd4032d57913314a5dd5f6b44374c807a[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 24 23:22:17 2024 +0300

    (feat) Add isLowContrast prop to encounter deletion notifications (#1614)

[33mcommit f1df2be3ac4f60ebbd62dc5df80ae90a0d8cf87e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 24 23:12:10 2024 +0300

    (feat) Require a visit to launch the visit notes form (#1617)

[33mcommit d802d68feb48fb3a574c45d2a14e93d5f6e7ecf6[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Wed Jan 24 20:25:12 2024 +0100

    (feat) O3-2618: Attachments not hooked up in Visit Note (#1522)
    
    * Basic visit note attachment functionality working
    
    * Improve image display; call mutate on attachments SWR; support for changing the image
    
    * Clean up; make image only preview when its an image
    
    * Remove 'Add an image' text
    
    * Attachments API functions moved out to @openmrs/esm-framework
    
    * Update core dep

[33mcommit 8123a3acaedf3c3d55f2a3eb6183c7886cebc246[m
Author: Ps world <45814713+psworld@users.noreply.github.com>
Date:   Wed Jan 24 03:46:41 2024 +0530

    (refactor) O3-2709: Update placeholder camera icon used in registration form (#1601)
    
    * (refactor): O3-2709 used Carbon Library camera icon for placeholder in patient registration
    
    * Fix indentation
    
    ---------
    
    Co-authored-by: Ps <ps.world.is.here@gmal.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit ebe209010e6048e93d286b47fb542e799fe41100[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 24 01:16:23 2024 +0300

    (chore) Bump @openmrs/ngx-formentry (#1610)

[33mcommit 02e794f0bdeb9348ad308f3267b947a49625fa16[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Wed Jan 24 00:27:35 2024 +0300

    Bump follow-redirects from 1.15.3 to 1.15.5 (#1612)
    
    Bumps [follow-redirects](https://github.com/follow-redirects/follow-redirects) from 1.15.3 to 1.15.5.
    - [Release notes](https://github.com/follow-redirects/follow-redirects/releases)
    - [Commits](https://github.com/follow-redirects/follow-redirects/compare/v1.15.3...v1.15.5)
    
    ---
    updated-dependencies:
    - dependency-name: follow-redirects
      dependency-type: indirect
    ...
    
    Signed-off-by: dependabot[bot] <support@github.com>
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 1c4540456bbc4f429aad788f97c3c1aefe61723d[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Wed Jan 24 00:10:06 2024 +0300

    Bump ua-parser-js from 0.7.31 to 0.7.37 (#1559)
    
    Bumps [ua-parser-js](https://github.com/faisalman/ua-parser-js) from 0.7.31 to 0.7.37.
    - [Release notes](https://github.com/faisalman/ua-parser-js/releases)
    - [Changelog](https://github.com/faisalman/ua-parser-js/blob/0.7.37/changelog.md)
    - [Commits](https://github.com/faisalman/ua-parser-js/compare/0.7.31...0.7.37)
    
    ---
    updated-dependencies:
    - dependency-name: ua-parser-js
      dependency-type: indirect
    ...
    
    Signed-off-by: dependabot[bot] <support@github.com>
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit b3af1a452d58079342c879e09a970b2053f5c46c[m
Author: elimm <elimm@users.noreply.github.com>
Date:   Tue Jan 23 22:27:40 2024 +0200

    (fix) O3-2752: Encounter view UI fixes for RTL languages (#1596)
    
    * (fix) O3-2752: encounter view RTL alignment fix
    
    * (fix) O3-2752: remove global overrides
    
    ---------
    
    Co-authored-by: Andrey Y <andrey.yakubyshyn@med.me>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 897013d838f6a67c394deda10c1a7bb5798216f3[m
Author: Jamie Arodi <51090527+arodidev@users.noreply.github.com>
Date:   Tue Jan 23 22:44:04 2024 +0300

    (fix) See all results button navigates to the results viewer (#1611)
    
    fixed url

[33mcommit 5d608f844188ff9c208e6a5e1b9d9fea43e85dea[m
Author: Usama Idriss Kakumba <53287480+usamaidrsk@users.noreply.github.com>
Date:   Tue Jan 23 22:28:03 2024 +0300

    (fix) O3-2713: Fix positioning of side rail action badges (#1599)
    
    * fix: fix side rail actions and badges off center
    
    * Fix km.json

[33mcommit 24fa71c63b98f019c459d6427cc5ba642e83ed92[m
Author: Pradip Ram <101059602+Pradipram@users.noreply.github.com>
Date:   Tue Jan 23 23:28:41 2024 +0530

    (fix) O3-2757: Change all anchor tag cursors from text to pointer type. (#1604)
    
    Co-authored-by: Vineet Sharma <sharmava05@gmail.com>

[33mcommit 228465c790d7e4002fe05bdba610398222fbd956[m
Author: befantasy <31535803+befantasy@users.noreply.github.com>
Date:   Tue Jan 23 20:54:03 2024 +0800

    (chore) Adjust cron scheduling for tx-pull workflow (#1609)
    
    Co-authored-by: Ian <52504170+ibacher@users.noreply.github.com>

[33mcommit 3f187cedc7ab6cb4072809d67b64a9a1dfb8455b[m
Author: chibongho <cbho@pih.org>
Date:   Mon Jan 22 13:09:08 2024 -0500

    (fix) O3-2715: make clinical forms workspace not maximizable (#1608)
    
    (fix) O3-2715: make Forms Dashboard workspace not maximizable

[33mcommit 7c6228420c1b3fddd1cac51634811d04bf3ec93b[m
Author: Njidda Salifu <njiddasalifu@gmail.com>
Date:   Mon Jan 22 14:53:42 2024 +0100

    (feat) O3-2755: Use snackbar notification in allergies app (#1603)
    
    Use Snackbar notification in allergies widget
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit d0b5315bb4643bb7f154a391ae70c254c699d30a[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jan 22 12:44:23 2024 +0300

    (feat) Add translations for form navigation links (#1606)

[33mcommit eb7dbeccf0a6faf65a0f900f60cfa4f9944ad130[m
Author: befantasy <31535803+befantasy@users.noreply.github.com>
Date:   Sun Jan 21 13:25:57 2024 +0800

    (chore) Update Transifex config (#1600)
    
    After checking the results and command instructions, it seems that the new version of Transifex requires an additional parameter to be configured: "resource_name". Otherwise, the new added resource name displayed on Transifex will default to "en.json".

[33mcommit a7cbdf8988167785ec706e39760755743b65105c[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Fri Jan 19 16:51:05 2024 +0000

    (fix) Use registerWorkspace to register clinical-forms-workspace (#1591)

[33mcommit bd62b368a9ade9edc31b06b262f0eeefad1cb56e[m
Author: befantasy <31535803+befantasy@users.noreply.github.com>
Date:   Fri Jan 19 06:53:20 2024 +0800

    (chore) Update transifex config (#1598)
    
    Update config
    
    update the config to sync with the transifex project

[33mcommit 100ce9100fe34d0982c03fa0669fd2645b96ccce[m
Author: Samuel Male <samuelsmalek@gmail.com>
Date:   Thu Jan 18 23:27:40 2024 +0300

    (feat) Revitalized Immunization Support (#1572)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 2808c0f36ebcef8b2543b8dc18ab64914fce68c4[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 17 23:59:50 2024 +0300

    (fix) Fix medications display in visit summary (#1597)
    
    * (fix) Fix medications display in visit summary
    
    * Fixup

[33mcommit aba1bdca798928da12396b6a16fab41dd581efaf[m[33m ([m[1;32mO3-2705[m[33m)[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 17 08:13:59 2024 +0300

    (chore) Enable `continue-on-error` for deploy job in CI workflow (#1593)
    
    * (chore) Add a retry step for the deploy job in CI
    
    * Update ci.yml
    
    ---------
    
    Co-authored-by: Ian <52504170+ibacher@users.noreply.github.com>

[33mcommit c6654d4258a8d112d47893f7eed5614c389aa54e[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Tue Jan 16 15:47:32 2024 -0500

    (chore) Remove biometrics from tx config (#1594)

[33mcommit 37f56de509abe0c022b5855370c8dafc6d1b9bca[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Tue Jan 16 15:10:45 2024 -0500

    (chore) Add GitHub Actions flows to automate Transifex (#1592)
    
    (chore) Add TX automation workflows

[33mcommit dbb9f66ca55a95bd4f7392d2e3b077d6c0cf7486[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Jan 16 18:50:34 2024 +0000

    (fix) Trivial refactor in relationship component (#1590)

[33mcommit 8016ca5ebe2edb5b7abb5517ee979bcaca4f58bd[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Jan 16 18:47:20 2024 +0000

    (fix) Remove cruft from config schema (#1589)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit f29a6f3b051866b56b7baa4ab08ed6b2af7e2e9e[m
Author: Daud Kakumirizi <dkakumirizii@gmail.com>
Date:   Tue Jan 16 21:07:02 2024 +0300

    (feat) KH-428: Updated Khmer translation for `markDeceased` (#1588)
    
    KH-428: Updated Khmer translation for 'markDeceased'

[33mcommit bd674836b1141887c49394c06b94a93a0332bf92[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Jan 16 17:34:43 2024 +0000

    BREAKING: Clean up patient banner config (#1555)

[33mcommit 84939274d45463605a61c6a56bb34bd99ab31cde[m
Author: Ps world <45814713+psworld@users.noreply.github.com>
Date:   Tue Jan 16 18:34:07 2024 +0530

    (fix) O3-2709: wrong image placeholder used for add image in patient registration (#1580)

[33mcommit 7e05168704f271ff70bbb881c9dc27758fe57a2d[m
Author: Ps world <45814713+psworld@users.noreply.github.com>
Date:   Tue Jan 16 02:09:30 2024 +0530

    (fix) O3-2655: Record Vitals: Error message for invalid values pops up only once (#1578)
    
    * (fix) O3-2655: Record Vitals: Error message for invalid values pops up only once
    
    * Added Tests
    
    ---------
    
    Co-authored-by: Ps <ps.world.is.here@gmal.com>

[33mcommit efe1e24580975216ef405fd9e34eb3b56041e380[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Mon Jan 15 20:36:21 2024 +0000

    (chore) Commit extracted translations for zh (#1587)
    
    * (chore) Commit extracted translations for zh
    
    * Fixup
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit c8423f65d77dc39a8ca5c0e58c710ea4daeed286[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Mon Jan 15 20:35:40 2024 +0000

    (fix) Log a warning if workspaces are registered as extensions (#1586)

[33mcommit 87d61610779ed2d2b20e6e73fa30b63541238e91[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Mon Jan 15 17:34:46 2024 +0000

    (fix) O3-1594 BUG: Patient chart close button has inconsistent behavior (#1581)

[33mcommit 6bac38067b3c6134d67d9f7635bb9dae3739459a[m
Author: befantasy <31535803+befantasy@users.noreply.github.com>
Date:   Mon Jan 15 18:14:07 2024 +0800

    Updat the translation for zh and zh_CN (#1582)
    
    * Update zh.json
    
    * Update zh_CN.json
    
    * Update zh.json
    
    * Update zh_CN.json
    
    * Update zh.json
    
    * Update zh_CN.json
    
    * Update zh.json
    
    * Update zh_CN.json
    
    * Update zh.json
    
    * Update zh_CN.json
    
    * Update zh.json
    
    * Update zh_CN.json
    
    * Update zh.json
    
    * Update zh_CN.json
    
    * Update zh.json
    
    * Update zh_CN.json
    
    * Update zh.json
    
    * Update zh_CN.json
    
    * Update zh.json
    
    * Update zh_CN.json
    
    * Update zh.json
    
    * Update zh_CN.json
    
    * Update zh.json
    
    * Update zh_CN.json

[33mcommit 48d19852a9dd9aedde7cd9e0e1533d3a693425f3[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Mon Jan 15 13:09:17 2024 +0300

    (fix)03-O3-2729: Reduce white space. (#1583)
    
    (fix)03-O3-2729: Reduce white space between the back-to-patient-list button and the patient-search section
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>

[33mcommit 7c888bfc2b696ae1bcb28306a693cb99b80f143a[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Fri Jan 12 16:15:58 2024 -0500

    (chore) Add Chinese translations (#1577)
    
    Co-authored-by: befantasy <31535803+befantasy@users.noreply.github.com>

[33mcommit db7dd20bc5d7a73a16782925db59337d3e89571d[m
Author: Cosmin <cioan@pih.org>
Date:   Fri Jan 12 07:40:54 2024 -0500

    O3-2684: remove hard coded queue entry statuses (#1568)

[33mcommit 72482e976702ef171693dcdb5a734d69bba3ead8[m
Author: elimm <elimm@users.noreply.github.com>
Date:   Thu Jan 11 19:47:04 2024 +0200

    (fix) O3-2694: fixed cancel button caption alignment (#1561)
    
    Co-authored-by: Andrey Y <andrey.yakubyshyn@med.me>

[33mcommit f0328f86c16be660c3b06f542cd4d2a2c4fb9ae5[m
Author: Usama Idriss Kakumba <53287480+usamaidrsk@users.noreply.github.com>
Date:   Thu Jan 11 15:05:10 2024 +0300

    O3-2708 - (Fix) "Visit started" notification sticks around forever (#1569)
    
    * refactor: add 5s timeout on visit created or updated snackbar
    
    * fix: fix visit form tests

[33mcommit 0a8ebba37f0fc01ba2cd066d45c11a01ae462ade[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 10 22:29:10 2024 +0300

    (refactor) Set global testTimeout in Jest config (#1573)
    
    * (refactor) Set global testTimeout in Jest config
    
    * Commit some orphaned translations
    
    * Lower global timeout to 20000ms

[33mcommit 7cd00e4352f782edde34deaa99072d7975ef374a[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 10 21:52:59 2024 +0300

    (chore) Bump @openmrs/esm-patient-common-lib peer dependency (#1574)

[33mcommit cc99223d3db7488f670ac9a7f6ce4e259b6886bf[m
Author: Romain Buisson <rbuisson@users.noreply.github.com>
Date:   Wed Jan 10 19:05:57 2024 +0100

    (chore) Migrate to newer Transifex version (#1575)

[33mcommit 9e079cf2aaa23d7e323e68b711c97d0bdf3158b9[m[33m ([m[1;32mfix-patient-gender-show-lowercase[m[33m)[m
Author: Usama Idriss Kakumba <53287480+usamaidrsk@users.noreply.github.com>
Date:   Tue Jan 9 11:31:09 2024 +0300

    (fix) O3-2707: Patient Search: Start visit button doesn't work (#1570)
    
    fix: fix start visit on patient search

[33mcommit 144284976dc5ecc59e95f908a15be5b46451f4b7[m[33m ([m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m, [m[1;32mfix-start-visit-on-patient-cahrt[m[33m)[m
Author: Ps world <45814713+psworld@users.noreply.github.com>
Date:   Mon Jan 8 20:55:00 2024 +0530

    (fix) O3-2718: inconsistent notification style upon cancelling an active visit (#1566)
    
    O3-2718: Fix inconsistent notification style upon cancelling an active visit
    
    Co-authored-by: Ps <ps.world.is.here@gmal.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 12266ecfbf5f9c5ea4c9bdaf37cc19d2657841e8[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jan 8 14:02:16 2024 +0300

    (chore) Bump @openmrs/ngx-formentry (#1563)

[33mcommit a2d0fab1197d95f45c9ea02e0c60c7fa9ac2f590[m
Author: Ps world <45814713+psworld@users.noreply.github.com>
Date:   Mon Jan 8 15:59:38 2024 +0530

    (fix) O3-2719: Inconsistent UI in visit summaries tabs when Empty State (#1567)
    
    (fix) O3-2719: Inconsistent UI in visit summaries tabs
    
    Co-authored-by: Ps <ps.world.is.here@gmal.com>

[33mcommit ec0a1c7d62882b44049711b1f3d0e99a1834d720[m
Author: Ps world <45814713+psworld@users.noreply.github.com>
Date:   Mon Jan 8 01:32:49 2024 +0530

    (fix) O3-2721: Fix empty state shown when a visit has no encounters (#1565)
    
    * O3-2721: Fix Ugly empty message when visit has no encounters
    
    * Fix test
    
    ---------
    
    Co-authored-by: Ps <ps.world.is.here@gmal.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 8e2fd5f489df9c314832ccfb49668a84f7e77688[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 3 23:38:43 2024 +0300

    (chore) Upgrade Playwright version in Docker image (#1560)
    
    * (chore) Upgrade Playwright version in Docker image
    
    * Update README

[33mcommit 516f9919f9d4eecb826e4bed1d029e0a0c7683fd[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 3 21:22:32 2024 +0300

    (chore) Bump testing dependencies and fix test console warnings (#1553)
    
    * (chore) Bump testing dependencies and fix test console warnings
    
    * Try to fix issues with types not get loaded correctly in VSCode
    
    * Fixup
    
    * Fixup
    
    * Add jest setup file to tsconfig includes for all packages and restore disabled tests

[33mcommit 8da491dd9b28357bd225eee5d61e793c0690b755[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 3 17:39:36 2024 +0300

    (chore) Upgrade Angular to v16 (#1558)

[33mcommit 0d26db03812f7ca0e1a92f44d6018e9f2123135b[m
Author: Usama Idriss Kakumba <53287480+usamaidrsk@users.noreply.github.com>
Date:   Tue Jan 2 22:16:22 2024 +0300

    (fix) O3-2666: Order getting removed after clicking on Back to order basket (#1549)
    
    Co-authored-by: Vineet Sharma <sharmava05@gmail.com>

[33mcommit fc9c21700ff9f2cf094d190c16ffb1f6c4f0955e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jan 2 22:00:26 2024 +0300

    (chore) Fix @actions/cache version

[33mcommit 260e5586f016b0702537c27e4232fd5f480066f8[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jan 2 21:43:49 2024 +0300

    (chore) Update GitHub Actions and Node versions (#1556)

[33mcommit 50b5515d817205d15a111c34d8a46995d134a969[m
Author: Daud Kakumirizi <dkakumirizii@gmail.com>
Date:   Tue Jan 2 11:45:46 2024 +0300

    KH-428: Updated Khmer translation for 'markDeceased' (#1557)

[33mcommit 376ba745e6f52786df6d553a8306fd8183370dba[m
Author: suubi-joshua <78343336+suubi-joshua@users.noreply.github.com>
Date:   Thu Dec 21 20:43:28 2023 +0300

    (chore) O3-2628: Add timeout to GH action workflows (#1551)
    
    * Reduced the timeout for the github  workflow
    
    * Added timeout 15 mins to ci.yml
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit ea168e14d9f74c48d56b2775070cf7c028ba01a1[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Thu Dec 21 14:12:06 2023 +0300

    (fix) O3-2671: Lab orders added directly to the basket should be marked incomplete (#1552)
    
    * (fix)O3-2671:Adding lab order directly to basket should be marked as incomplete order
    
    * fix build failure
    
    ---------
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 66082bf228c6ee50a07eb339f7694f04740b5786[m
Author: chibongho <cbho@pih.org>
Date:   Wed Dec 20 17:02:13 2023 -0500

    (fix) O3-2667: Fix appointment form not saving after appointment date change (#1554)

[33mcommit 0d1b37b4bdba011224b9406c9c3b3226af570348[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Dec 21 00:36:32 2023 +0300

    (feat) Add `Form name` column to visit-table (#1547)
    
    (feat) Add `Form name` to visit-table

[33mcommit 3b7054b25e95776c979c893578b1c6288dc90430[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Dec 19 15:31:49 2023 +0300

    (fix) Update Results Viewer translation in breadcrumbs menu (#1550)

[33mcommit aea5998e3bc3a28f4bce3a7c3e746379ab45d5ba[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Dec 18 23:56:30 2023 +0300

    (chore) Bump @openmrs/ngx-formentry (#1548)

[33mcommit 14bf545996771ee88b48090a83db970617431dcb[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Mon Dec 18 23:14:18 2023 +0300

    (feat) O3-2637: Rename `Test Results` left panel link to `Results Viewer` (#1538)
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit d761d8e001ec944aacb8f4db5e66da54df750f85[m
Author: Usama Idriss Kakumba <53287480+usamaidrsk@users.noreply.github.com>
Date:   Mon Dec 18 13:06:05 2023 +0300

    (improvement) O3-2652: Fix drag and drop file uploader style in the attachments app (#1546)
    
    Co-authored-by: Vineet Sharma <sharmava05@gmail.com>

[33mcommit ef07534f970a18e0cc3cc07603a8f6fbd6ad0241[m
Author: Usama Idriss Kakumba <53287480+usamaidrsk@users.noreply.github.com>
Date:   Mon Dec 18 10:17:54 2023 +0300

    (fix) O3-2650: Fix the alignment of the close button content on the attachment preview (#1534)

[33mcommit 73136972858a062f40592633f2ab7358b788d100[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sun Dec 17 13:43:22 2023 +0300

    (fix) Remove logical block start padding from icon only buttons (#1545)

[33mcommit 57646b952ce1f5abb96e8fd9ee5981edc8a466fa[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Sat Dec 16 22:13:55 2023 +0300

    Bump zod from 3.22.2 to 3.22.3 (#1539)
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 84978d3a6ceb44dbc54edf5c2af47ad16f630932[m
Author: Usama Idriss Kakumba <53287480+usamaidrsk@users.noreply.github.com>
Date:   Sat Dec 16 20:22:17 2023 +0300

    (fix) O3-2651: Fix some spacing and alignment issues in the Patient Chart (#1536)
    
    Co-authored-by: Vineet Sharma <sharmava05@gmail.com>

[33mcommit 53ce61a11a7cc8d1e8852c952e7e5febb5013b9f[m
Author: Jayasanka Weerasinghe <33048395+jayasanka-sack@users.noreply.github.com>
Date:   Sat Dec 16 03:14:10 2023 +0530

    (feat) O3-2614: Move Allergen tabs to a single picker in allergy form (#1525)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 089fd13dc12ec37c796410007e5ba24287bdfbd3[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Dec 15 22:08:47 2023 +0300

    (fix) Scope data cell white-space styling to just the vitals table (#1544)

[33mcommit 76d336764da5f7d2a81be7f679c7de80088d3620[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Fri Dec 15 01:58:17 2023 +0530

    (fix) Remove excessive overrides from the siderail nav buttons (#1541)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 7eb196cbe727bf781ce2167379182e00313b36eb[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Dec 13 16:25:03 2023 -0500

    (chore) Update Angular form engine version (#1540)

[33mcommit aae70f3531586af262ee314ba3b416a581d39934[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Wed Dec 13 19:33:09 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1537)
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit 9b360cc436081c3c00ecf92ea284e121c426e43d[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Wed Dec 13 20:26:55 2023 +0300

    (fix) O3-2609: Fix rendering issue in the patient details tile extension (#1533)

[33mcommit 83353122edd16b447d054c9efa443714db658d52[m
Author: Usama Idriss Kakumba <53287480+usamaidrsk@users.noreply.github.com>
Date:   Sun Dec 10 23:30:05 2023 +0300

    (O3-2601)[feat] - Hide bottom navigation on tablet, when filling forms (#1531)
    
    * feat: hide bottom navigation on tablet, when filling forms
    
    * refactor: use display to remove the navbar from layout

[33mcommit 445372f25739193364dbe2a5ea8e3b7827cc2709[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Fri Dec 8 11:25:25 2023 +0300

    O3-2642 Add configurable link to patient chart on the relationship na… (#1528)
    
    O3-2642 Add configurable link to patient chart on the relationship name in the relationships widget

[33mcommit 78a7c0e0c33861234c90f58ff8bcaef5003050c4[m
Author: gitcliff <46714226+gitcliff@users.noreply.github.com>
Date:   Thu Dec 7 16:50:45 2023 +0300

    (fix)03-2577 Results tree view should be collapsed by default (#1524)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 36162d4a2c5a8d0718dd596cf9d466f4edf072e3[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Thu Dec 7 13:27:29 2023 +0300

    (refactor)Separate Tags logic into its own function (#1526)
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>
    Co-authored-by: Vineet Sharma <sharmava05@gmail.com>

[33mcommit 9f15df7c4025d90a6236e152bff1ef8b7a01e4e6[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Dec 6 16:46:54 2023 +0530

    (fix) Workspace window should have the size of the preferred window state (#1444)

[33mcommit a8bcf2bcf35fd98f3fbe838d93fb54c9829b9d95[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Mon Dec 4 15:03:46 2023 +0000

    (fix) Allow edit O2 form in visits widget (#1489)

[33mcommit 4087f967e76b38886b875844e526ec1fc1c85d8d[m
Author: Pius Rubangakene <piruville@gmail.com>
Date:   Mon Dec 4 10:41:19 2023 +0300

    (feat) Order summary/history (#1463)
    
    * (feat) lab orders history and results
    
    orders print and pending orders
    
    adds translations
    
    moving orders summary to orders esm
    
    translations
    
    updates import
    
    * fixes to residue after rebase
    
    * adds pagination and filter logic
    
    * pr changes
    
    * PR changes
    
    * adds feature flag and minor tweaks
    
    * Cleanup
    
    ---------
    
    Co-authored-by: Vineet Sharma <sharmava05@gmail.com>

[33mcommit 7a49ac26795b571004a5c1a581dbe6358019f0d1[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Fri Dec 1 15:06:51 2023 -0500

    (fix) Make it so visit diagnosis error doesn't crash the app (#1521)

[33mcommit a180ffa4f909a58fa3a1586624c731fc3555d65d[m[33m ([m[1;33mtag: v6.1.0[m[33m)[m
Author: Jayasanka Weerasinghe <33048395+jayasanka-sack@users.noreply.github.com>
Date:   Fri Dec 1 18:56:21 2023 +0530

    (chore) Release v6.1.0 (#1518)
    
    Co-authored-by: Vineet Sharma <sharmava05@gmail.com>

[33mcommit a996977b5d528cb48bf7ac1da897c4ab6726585d[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Fri Dec 1 18:09:58 2023 +0530

    (fix) Fix the workspace maximize action button (#1520)
    
    Fix the workspace maximize action button

[33mcommit f7a5176c6b69b68f044c12a1a976fa75203c0f3c[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Fri Dec 1 18:00:13 2023 +0530

    (chore) Bump @openmrs/ngx-formentry (#1519)
    
    * Bump @openmrs/ngx-formentry-app
    
    * Increased the test timeout for conditions overview to 15000

[33mcommit e82694290162a583f70a92ac9f296c18942dda87[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Fri Dec 1 09:07:03 2023 +0300

    Bump @adobe/css-tools from 4.3.1 to 4.3.2 (#1517)
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit c20955a511ac1d33685691c04c8421d3e8a535a0[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Dec 1 01:10:50 2023 +0300

    (feat) Add ability to conditionally show visit attributes (#1513)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 03e16c25e8b3c423b8ccc65aecd41ad0ef6025d8[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Nov 30 20:32:29 2023 +0300

    (e2e) Test start visit workflow (#1516)

[33mcommit 98534acca5ed4f7e4c522725115391c726dc63fc[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Nov 30 00:46:08 2023 -0500

    (fix) O3-2612: Attachments App Crashes O3, then blocks adding attachments for any patient (#1515)

[33mcommit 12cf6c634a0e9690bd509c6715f42e2d9865a3e2[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Nov 29 15:20:43 2023 -0500

    (fix) Remove form-engine-app (#1514)

[33mcommit c7f12513b078df20c681559695feeaa65de9c470[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Nov 29 22:27:06 2023 +0530

    (fix) Missing translations in forms workspace title and vitals overview component (#1506)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 3ac048a493670b932d7446681bdcd6548610b798[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Nov 29 18:43:17 2023 +0300

    (fix) Fix rendering error in conditions form (#1512)

[33mcommit 0c20c49518032dc58a4a8013597b75ed900c22d9[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Nov 29 15:02:03 2023 +0300

    (e2e) Test clinical forms workflow (#1504)
    
    ---------
    
    Co-authored-by: Jayasanka <jayasanka.sack@gmail.com>

[33mcommit f1bb9d92d0733f21f13986f9f43df0cf43c7a828[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Tue Nov 28 23:26:17 2023 +0300

    Bump word-wrap from 1.2.3 to 1.2.5 (#1510)
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit b075b97b710525913eeb24812f51ec112a24070c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 28 10:17:07 2023 +0300

    (fix) Fix workspace header action button borders (#1511)

[33mcommit 2ec8d7e0d7eecd6d7a91f942be85e0c46648f23f[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 28 01:13:39 2023 +0300

    (fix) O3-2611: Workaround for fixing form entry styles (#1509)

[33mcommit d6685996b82dde4ee8b755ab4942a9cd817f5b8a[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Nov 27 16:51:33 2023 +0300

    (test) Remove async waitFor from tests (#1500)
    
    * (chore) Upgrade tree-model to 1.0.7 (#1505)
    
    * Fix validateDOMNesting warning
    
    * Fixup
    
    ---------
    
    Co-authored-by: Brandon Istenes <bistenes@gmail.com>

[33mcommit bdccf52f5e9f98af8338ea5fe05435d64c86853c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Nov 27 15:58:35 2023 +0300

    (e2e) Test drug order flow (#1494)
    
    * (e2e) Test drug order flow
    
    * Test that newly added order is visible

[33mcommit 2eea098cf560ba3a8a1dc54771c5f963981e727a[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Mon Nov 27 13:38:27 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1507)
    
    Co-authored-by: GitHub Actions <github-actions@github.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 02425bdbf31c8d32e774eae2332826d9a55f1192[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Mon Nov 27 06:20:56 2023 -0500

    (chore) Upgrade tree-model to 1.0.7 (#1505)

[33mcommit 3c4a02c304999d1e026ca9835994f5e0efc5d529[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Fri Nov 24 23:11:25 2023 +0300

    (feat) O3-2580: Use the new snackbar in other patient chart apps(part 3) (#1476)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit af203e37f0489b82eae515d2d607b747e0d1e8fc[m
Author: Njidda Salifu <njiddasalifu@gmail.com>
Date:   Fri Nov 24 19:12:58 2023 +0100

    (feat) O3-2571: Using the new snackbar in programs app (#1503)

[33mcommit 0ec7d197438bd544365d283ac1e466ee0c55ac8a[m
Author: Njidda Salifu <njiddasalifu@gmail.com>
Date:   Fri Nov 24 12:06:27 2023 +0100

    (feat) O3-2571: Use new snackbar notification in conditions, notes, orders and vitals apps (#1502)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit a1efca31e2c040dcb612b8d2e46156152c8d770a[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Fri Nov 24 01:36:10 2023 +0300

    (fix) 03-2588: Tweak workspace alert badge UI (#1499)
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit f97d118a805c7df5d92648bc3307c7a005b171cf[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Thu Nov 23 23:49:22 2023 +0300

    (chore) Bump semver from 5.7.1 to 5.7.2 (#1485)
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit b239efcac6b54665d022c67fc136fe47b9418447[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Thu Nov 23 22:35:50 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1493)
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit 5121992f52752d9c022edd69daaabf0cf7304148[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Nov 23 23:12:25 2023 +0300

    (chore) ESLint: Add consistent-type-imports and no-console rules (#1498)

[33mcommit be98437627c19bcadc1f85ca431ef92da8aa0238[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Nov 23 12:34:43 2023 +0300

    (feat) Tweak aspects of the patient lists workspace (#1496)
    
    * (feat) Tweak aspects of the patient lists workspace
    
    * (feat) Tweak aspects of the patient lists workspace
    
    * Update translations
    
    * Remove console.logs

[33mcommit 8b6b72b649280cb4d03983fc038cd7bff9fdbebf[m
Author: ThemboJonathan <jonathanthembo123@gmail.com>
Date:   Thu Nov 23 00:51:06 2023 +0300

    (feat)O3 2570: Use the new snackbar in patient chart(6 apps) (#1478)
    
    * use snackbar in form-entry, patient-chart,allergy-app,patient-appointment,attachments, flags
    
    * update tests
    
    * update contrast
    
    * update contrast
    
    * update program contrast
    
    ---------
    
    Co-authored-by: CynthiaKamau <cynthiakamau54@gmail.com>

[33mcommit cfb512f4af8209b9ed39df8de0d893699bd9dc45[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Nov 22 00:19:18 2023 +0300

    (chore) Add common lib devDependency to packages (#1491)

[33mcommit 9beca2d886f647b05766ac56c6503bfc2dc2d7ff[m[33m ([m[1;33mtag: v6.0.0[m[33m)[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 21 23:47:03 2023 +0300

    (chore) Release v6.0.0 (#1492)

[33mcommit 04a589f5bab6944f2041ef3970b744700cdbf48d[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 21 22:25:54 2023 +0300

    (e2e) More e2e refactors (#1487)

[33mcommit aa3b3a460213c0256ea66b7dcc32490ce8e50836[m
Author: ComradeSwarog <46655729+ComradeSwarog@users.noreply.github.com>
Date:   Tue Nov 21 21:54:53 2023 +0300

    (feat) O3-2581: Add hebrew translations (#1479)
    
    Co-authored-by: Ian <52504170+ibacher@users.noreply.github.com>

[33mcommit 647143b268ca84a6d6bfb3192f0a5dabc4155c59[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Tue Nov 21 16:10:12 2023 +0300

    (fix)03-2586: Lab order search should have auto focus (#1488)
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>

[33mcommit 9556506e41f65e8767fab7c526744eff4cb53576[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Tue Nov 21 14:32:26 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1486)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit f094b92e050dfc99576f1afb6c22f7cd490d390a[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 21 02:32:37 2023 +0300

    (chore) Bump form entry app to Angular 15 (#1466)

[33mcommit ca33a3b7c705dd52e79581611a198e28723e43db[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 21 00:04:24 2023 +0300

    (e2e) Use more resilient locators (#1483)

[33mcommit 33f267a83d62911c70bebfc722f4b882d0a4a51d[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 21 00:04:05 2023 +0300

    (feat) Order basket UI tweaks (#1484)

[33mcommit 2afcab12b0cd63835ae16cb660735f34587cb1d8[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Mon Nov 20 13:27:40 2023 -0500

    (fix) Make isValueWithinReferenceRange resilient to missing metadata (#1482)

[33mcommit 2d1aa7facd25ce8ab885229d330b7f7eb1e27f88[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Mon Nov 20 11:56:10 2023 -0500

    (fix) Vitals form should not render if metadata is loading (#1481)

[33mcommit a30cc35ecb880d33bbae9ae31ec2877f1a539307[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Mon Nov 20 20:46:02 2023 +0530

    (fix) `Add to basket` action on drug tile should mark the order as an incomplete order (#1468)
    
    * Add to basket should add the order as an incomplete order if no order template is present
    
    * Updated translations
    
    * Saving the form should convert the action from Incomplete to new
    
    * Incomplete orders should be marked as new orders on saving the form
    
    * Fixed Khmer translations
    
    * Separated incomplete status from order action

[33mcommit d584d90db4d42376dd52b1be101edaaa8dfdd45c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Nov 20 14:20:49 2023 +0300

    (test) Refactor e2e tests to adopt best practices (#1475)

[33mcommit 8333690c1b25d0eba830fbc41a639203570707a7[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Mon Nov 20 14:40:56 2023 +0530

    (fix) Khmer translations added and few textual changes (#1467)

[33mcommit 5ea898699782a639d5c0c52014f32a14a5fc03d4[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon Nov 20 10:02:19 2023 +0300

    (fix) Set the correct time format for both visit start and end datetime (#1477)
    
    (fix) Set the correct time format for both visit start and end date

[33mcommit 5c56fa7f14fc4a5a747338ec558d20af8bde9088[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Sat Nov 18 09:23:52 2023 +0300

    (fix) Restore ability to optionally launch clinical form from vitals and biometrics widget  (#1474)

[33mcommit 084e22d1de13df520ba372cdb93f9ae51e213d0d[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Nov 17 23:06:13 2023 +0300

    (feat) Update encounter date to pick visitStartDatetime (#1405)
    
    * (feat) Update encounter date to pick visitStartDatetime
    
    * code review
    
    ---------
    
    Co-authored-by: CynthiaKamau <cynthiakamau54@gmail.com>

[33mcommit 6de2661a98c41de685efcdec8665767a26c91af7[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Nov 17 20:12:30 2023 +0300

    (feat) Add a patient lists workspace to the side rail (#1471)

[33mcommit 6ed71c9d22497276774503cc62284fcfb05ea4be[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Fri Nov 17 16:29:30 2023 +0000

    (fix) Remove unnecessary default HTTP parameter (#1473)

[33mcommit 2aa5333d72458bda749b907bea687fb01183c9a8[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Fri Nov 17 13:44:46 2023 +0000

    (fix) Correct o3 forms route for offline caching (#1472)

[33mcommit 13cc7f9439b6a338d30463a83a8dbefc65313269[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Fri Nov 17 13:35:08 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1464)
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit 0ab39196828602d74e4866a7c90f2ed9297b3857[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Fri Nov 17 10:44:52 2023 +0530

    (fix) O3 Modal confirmation from user to modify visit date to accomodate new encounter date and time (#1435)
    
    * Bypassing user confirmation for editing visit dates for saving edited forms
    
    * Validate if the encounter date time falls in the visit start and stop date and use O3 confirmation modal
    
    * Updated translations

[33mcommit 9a472fbf2289fc7125741a0daf7d5d12b12831ac[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Thu Nov 16 22:04:59 2023 +0000

    (fix) Register forms endpoint as dynamic route (#1470)

[33mcommit d2f3cb297594c619ad24031d6bd948167d478d24[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Nov 14 20:09:47 2023 +0530

    (feat) Allow privileged users to edit visit details and delete empty visits (#1451)

[33mcommit 5fb68fbded812c6c4e1965b0ab3c0f14126400a7[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 14 14:35:07 2023 +0300

    (chore) Update action versions

[33mcommit e6bdb5d7b519f93f1c34522c342df8debdff9c45[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 14 12:23:13 2023 +0300

    (feat) Tweak visit action modal content

[33mcommit f9a9b6cd9307dcffe82bfb2a0dda0d6ccc471d18[m
Author: Imeth Pathirana <55105553+ImethP2@users.noreply.github.com>
Date:   Sun Nov 12 10:48:22 2023 +0530

    (fix) O3-2416 : Add E2E test guide link to the readme file (#1462)

[33mcommit 9a95c6fc2c381ef74410c683b20dd66bde61f12e[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Fri Nov 10 15:00:55 2023 -0500

    (feat) Preload most extensions and pages (#1461)

[33mcommit e53014c04e7714c971f81420c8ff4dc8d48a9fb6[m
Author: Makombe Kennedy <kennedymakombe@gmail.com>
Date:   Fri Nov 10 14:28:36 2023 +0300

    (fix) Fix error when clearing the test type field of the lab order form (#1460)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 881258a0cdd90161ac4c0f3398193da7bc5e0752[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Thu Nov 9 20:01:01 2023 +0000

    (feat) Support offline in forms dashboard (#1437)

[33mcommit 1b819bc1830c6137d1ad653b0cfdb18024875c6d[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Nov 9 17:35:43 2023 +0300

    (fix) Fix translation for height (#1459)

[33mcommit 8f117b157710f4eee51c6684fdb28119d42a49d9[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Thu Nov 9 14:33:17 2023 +0000

    (feat) add config to display encounter type in generic widgets (#1450)

[33mcommit e87b8ace798454c023a803d859ae182f65631eb7[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Nov 8 15:47:24 2023 -0500

    BREAKING: Merge vitals and biometrics apps (#1429)

[33mcommit 50ef9dde5493ea0fcceacb39795e9877cb275c3e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Nov 8 20:32:26 2023 +0300

    (refactor) Use classNames to apply classes conditionally (#1454)

[33mcommit e455f67e47e4d2b401daeec979d16ea7ff58bbc7[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Wed Nov 8 10:44:37 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1446)
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit 03a5d9661ba35a5d899bf249912dd4b9349588d8[m
Author: Emmanuel Nyachoke <achachiez@gmail.com>
Date:   Wed Nov 8 08:49:49 2023 +0300

    (chore) Bump @openmrs/openmrs-ngxformentry (#1456)

[33mcommit 2390fa930348db682d6cb6185c20b46b194fe7d8[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Tue Nov 7 11:02:10 2023 +0300

    O3-2551 Make hard-coded maximum duration of dispense in medications a… (#1455)
    
    * O3-2551 Make hard-coded maximum duration of dispense in medications app configurable
    
    * code review
    
    * Update packages/esm-patient-medications-app/src/config-schema.ts
    
    Co-authored-by: Pius Rubangakene <piruville@gmail.com>
    
    ---------
    
    Co-authored-by: Pius Rubangakene <piruville@gmail.com>

[33mcommit 31634d83171311cfdbaad2a24bfba835130aa88f[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Fri Nov 3 16:19:32 2023 -0400

    (fix) Lazy-load Angular locales (#1453)

[33mcommit 83bb74866de8ad585a7ef565574581d3a85ec74b[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Fri Nov 3 23:10:27 2023 +0300

    (feat) Highlight abnormal values in vitals and biometrics form (#1427)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit be800f5f36fb1cb74886294221fef070495f4a1b[m
Author: Kazooba B Lawrence <36139599+kazlaw@users.noreply.github.com>
Date:   Thu Nov 2 17:38:29 2023 +0300

    (feat)KH-372: Add Khmer translations (#1449)
    
    KH-372: Add Khmer translations
    
    Co-authored-by: lawrence <lawrence@mekomsolutions.com>

[33mcommit 1848171722b380df75b2f26b9b00c67c07ff7bc6[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Nov 2 10:23:47 2023 +0300

    (enhc) Improved program enrollment on form entry and updated form-entry props (#1438)
    
    (enc) Improved program enrollment on form entry and updated form-entry props

[33mcommit 69e5c171e7f3535493e19cbb372ff4d57113ee84[m
Author: Kazooba B Lawrence <36139599+kazlaw@users.noreply.github.com>
Date:   Thu Nov 2 00:29:34 2023 +0300

    (feat) KH-372: Add missing Khmer translations (#1448)
    
    Co-authored-by: lawrence <lawrence@mekomsolutions.com>

[33mcommit f821b6961c6e077013773e43f507d7ae92dfe299[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Wed Nov 1 00:32:19 2023 +0300

    (feat) O3-2534: Improve visit header layout on tablet (#1441)

[33mcommit 8f623b59addc4ba4152508b496c8e5eb7b12c95f[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Oct 31 15:36:53 2023 +0300

    (chore) Bump `@openmrs/openmrs-ngxformentry` (#1445)

[33mcommit 79ef809964a9e067106942298fbe2d417ace8235[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Tue Oct 31 13:29:23 2023 +0300

    (fix) Mutate visit banner after starting new visit (#1434)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 386fffaa1ad148f594f0694e24218d6d2eff1450[m
Author: Jacinta Gichuhi <jecihjoy@gmail.com>
Date:   Tue Oct 31 11:35:46 2023 +0300

    (fix:form-entry) update search location functionality (#1431)
    
    * (fix:form-entry) update search location functionality
    
    * Fix typo
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 9073dd3f74a01b705e77576ae29538f41235bdfb[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Oct 31 13:42:32 2023 +0530

    (chore) Add translation strings for the Attachments, Biometrics and Vitals apps (#1442)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 10bfbb3fa4b692ffddd5566decbbb1d6f9775e25[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Mon Oct 30 23:58:52 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1432)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 5d67818c650654a464055e5f490108a6bd0f12c8[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon Oct 30 21:37:02 2023 +0300

    (feat) O3-2531: Enhance form control sizing for improved UX in tablet mode (#1440)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 1c374855cb473b65b6479e557e895aee7c57ef6d[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Sun Oct 29 00:39:08 2023 +0530

    (BREAKING) Update i18next interpolation syntax (#1439)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 51883dd77bfd62754a40c80ed34354f586655d66[m
Author: elimm <elimm@users.noreply.github.com>
Date:   Fri Oct 27 01:03:14 2023 +0300

    (feat) O3-2528: Hebrew translations for openmrs-ngx-formentry (#1436)
    
    Co-authored-by: Andrey Y <andrey.yakubyshyn@med.me>
    Co-authored-by: Ian <52504170+ibacher@users.noreply.github.com>

[33mcommit f92059e546cf50570254dd5e7c77e3fae33de291[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Fri Oct 27 00:27:55 2023 +0530

    (feat) Update the translation for patient chart (#1433)

[33mcommit 93fcb73a2fcecc9e49851fd2019468782693ce54[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Wed Oct 25 14:29:36 2023 -0400

    (feat) Supporting O3-2510: Expose patient-common-lib on window (#1430)

[33mcommit 1d31abfc40bf897a8cc623372e7c86a6b0cb2839[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Mon Oct 23 14:20:50 2023 -0400

    (fix:forms-app) Don't fetch encounters if there is no patientUuid yet (#1428)

[33mcommit 3a82ecc09b9ff95e303c36f76004e2179126c8be[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Mon Oct 23 14:28:57 2023 +0100

    (chore) Improve forms list and enable patient-chat page while offline (#1422)

[33mcommit a61c8fb4258ccb820aaf7239475fb3d82445aab0[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Oct 23 11:39:26 2023 +0300

    (fix) Minimal UI tweaks to the Conditions form (#1426)

[33mcommit cac2e088eab757a156ed6b1aba531d564e709ad7[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Oct 21 12:50:16 2023 +0300

    (fix) Fix appearance of tabs in the vitals and biometrics chart views (#1424)
    
    Co-authored-by: Donald Kibet <chelashawdonald@yahoo.com>

[33mcommit b9dae5abb3fa93102df835459847a2b0116470aa[m
Author: McCarthy <121826239+mccarthyaaron@users.noreply.github.com>
Date:   Sat Oct 21 12:31:59 2023 +0300

    (fix) O3-2508: Remove sorting functionality in biometrics table (#1425)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 57feceec398f18dad1b1d1dd263bcf6cb729ac24[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Oct 21 00:28:25 2023 +0300

    (fix) Tweak appearance of flagged vital signs (#1423)

[33mcommit 508197fbde5077f143066cd559d6ea9149e63e87[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Fri Oct 20 18:32:36 2023 +0530

    (fix) O3-2485: Updated the config key for the visit location field in the start visit form (#1421)

[33mcommit 031507bf37baceb32fca48be396bd85457a6b48e[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Fri Oct 20 08:29:01 2023 +0530

    (feat) O3-2485: Allow view only field for visit location in the start visit form (#1403)
    
    Co-authored-by: Ian <52504170+ibacher@users.noreply.github.com>
    Co-authored-by: Brandon Istenes <bistenes@gmail.com>

[33mcommit ae4eb819fb9e95475c318e3f28bebefc804bf4f3[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Thu Oct 19 16:41:42 2023 -0400

    (feat) Add support for configurable form sections (#1406)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit d1332ba721286096a081ac670dab2eb6519b31a5[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Oct 19 21:51:02 2023 +0300

    (chore) Disable Angular CLI cache in `esm-form-entry-app` (#1419)

[33mcommit 2142adb748f3ed9c02c982f8bcca20602fbacaf8[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Thu Oct 19 14:42:01 2023 -0400

    (chore) Mark SWR as a peer dependency (#1420)

[33mcommit fe93512ebc925fcea7f6b0c644e30e3e9356a82c[m
Author: Kazooba B Lawrence <36139599+kazlaw@users.noreply.github.com>
Date:   Thu Oct 19 13:54:24 2023 +0300

    (feat) Add Khmer translations (#1418)
    
    Co-authored-by: lawrence <lawrence@mekomsolutions.com>
    Co-authored-by: Vineet Sharma <sharmava05@gmail.com>

[33mcommit e38a041f6461bfb0288f28f70ab43ad336a9f8b8[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Oct 19 12:44:37 2023 +0300

    (feat) Remove implementer-specific logic from Programs widget (#1389)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 5ba31871794987f170479e48e2c5d1bd22b4776d[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Thu Oct 19 05:13:36 2023 +0530

    (chore) Bump i18next, react-i18next and i18next-parser and support pluralization (#1413)
    
    * (feat) Bump i18next and related packages
    
    * Restored ar and es translations
    
    * Restored ar.json

[33mcommit e7cbedc6271b386269e705c56877fc738450f8b9[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Thu Oct 19 00:12:14 2023 +0530

    (feat) Add translations for generic widget and patient chart pagination (#1376)
    
    * Translations for generic widget and patient chart pagination
    
    * All in the encounters table needs to be translated
    
    * Updated translation files
    
    * Updated the translation files
    
    * Added km translation for date and time
    
    * Added km translation for pagination
    
    * Updated translations
    
    * Using pluralization for the translation
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 069ac7da9cb3cf7d50ca4a770883222e7f5ff8ff[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Oct 18 00:54:34 2023 +0530

    (fix) Increase timeout for conditions-overview test to fix builds (#1417)

[33mcommit 9100fdc918386e926ddf98ca2e8791bbf0b294ec[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Oct 17 09:21:45 2023 -0400

    (feat) O3-2423: Lab order flow should have test type search page (#1371)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit ee7b11ecc5ac709c74e3049a9a6b1f1759d9184e[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Tue Oct 17 11:33:37 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1416)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit b35ab06346a2485e39d4c485dbf75e7c4609c517[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Oct 16 17:21:30 2023 +0300

    (chore) Bump `esm-form-entry-app` to Angular v14 (#1414)
    
    * (chore) Bump `esm-form-entry-app` to Angular v14
    
    * Fix type annotations
    
    * Fix tests by adding window.matchMedia mock
    
    * More test fixes
    
    * Fix e2e tests
    
    * Try another fix
    
    * Fix overflow menu locator
    
    * Cleanup
    
    * Fixed failing test
    
    * Update @openmrs/ngx-formentry
    
    * Updated e2e
    
    ---------
    
    Co-authored-by: Vineet Sharma <sharmava05@gmail.com>

[33mcommit 3cf89431e46b619c42d68798e206343cb419c052[m
Author: Jayasanka Weerasinghe <33048395+jayasanka-sack@users.noreply.github.com>
Date:   Sat Oct 14 23:54:04 2023 -0700

    (chore) O3-2494: Add docker setup to run E2E on Bamboo (#1410)

[33mcommit 4bfb5a4e52103d4b6101f35a260c372734a562c9[m
Author: Michaël Bontyes <michaelbontyes@gmail.com>
Date:   Sat Oct 14 17:55:51 2023 -0400

    (feat) Add Arabic translations (#1407)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>
    Co-authored-by: Ian <52504170+ibacher@users.noreply.github.com>

[33mcommit ba1ae9a9025ab1818cbc425790384e3186cff6ef[m
Author: Jayasanka Weerasinghe <33048395+jayasanka-sack@users.noreply.github.com>
Date:   Thu Oct 12 12:15:10 2023 -0700

    (chore) O3-2405: Retrieve Logs in E2E gh action for Improved Issue Tracking (#1409)
    
    O3-2405: Retrieve Backend Logs in GitHub Actions for Improved Issue Tracking

[33mcommit bccfae878a665b15ac1b728e2db87b5cb5b421d8[m[33m ([m[1;33mtag: v5.1.0[m[33m)[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Sat Oct 7 12:25:57 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1404)
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit fcdcf70b74af7cdf075ecc421281651d800be29b[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Oct 6 22:56:02 2023 +0300

    (chore) Release v5.1.0 (#1395)

[33mcommit 5adff65dccd6bc046610d10a9feeb395e68b8951[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Fri Oct 6 15:30:37 2023 -0400

    (fix) Restore some deleted Spanish translations (#1401)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit db7a5673091338b4f77ee748bee0a01219da756b[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Fri Oct 6 16:59:06 2023 +0300

    (fix) Fix broken styles in visits widget (#1398)
    
    Co-authored-by: Ian <52504170+ibacher@users.noreply.github.com>

[33mcommit dfcb1e572cb4a046b9f2f10a1f695ae29d1d1bc3[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Oct 6 15:50:58 2023 +0300

    (feat) Update react-form-engine to use `o3` forms endpoint (#1386)

[33mcommit a4ad6dc12c8195769c3048e6698da8a117f36380[m
Author: Michaël Bontyes <michaelbontyes@gmail.com>
Date:   Fri Oct 6 08:47:04 2023 -0400

    (chore) Adding translations files in preparation for Arabic translations (#1400)

[33mcommit 03eb9c40733537292dc5bb058d4a7a3e23fd2bba[m
Author: Michaël Bontyes <michaelbontyes@gmail.com>
Date:   Thu Oct 5 16:12:33 2023 -0400

    (chore) Add support for Arabic translations (#1399)

[33mcommit c14145b56f81ebb5bc05db7ce0e8eb202b98b975[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Oct 5 21:31:06 2023 +0300

    (fix) Remove erroneously added divider

[33mcommit 84ac0d98fc9bf222cab42ede349ed6fd7ad10724[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Oct 5 15:15:48 2023 +0300

    (fix) Fix appearance of icon button dividers (#1397)
    
    * (fix) Fix appearance of icon button dividers
    
    * Fixup

[33mcommit a0403d8c0ba8ec1a8643e19349e799fc1861a05d[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Oct 5 00:42:34 2023 +0300

    (fix) Prevent undefined error by defaulting data to an empty array (#1396)

[33mcommit e3a1da66c03757c43aa41646005b5c24b1dfb803[m
Author: Kazooba B Lawrence <36139599+kazlaw@users.noreply.github.com>
Date:   Wed Oct 4 16:33:23 2023 +0300

    (chore) Add Khmer translations for 'esm-patient-chart-app' (#1394)
    
    Co-authored-by: lawrence <lawrence@mekomsolutions.com>

[33mcommit 46602a6a9f8d60be01a11d538226c095d433b589[m
Author: Kazooba B Lawrence <36139599+kazlaw@users.noreply.github.com>
Date:   Wed Oct 4 01:09:05 2023 +0300

    KH-356: Correct the Khmer translation for `Actions` (#1392)
    
    Co-authored-by: lawrence <lawrence@mekomsolutions.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 0a2f0fc9ddccf1f406f535630df2f76b1fa9e9c7[m
Author: Kazooba B Lawrence <36139599+kazlaw@users.noreply.github.com>
Date:   Wed Oct 4 00:54:35 2023 +0300

    KH-372: Add Khmer translations for esm-patient-forms-app (#1391)
    
    Co-authored-by: lawrence <lawrence@mekomsolutions.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit e9629b6f01309c4305217adda627fbd61cdd5599[m
Author: Kazooba B Lawrence <36139599+kazlaw@users.noreply.github.com>
Date:   Wed Oct 4 00:43:21 2023 +0300

    KH-372: Add Khmer translations for esm-patient-banner-app (#1393)
    
    Co-authored-by: lawrence <lawrence@mekomsolutions.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit dbea874ff42a8feff5e07415c40d6fc82949bd61[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Oct 3 15:32:41 2023 -0400

    O3-1678 Order basket medication search results should have two-button layout (#1366)

[33mcommit c2ad2aea454199a89de0f1319c296f3126e2872b[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Oct 3 09:07:29 2023 +0300

    (enhc) update UI shell component to fix styling issue on workspace (#1387)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 62dfb57e1fe9f94d88528cc5e895dc50a3ad8095[m
Author: Kazooba B Lawrence <36139599+kazlaw@users.noreply.github.com>
Date:   Tue Oct 3 00:07:23 2023 +0300

    KH-372: Add Khmer translations for esm-form-entry-app (#1384)
    
    Co-authored-by: lawrence <lawrence@mekomsolutions.com>

[33mcommit b7f7d77b5e4e2dd1f5cba6f3c6abf916dc03b7de[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Oct 2 23:57:31 2023 +0300

    (chore) Bump angular form engine (#1388)

[33mcommit fe98fdacc4996801f71e054173d4f8f3e5dd8dfd[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Mon Oct 2 22:40:27 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1385)
    
    Co-authored-by: GitHub Actions <github-actions@github.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 91dba45d7efb5ec0a3fd1844361cf27076158d79[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Mon Oct 2 15:17:06 2023 +0100

    (chore) Add Spanish translations (#1382)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 4a90db02d5baf93cc99cf50ec6fd819f8e78f675[m
Author: Njidda Salifu <njiddasalifu@gmail.com>
Date:   Thu Sep 28 21:24:11 2023 +0100

    (feat) O3-2437: Restore a left border to the workspace (#1379)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 3f8a1aa62ea398e5ea3f0185a543243c5e809278[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Sep 28 21:45:54 2023 +0300

    (chore) Remove `useWorkspaces` property from lerna config (#1383)

[33mcommit c42d21ca3c420fe69d0a83554484fe4e72e635d0[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Sep 28 17:52:36 2023 +0300

    (chore) Bump dependencies and update lint tooling (#1374)

[33mcommit 28ecc5132126382806b703a2bddc5bf5e105fc07[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Thu Sep 28 12:16:50 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1381)
    
    Co-authored-by: GitHub Actions <github-actions@github.com>
    Co-authored-by: ebambo <ebambo@users.noreply.github.com>

[33mcommit c7055972bb385d977fa9c05168796f6a7a92af1f[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Sep 28 01:28:49 2023 +0300

    (fix) Fix various icon buttons (#1378)

[33mcommit 27c4284d32ce8497d5f71d5a60845af2a6b0780c[m
Author: Lumu chris <59338693+lumuchris256@users.noreply.github.com>
Date:   Wed Sep 27 15:33:18 2023 +0300

    (test)O3-2402: Fix test for Vitals and biometrics form after new migration to RHF (#1367)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 5177178fa3af5960b9f97a02437f7a989ee548b5[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Sep 27 08:49:30 2023 +0300

    (feat) Add current visit summary component (#1368)
    
    * (feat) Add current visit summary component
    
    * Finish work on current-visit-widget

[33mcommit 867b277d403d1266cdd980cc37d9c8c883cbf9ad[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Tue Sep 26 18:04:15 2023 +0300

    (fix)O3-2438: should not be visible until it is known whether there is an ongoing visit (#1375)
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>

[33mcommit c83e7df1eb02a4d287a71c6bebc9d2aae5f9b0f6[m
Author: Mark Goodrich <mgoodrich@pih.org>
Date:   Tue Sep 26 08:42:45 2023 -0400

    (fix) O3-2442: Patient Actions Slot should be hidden if there are no actions (#1372)

[33mcommit 33a9902992570744a8f824ca087fa5e169ce687f[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Sep 26 11:30:54 2023 +0300

    (fix) Add missing prop to `launchPatientWorkspace` for programs (#1373)

[33mcommit 2021687a07584385180f8c835d8eca221bb3be03[m
Author: Ayush <54752747+ayush-AI@users.noreply.github.com>
Date:   Tue Sep 26 02:25:56 2023 +0530

    (fix) O3-2048: Fix wheel scroll issue in vitals and biometrics form inputs (#1115)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 9d16caae7642bb0908c138c9e5ac43930899b234[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon Sep 25 17:54:59 2023 +0300

    (feat): Remove RXJS for launching form-entry (#1319)

[33mcommit a3e8c8c9f539ee9d1fa2bb8360626da99638173d[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Mon Sep 25 14:00:44 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1370)
    
    Co-authored-by: GitHub Actions <github-actions@github.com>
    Co-authored-by: kajambiya <kajambiya@users.noreply.github.com>

[33mcommit a6d60b5ce73e9d6570518432110fec6b178fefb3[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Mon Sep 25 01:08:13 2023 -0400

    (fix) Run prettier (#1369)
    
    Run prettier

[33mcommit 3a10f62a4c7380888e3abd67ec325e2118546ffb[m
Author: Jexsie <jessiessebuliba@gmail.com>
Date:   Mon Sep 25 05:55:47 2023 +0300

    (feat) Add side-nav scrolling in the patient chart on tablet  (#1230)

[33mcommit 40f48a7d05e422862726cc8b9a400e04c09d6490[m
Author: Ayush <54752747+ayush-AI@users.noreply.github.com>
Date:   Mon Sep 25 04:11:54 2023 +0530

    (test)O3-2401: Fix test for visit-form.component.tsx after new migration to RHF (#1355)
    
    * Fixed the test for visit-form.component.tsx
    
    * added new cases for visitAttribute fields

[33mcommit 11339fa176783921671e5f49cd19387a156aee0a[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Sun Sep 24 23:44:53 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1358)
    
    Co-authored-by: GitHub Actions <github-actions@github.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit e351001d6f5db09625fabac6f94dc94e84535313[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Thu Sep 21 00:00:40 2023 +0530

    (feat) Launching workspaces should prompt user for unsaved forms, especially for workspaces that cannot be collapsed or workspaces with same type (#1364)

[33mcommit b4faa8503ac2cd1a0b64a0f46f2dd72ce4796339[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Sep 19 21:49:36 2023 +0530

    (fix) Hiding the workspace re-opens the workspace window. (#1357)
    
    Hidden workspace should be shown when calling launchingPatientWorkspace

[33mcommit 3a18324408192331e36e171c3711618600a866fb[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Tue Sep 19 19:16:12 2023 +0300

    (fix) O3-2324: Order Basket should look right on tablet (#1359)
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>
    Co-authored-by: Anjula Shanaka <anjulashanaka@gmail.com>
    Co-authored-by: Brandon Istenes <bistenes@gmail.com>

[33mcommit c42a129a1c30b269c2fb7a0fe4cfd75191ee8ba3[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Tue Sep 19 16:37:50 2023 +0100

    (feat) Form app: add translations for form-engine strings (#1066)

[33mcommit 3599b4e953e03251442c3d6daa708ecafbb2bbbd[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Sep 19 10:41:00 2023 -0400

    BREAKING: O3-2424: Rename test-results-app to be labs-app (#1360)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 829f8bcb0474fa95a6d396e9737560ce268ad4c3[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Tue Sep 19 13:51:43 2023 +0300

    (Fix) Drug orders 'Immediately add to basket' button  closes the workspace window completely when clicked (#1363)
    
    Fix issue: Drug orders 'Immediately add to basket' button should not close workspace window

[33mcommit b92ed125e6e1bf94c1f706553b78c1b2aa26f765[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Mon Sep 18 06:42:04 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1356)
    
    * (chore) bump-form-engine
    
    * (chore) Bump `@openmrs/openmrs-form-engine-lib`
    
    ---------
    
    Co-authored-by: GitHub Actions <github-actions@github.com>
    Co-authored-by: denniskigen <denniskigen@users.noreply.github.com>

[33mcommit 4dee0ce3287ea7a0b6ccb10d1224ff0a448f6ef4[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Sep 13 09:40:40 2023 +0300

    (enhc) Remove un-used forms code and updated forms config. (#1354)
    
    * (enhc) Remove un-used forms code and updated forms config
    
    * code review changes

[33mcommit ef0ee75c3d28c4dbe57d84a2e1323726a9ed7b44[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Sep 12 21:49:56 2023 +0530

    (fix) O3-2363: Workspace window state should be part of global workspace state (#1339)

[33mcommit 2878fbbf15153f733f090d748e6c027881df4847[m
Author: elimm <elimm@users.noreply.github.com>
Date:   Mon Sep 11 16:30:28 2023 +0300

    (feat) O3-2391: Ability to hide observations in encounters via config… (#1353)
    
    Co-authored-by: Andrey Y <andrey.yakubyshyn@med.me>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 60a3232ad732b88f5d249d8266a111dccfc132b2[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Sep 9 12:17:33 2023 +0300

    (fix) Fix the dose input combobox width in the drug order form (#1351)

[33mcommit 071b9bb4362e84c960d8ea02e1d78841287eb173[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Sat Sep 9 01:27:45 2023 +0530

    (fix) Visit type is not getting translated in `All Encounters` table (#1352)
    
    Encounters table should show visitType display instead of name

[33mcommit 5666a74d5d0a0a35e6b67e60558ccfd8fe386eb5[m
Author: Jexsie <jessiessebuliba@gmail.com>
Date:   Fri Sep 8 17:45:54 2023 +0300

    (fix) Disable content wrapping in the Vitals table when the workspace is open (#1317)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit c3cf59dbe5110d702de03a3e836d6c523dbc3620[m
Author: Lumu chris <59338693+lumuchris256@users.noreply.github.com>
Date:   Fri Sep 8 17:13:08 2023 +0300

    (feat) Migrating allergy form to RHF and Zod (#1308)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 5a5ad23b9e33918cde707eaebebdd2eb9526839f[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Fri Sep 8 19:20:42 2023 +0530

    (feat) Use patient-chart-app namespace for patient-common-lib translations (#1344)

[33mcommit 94b154587335492eea7ebd5b8496f371e025cf52[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Thu Sep 7 21:04:50 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1318)
    
    Co-authored-by: GitHub Actions <github-actions@github.com>
    Co-authored-by: pirupius <pirupius@users.noreply.github.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 59b5c10e42b1d1d2618a3d50d36acc03f967e39c[m
Author: Jexsie <jessiessebuliba@gmail.com>
Date:   Thu Sep 7 21:11:41 2023 +0300

    (fix) O3-2359: Remove "Care setting" configuration property from medications and lab orders (#1343)
    
    Co-authored-by: Vineet Sharma <sharmava05@gmail.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 9c00cb1fae366b3439f956f22286ddda97691883[m
Author: Jayasanka Weerasinghe <33048395+jayasanka-sack@users.noreply.github.com>
Date:   Thu Sep 7 23:19:02 2023 +0530

    (chore) Update E2E GitHub Action Job Name for Improved Clarity (#1345)
    
    This update changes the job name of the E2E GitHub action to a more meaningful and recognizable name. This will help us easily identify the action in GitHub settings, such as in the branch protection rules page. The change will improve our workflow and make it easier for team members to navigate and manage our GitHub actions.

[33mcommit cac0034c4d74b07e22692284e79e0be67612fece[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Sep 7 17:51:37 2023 +0300

    (fix) Redirect users back to previous page (#1341)
    
    Co-authored-by: Ian <52504170+ibacher@users.noreply.github.com>

[33mcommit 153af8692a8c8eaf6fde66e3b59b819f49e854ec[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Thu Sep 7 19:27:11 2023 +0530

    (fix) Fix failing to save required visit attributes in the start visit form (#1346)
    
    * Visit attribute fields now part of the form state
    
    * Cleanup and fix select an option value
    
    * Updated translations
    
    * Required state is handled by zod
    
    * Review changes and visit attribute fields should show correct error messages
    
    * Updated translations
    
    * Fixed the onChange for datepicker
    
    * Removed comment
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 80f8b57e0c78639f21ee7aa37404d6a283f29ab4[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Sep 7 15:35:26 2023 +0300

    (feat) Remove redundant translation configuration settings (#1331)
    
    (enhc) Remove redundant translation configuration settings
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 0e1be74533f67cc4512475827eb1454abd5a3629[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Thu Sep 7 14:12:25 2023 +0530

    (chore) Bump Angular form engine version (#1348)

[33mcommit 3f79660de5f0191b451acc5a06d8086ee6bc3155[m
Author: Lumu chris <59338693+lumuchris256@users.noreply.github.com>
Date:   Tue Sep 5 20:55:41 2023 +0300

    (feat) Migrating start visit form to use RHF and Zod (#1278)
    
    * migrating start visit form
    
    * rework on tests
    
    * tweaks to tests
    
    * emptycommit
    
    * Empty commit
    
    * Empty commit
    
    * Empty commit

[33mcommit fa663e0fa237d99dfbab5644cd9ed61fbd73a74e[m
Author: Dilshan Naveen <dilshannaveen20@hotmail.com>
Date:   Tue Sep 5 22:39:16 2023 +0530

    (chore) O3-2395: Enable Traces on E2E Tests (#1342)
    
    O3-2395: Updated the playwright config

[33mcommit 4201b4aa390ead099b09aaebbc0d891b1fa0c112[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Aug 30 23:55:49 2023 +0530

    (feat) Improved implementation for the siderail nav buttons (#1334)
    
    * Created a common component for siderail nav buttons
    
    * Fixed the styling for the tag
    
    * Review changes

[33mcommit bcac20043ee4e1033ffc4a7d4cbed0c88a933f6f[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Aug 30 23:24:39 2023 +0530

    (fix) O3-2362: Opening a form from forms-dashboard shows a confirmation modal (#1338)

[33mcommit 64153eea2d692f0bb2e1db5a8cc3327a342be9bf[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Aug 30 21:59:13 2023 +0530

    (fix) O3-1676 & O3-1677: Allowing individual workspace to either `hide`, `maximize` and have a `wide/narrow` width (#1333)
    
    * Allowing individual workspace to either hide/maximize and choose width
    
    * Translation updated
    
    * Fixed the iconDescription for close button

[33mcommit b9663818d2a786b7fa95e01daf3ed4af126630f7[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Aug 30 11:46:48 2023 +0300

    (fix) Updated the search mechanism for form-list to return correct results (#1337)

[33mcommit 189428408b3e0fdb29c69c48c7c8810a06f03bc8[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Tue Aug 29 16:20:36 2023 -0400

    (chore) Update @openmrs/ngx-formentry to latest version (#1336)

[33mcommit a1b49dd6bd530a4e94b7af65e87cbd8cb9030d92[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Aug 29 21:55:52 2023 +0530

    (fix) Fixed the workspace type for siderail nav buttons (#1335)

[33mcommit 58e5f4fc092a54d8098182d1a589552059c3ad15[m
Author: Lumu chris <59338693+lumuchris256@users.noreply.github.com>
Date:   Tue Aug 29 14:45:18 2023 +0300

    (feat) Migrating Vitals and Biometrics form to RHF and Zod (#1310)
    
    * migrating forms
    
    * fix to imports
    
    * Empty commit message
    
    * rework on single unit validation
    
    * Empty commit
    
    ---------
    
    Co-authored-by: Jayasanka Weerasinghe <33048395+jayasanka-sack@users.noreply.github.com>

[33mcommit 8d683c4112d2fdbfc164c8a338e571b0c7d81e1d[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Mon Aug 28 16:10:21 2023 -0700

    (feat) O3-2325 Implement Lab Order form (#1328)

[33mcommit c2ce7f6d2cb97c4b01aa02a6f297a6e030e8ff5a[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Mon Aug 28 17:02:53 2023 +0300

    (feat) O3-2196: Implement the print functionality for Test results (#1306)
    
    Co-authored-by: Brandon Istenes <bistenes@gmail.com>

[33mcommit 9610578e0701c82d4556b016d6a993ba12e5d251[m
Author: Lumu chris <59338693+lumuchris256@users.noreply.github.com>
Date:   Mon Aug 28 16:41:11 2023 +0300

    (feat) Fix Medications order form after RHF and Zod Migration (#1332)
    
    Co-authored-by: Jayasanka Weerasinghe <33048395+jayasanka-sack@users.noreply.github.com>

[33mcommit 5a355ae405592b6ac4c51856d226b6a840c9ac87[m
Author: icrc-loliveira <68058940+icrc-loliveira@users.noreply.github.com>
Date:   Mon Aug 28 05:54:23 2023 +0100

    (chore) Upgrade Angular form engine library (#1326)
    
    Co-authored-by: Luis Oliveira <luis.oliveira@icrc.org>

[33mcommit 87fb8a132ce7167e14603fc6445b9af45a9ce4d6[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Mon Aug 28 01:09:51 2023 +0300

    (feat) O3-2195: Implement the print functionality for medications (#1312)
    
    * Fix conflicts
    
    * Fix tests
    
    * Modify header

[33mcommit b68d93e517b57ae7a88bc6013e3f2e846eea831c[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Thu Aug 24 15:19:59 2023 +0530

    (fix) O3-1676 & O3-1677: Workspace implementation improved as per design (#1325)
    
    * Fixed the workspace width to 520px as per designsa
    
    * Added workspace variants and similar action buttons on the workspace header

[33mcommit 6dc38c443a63ec0d139e2ac8fbd096aa56cc3308[m
Author: Lumu chris <59338693+lumuchris256@users.noreply.github.com>
Date:   Thu Aug 24 11:24:38 2023 +0300

    (feat) Migrating Medications order form to use RHF and Zod (#1309)
    
    * migrating
    
    * duration refactor
    
    * duration workaround
    
    * scss fix
    
    * fix
    
    * migrating
    
    * duration refactor
    
    * duration workaround
    
    * scss fix
    
    * fix
    
    ---------
    
    Co-authored-by: Jayasanka Weerasinghe <33048395+jayasanka-sack@users.noreply.github.com>

[33mcommit 7b124687b1da798be69a5d3de9275b34dd7d03e3[m
Author: icrc-loliveira <68058940+icrc-loliveira@users.noreply.github.com>
Date:   Wed Aug 23 14:24:44 2023 +0100

    (feat) Automatically load Angular locale data (#1320)

[33mcommit e8be63d8ded708245871571e082957cf14086939[m
Author: Randila Premarathne <106733522+RandilaP@users.noreply.github.com>
Date:   Tue Aug 22 19:36:48 2023 +0530

    (test) O3-2344: Change table locators (#1323)
    
    * Change table locators
    
    * Change table locators
    
    * Adjust locators
    
    * Adjust changes
    
    ---------
    
    Co-authored-by: Anjula Shanaka <anjulashanaka@gmail.com>

[33mcommit cfadd1017f795c65c3a5311099344eec59c2cbf5[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Aug 21 20:20:27 2023 +0300

    (docs) Add instructions for running specific tests using turbo (#1321)

[33mcommit 7242935b6a26a418265a4182fb5cdae4f7d7cf00[m
Author: NYESIGA <110772072+NYESIGA@users.noreply.github.com>
Date:   Mon Aug 21 18:07:59 2023 +0300

    (fix) O3-2158: Clear order basket search input and trap focus when search gets reset. (#1322)
    
    * (fix) 03-2158:clear order basket search input and trap focus when search gets reset
    
    * (fix) 03-2158:clear order basket search input and trap focus when search get reset
    
    * Update drug-search.component.tsx
    
    * Update drug-search.component.tsx
    
    * Update order-basket-search-results.component.tsx
    
    * Update drug-search.resource.tsx
    
    * Update order-basket-search-results.component.tsx
    
    ---------
    
    Co-authored-by: Vineet Sharma <sharmava05@gmail.com>

[33mcommit 02e38dbf3a6060e3ed795735b35917e0184b8970[m
Author: Randila Premarathne <106733522+RandilaP@users.noreply.github.com>
Date:   Sat Aug 19 22:45:39 2023 +0530

    (test) O3:2110 Add conditions e2e test (#1292)
    
    * Add conditions e2e test
    
    * Adjust required changes
    
    * Adjust requested changes
    
    * Adjust changes
    
    * Adjust changes

[33mcommit 35755f368edc304be52ca4d63ab486278751ba73[m
Author: Pius Rubangakene <piruville@gmail.com>
Date:   Fri Aug 18 14:20:08 2023 +0300

    (Fix) full width patient chart widgets meta (#1311)
    
    * (fix) add meta to enable full width widgets on patient chart
    
    * tweaks to accommmocate default dashboard
    
    * renames variables
    
    * refactors boolean to type
    
    * fixes
    
    * pr changes

[33mcommit 64389b3528fc8d988d47a9592b27cc52043d2199[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Wed Aug 16 14:08:18 2023 -0400

    (feature) O3-1825  Order Basket should have new v2 layout to support additional order types (#1316)

[33mcommit a53d3b6da84b8790d739b91e6e63a4ebd865e2cb[m
Author: Piumal Rathnayake <piumal1999@gmail.com>
Date:   Wed Aug 16 18:37:35 2023 +0530

    O3-2315: Utilize pre-filled docker images in esm-patient-chart (#1305)
    
    * O3-2315: Utilize pre-filled docker images in esm-patient-chart
    
    * Combine onPush and onPr jobs into a single job
    
    * Optimize with dependency caching
    
    * Apply suggestions from code review
    
    ---------
    
    Co-authored-by: Jayasanka Weerasinghe <33048395+jayasanka-sack@users.noreply.github.com>

[33mcommit 06abe2639092948e921c6cd32fefd762f22177f3[m
Author: Randila Premarathne <106733522+RandilaP@users.noreply.github.com>
Date:   Wed Aug 16 18:35:32 2023 +0530

    (test)O3-2111: Add patient chart add program e2e test (#1251)
    
    * Add patient chart add program e2e test
    
    * Add data test id to table
    
    * Modify the current test
    
    * Adjust required changes
    
    * Add data test id
    
    * Adjust some changes
    
    * Resolve conflict

[33mcommit 705aa0fe9e8e4a13b68bff128159e00ede6b76bc[m
Author: Samuel Male <samuelsmalek@gmail.com>
Date:   Tue Aug 15 21:45:23 2023 +0300

    Resolve template literals in the src prop of the logo config (#1315)

[33mcommit 06696d7bb70d8c2a8a5aaf2adebd9ca913e0b94f[m
Author: Randila Premarathne <106733522+RandilaP@users.noreply.github.com>
Date:   Tue Aug 15 12:15:21 2023 +0530

    (test) O3-2107: Add patient chart allergies E2E test (#1205)
    
    * Add patient allergies e2e test
    
    * Adjust requested changes
    
    * Made sepereate spec files
    
    * Change the node version
    
    * Restructure the e2e tests
    
    * Add changes to patientAllergiesPage
    
    * Add a locator to table row
    
    * Add data test id to table
    
    * Add data test ids
    
    * Adjust new requirements
    
    * Adjust some changes
    
    * Do the requested changes
    
    * Adjust required changes
    
    ---------
    
    Co-authored-by: Anjula Shanaka <anjulashanaka@gmail.com>

[33mcommit 9303ba85db1788c499a13e78e92c9948091802f5[m
Author: Randila Premarathne <106733522+RandilaP@users.noreply.github.com>
Date:   Tue Aug 15 10:31:00 2023 +0530

    (test) O3-2109: Add Vitals and biometrics E2E test (#1238)
    
    * Add Vitals and biometrics page
    
    * Add a vitals e2e test
    
    * Add a biometrics e2e test
    
    * Remove end visit
    
    * Add visit api
    
    * Add visit operations
    
    * Add datat test ids and apis
    
    * Change the locators
    
    * Add EOL
    
    * Adjust required changes
    
    * Add modified files
    
    * Adjust visit api
    
    * Add some small changes
    
    * Adjust some changes
    
    * Adjust api
    
    * Adjust some changes
    
    * Resolve cell locator

[33mcommit 8b8ffcf3bc8162c78cf67b424de625e4bf8f7759[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Mon Aug 14 21:07:40 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1313)
    
    Co-authored-by: GitHub Actions <github-actions@github.com>
    Co-authored-by: samuelmale <samuelmale@users.noreply.github.com>

[33mcommit 4c81a254bff5c9f94251ef72e11d2469499bd5c5[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Sun Aug 13 21:38:06 2023 +0300

    (fix) O3-2161: Encounter view doesn't work with multiple pages (#1247)
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 3dba0cf1de5294632c59cb5459fbdda7b9c05a09[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Thu Aug 10 12:46:35 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1264)
    
    Co-authored-by: GitHub Actions <github-actions@github.com>
    Co-authored-by: pirupius <pirupius@users.noreply.github.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit eaabdc76f3babb94a337b806b1e4977ad74d9ebf[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Wed Aug 9 10:02:03 2023 -0400

    (fix) Medications refactor (#1307)

[33mcommit 07069195b15e6acfb95f8ba12db5483405809709[m
Author: Piumal Rathnayake <piumalrathnayake@hotmail.com>
Date:   Mon Aug 7 23:23:54 2023 +0530

    O3-2311: Resolve resource limitation issues in e2e tests (#1304)

[33mcommit e98ad5d1704316aad953595e80794a04af6b8afb[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Fri Aug 4 15:45:37 2023 -0400

    (fix) O3-2305 + O3-521 Various minor medication order bugs (#1302)
    
    * Fix strange 'already' copy
    
    * Fix confusing 'Orders page' copy
    
    * Add button in Active Medications within Order Basket does nothing; Discontinued meds should not have DIscontinue option
    
    * Can't discontinue medication with free text dosage
    
    * Submitting medication order form should cause medication display widgets to reload
    
    * Order confirmation should make sense based on what the user did with medications
    
    * Delete unused code and annotate some code that should probably be brought back into commission
    
    * Remove 'modify' option from past medications

[33mcommit 04d84d064ed10428375130e38dcb8031c7b2f4e7[m
Author: Lumu chris <59338693+lumuchris256@users.noreply.github.com>
Date:   Fri Aug 4 18:34:49 2023 +0300

    (feat) Migrating programs form to use RHF and Zod (#1250)
    
    * programs forms migration
    
    * resolved reviews

[33mcommit da9703761a74bf6c3bc6661fa7bc65ff78c970fc[m
Author: Lumu chris <59338693+lumuchris256@users.noreply.github.com>
Date:   Fri Aug 4 18:34:18 2023 +0300

     (feat) Migrating  appointments form to RHF and Zod  (#1295)
    
    * appointmentsform
    
    * mergefixes

[33mcommit 5f999a00aaeef0d6a18ce3f6a9627dfc75694e0c[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Fri Aug 4 13:22:47 2023 +0530

    (fix) Setting the correct Form UUID in the encounter payload when saving a form (#1303)
    
    * Passing the correct form UUID passed as a state
    
    * Updated translations

[33mcommit 9ac7a0beaa082d7298567b5cf14f4e5ba1a88d34[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Wed Aug 2 09:57:41 2023 -0400

    O3-2242: 'Retrospective Entry' label on Chart Header when doing RDE (#1298)

[33mcommit 10dbbdc8096abb81d68fb8b601fc467aa39dc740[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Aug 2 02:59:50 2023 -0400

    (feat) Form entry app to use new API endpoint (#1300)
    
    * (feat) Form entry app to use new API endpoint
    
    * Update backend module name

[33mcommit 3ab2610d0742cbd890356fcee6ac2c4c203e76d5[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Tue Aug 1 02:51:23 2023 -0400

    (chore) Remove forms and notes (#1294)

[33mcommit 894ccb31f9bea877ea7fe8555cf3c8c70597366c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jul 31 17:38:59 2023 +0300

    (fix) Restore configurable logo to print preview (#1299)

[33mcommit 1f8854d07e6d4562c0d18ec0a79a16c0d4e2db89[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jul 26 21:32:33 2023 +0300

    (feat) Put `Patient Flags` feature behind a feature toggle (#1283)

[33mcommit 5996ba3cbab84c4d8e5cfbedb9621c4f3e6104cc[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Wed Jul 26 13:35:44 2023 +0300

    (fix) Fix broken styles in form view component search (#1296)

[33mcommit ffeb9e96bb39d861311d0ee55762f4e8f87e78b3[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Tue Jul 25 13:33:52 2023 +0300

    (feat) Implement the print functionality for Vitals lists (#1196)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit e8d674d0ed14eec1444ab1f0bae083d387a62489[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jul 24 22:03:15 2023 +0300

    (fix) Fix test script indentation (#1293)

[33mcommit 35a1decc9e03095ce9724a9910e19dcf46159e24[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jul 24 21:47:15 2023 +0300

    (refactor) Refactor test setup to leverage caching by `turbo` (#1289)

[33mcommit 483b93d0a837383b0ba81aa1ab8cf69b8449396e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jul 24 21:08:25 2023 +0300

    (fix) Fix the appearance of the start date column in the medications table (#1291)

[33mcommit b170f029c9bceaeebdab99ad6a44743572cd082c[m
Author: Pius Rubangakene <piruville@gmail.com>
Date:   Mon Jul 24 17:55:11 2023 +0300

    (fix) resolves valid route with grouped chart dashboards (#1287)
    
    * (fix) resolves valid route with grouped chart dashboards
    
    * clean up

[33mcommit 57a6db1b22fc7b9f28c3d5b5200cce6fcbdc4d7c[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Mon Jul 24 07:17:18 2023 -0400

    (feat) Add an extension slot for additional visit summary items (#1286)

[33mcommit cc3ca2cb88835a75866eaa08f3fc75e880bce94a[m
Author: Jexsie <jessiessebuliba@gmail.com>
Date:   Fri Jul 21 17:18:05 2023 +0300

    (fix) Fix improper stacking for recurring appointment inputs on tablet (#1284)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 15d3276a9977fff1b416a2399cc9418105b3fe70[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Jul 20 16:30:46 2023 +0300

    (fix) O3-2282: Show phone number in contact details panel (#1285)

[33mcommit 5f917b7d3da6f8be2c18c9b6b6162731eaa042d5[m[33m ([m[1;33mtag: v5.0.0[m[33m)[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jul 19 00:07:16 2023 +0300

    (chore) Release `v5.0.0` (#1279)

[33mcommit a11996b65cc5d18d48885d8a02082bfbdc1c50a7[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Jul 18 16:03:50 2023 -0400

    (feat) O3-2258: Put RDE behind a feature flag (#1282)

[33mcommit 5d2baf9f1ff021ff85ad5a9468237f4a794e3d45[m
Author: Daud Kakumirizi <dkakumirizii@gmail.com>
Date:   Mon Jul 17 12:07:02 2023 +0300

    KH-241: Add missing  translations on patient chart (#1281)
    
    KH-241: Add missing translations for patient chart

[33mcommit 0af103a2d675fa147484307adf2cc2ccaf72601d[m
Author: Daud Kakumirizi <dkakumirizii@gmail.com>
Date:   Mon Jul 17 09:52:25 2023 +0300

    KH-241: Add missing translations on patient chart (#1280)

[33mcommit bb5c6642a0c43f5d37ef28c265852aeebbe69a41[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Jul 13 19:51:21 2023 +0300

    (chore) Remove unused scripts from flags app (#1276)

[33mcommit 7dfe83f584f9469bdc279b5ad5ed09a4c35c1fbd[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Jul 13 12:53:46 2023 +0300

    (refactor) Extract patient flags into a frontend module (#1275)

[33mcommit d38cd9604f1037fc8234f10e82f07e2e88938de9[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Wed Jul 12 13:46:44 2023 -0700

    (fix) O3-1895 Edit Past Visit button does not work (#1269)
    
    * O3-1895 Edit Past Visit button does not work
    
    * Rename
    
    * Upgrade core
    
    * Update translations
    
    * Upgrade core
    
    * Translations
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 709d4677ec18cb094552d651cfb36c32b9918758[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jul 12 22:21:48 2023 +0300

    (chore) Append `TIMING=1` flag to lint checks (#1274)

[33mcommit a5da05a6054074fae7274db47c899f5368c3a6c1[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Jul 12 00:34:32 2023 +0530

    (chore): Updated all the translations in the monorepo (#1273)

[33mcommit 53eb751024a8de8e7b0609149ef8ce68118ad3af[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jul 11 09:45:34 2023 +0300

    (fix) Commit some orphaned translation keys and strings (#1270)

[33mcommit 0c2d2a8f687e4054d027df252faf95cec445cbd7[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon Jul 10 21:27:36 2023 +0300

    (fix) add `form-widget-slot` to `routes.json` to enable openmrs-react  forms to launch (#1268)
    
    * (fix) add `form-widget-slot` to `routes.json` to enable openmrs-react forms to launch
    
    * Fix typo
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 226aac0f524aa3274482b5b8250c7a162ecf685e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jul 10 21:02:50 2023 +0300

    (chore) Cache artefacts from lint checks more reliably (#1271)

[33mcommit e4545f262da4250c9562e0783b289c12b6393218[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Mon Jul 10 13:50:05 2023 -0400

    (fix) single-spa should be marked as MF shared (#1272)

[33mcommit 292b9d508e1e86229ac5df6b44c2d988e58d4d9a[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Mon Jul 10 22:46:04 2023 +0530

    (feat) Dashboard Extension uses the `moduleName` as the namespace for translation (#1227)
    
    Passed moduleName in the DashboardExtension

[33mcommit 9ab646c888414b770dedbb2354c4d1ccba694393[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon Jul 10 16:50:50 2023 +0300

    (refactor): Remove startVisitLabel and endVisitLabel translation configurations (#1266)

[33mcommit 6bb2a58fd5d9daa791cc42d170be43b777764a93[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Fri Jul 7 22:03:09 2023 +0300

    (fix) Debounce order basket search by 300ms (#1256)
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>

[33mcommit 892e50ac179ebf48d885edbf3b7da44a362e37ff[m
Author: AlexanderMizgirev <68945262+AlexanderMizgirev@users.noreply.github.com>
Date:   Fri Jul 7 18:37:07 2023 +0300

    (fix) O3-2239: Clean styles (#1265)

[33mcommit f27502a230bde75d846f50982e845af532a19315[m
Author: Daud Kakumirizi <dkakumirizii@gmail.com>
Date:   Fri Jul 7 09:38:44 2023 +0300

    KH-241: Add Khmer translations for patient chart (#1263)

[33mcommit ad7c34e416baaf431c770324b383553afa78352c[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Jul 7 09:03:48 2023 +0300

    (feat) KHP3-3811 Add validation logic to check if an identifier has already been assigned (#1262)

[33mcommit 449ea8f57977dcadf5d5f19a79cfdf67c9b1d9c8[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Jul 6 22:01:12 2023 +0300

    (fix) fix `usePatientListsForPatient` to return empty array (#1261)

[33mcommit a13f84e329d547b7b49c3930cd03b1d379290995[m
Author: AlexanderMizgirev <68945262+AlexanderMizgirev@users.noreply.github.com>
Date:   Thu Jul 6 19:21:23 2023 +0300

    (feat) O3-2239: Add an extension slot to the visit component (#1260)

[33mcommit 6c03910a484ae8e991885dfeb56fbc4a8665f621[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Jul 5 18:59:44 2023 +0300

    (feat) KHP3-3791: Add ability to create an identifier once a form is submitted (#1259)

[33mcommit ee577c0dac4495160391a8b2e9311c5fdd93ce83[m
Author: Daud Kakumirizi <dkakumirizii@gmail.com>
Date:   Wed Jul 5 14:27:57 2023 +0300

    KH-240: Add correct translation for the term allEncounters (#1258)

[33mcommit 13d53c6f299f18d3e8289267b3767181ea9ea8bb[m
Author: jnsereko <58003327+jnsereko@users.noreply.github.com>
Date:   Wed Jul 5 03:40:35 2023 -0700

    (feat) Add support for patient flags on the patient chart and flags side panel (#1178)
    
    * fix error
    
    * add the flags side panel and make some style tweaks
    
    * fix translations and tests
    
    * fix translations and tests
    
    * fix translations and tests
    
    * fix tests
    
    * fix tests
    
    * implement enabling/disabling, searching and sorting
    
    * add translations
    
    * update flags mocks
    
    * Add tags
    
    * add translations
    
    * fix test mocks and tests
    
    * fix language
    
    * fix language
    
    * PR feedack nit pickies
    
    * update translations
    
    ---------
    
    Co-authored-by: hadijahkyampeire <hadijah315@gmail.com>

[33mcommit b3d0fefea28ac317aea54867972400effba45991[m
Author: Lumu chris <59338693+lumuchris256@users.noreply.github.com>
Date:   Tue Jul 4 21:16:22 2023 +0300

    (feat) Migrating Visit notes form to use RHF and Zod (#1253)
    
    visit notes

[33mcommit 695a067c86368ce2fd5cdd4c513314b66fc3389b[m
Author: Lumu chris <59338693+lumuchris256@users.noreply.github.com>
Date:   Tue Jul 4 21:14:29 2023 +0300

    (feat) Migrating conditions form to use RHF and Zod (#1248)
    
    * conditions form refactor
    
    * tweak tests
    
    * Empty commit
    
    * useform context api usage
    
    * add warning icon
    
    * branch update

[33mcommit 8ed371c29785d439a85be58e73846082b33a112b[m
Author: Lumu chris <59338693+lumuchris256@users.noreply.github.com>
Date:   Tue Jul 4 14:52:43 2023 +0300

    (chore) Installation of the  ReactHookForm  and Zod dependencies (#1254)

[33mcommit 97339c41b65c9216e93df46aaa6aa1897eb4b57e[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Jul 4 14:12:20 2023 +0300

    (feat) KHP3-3708 Add ability to populate form with already existing patient identifiers. (#1252)
    
    (feat) KHP3-3708 Add ability to populate form with already existing patient identifiers

[33mcommit d8a4e89df8614c80e023af31dd9b0ea03e88ef66[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Jul 4 10:36:06 2023 +0300

    (chore) update `@openmrs/ngx-formentry` lib (#1257)

[33mcommit c4efc6e6ce50e1b25eb81baa05ad4efa1535951c[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Jul 4 01:20:49 2023 +0530

    (feat) Automatically update translation files for all locales when keys and strings change (#1228)

[33mcommit 57fc5f13e11216d7bd24423f90673a3988f717a1[m
Author: Samriddhi <Agrawalsamriddhi83@gmail.com>
Date:   Tue Jul 4 01:19:39 2023 +0530

    (fix) O3-1783: Fixed order of vitals sign (#1116)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit ea17f835916656ac8f97da18c9da892d3f4fdc50[m
Author: Jexsie <jessiessebuliba@gmail.com>
Date:   Fri Jun 30 22:25:27 2023 +0300

    (feat) O3-2177: Tweak the patient banner details section to match designs (#1197)
    
    * fix relationship resource
    
    * add patient list
    
    * banner updates
    
    * retouch design
    
    * tweak tests
    
    * update patient list
    
    * add empty state
    
    * fix eslint issue
    
    * update address configuration
    
    * retouch patient lists
    
    * extract name
    
    * update look on deacesed patient
    
    * tweak tests
    
    * clean up
    
    * empty retrigger
    
    * code review
    
    * make <p> tag <li> in patient list
    
    * Tweaks
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 3c9e22909b4aea1a0092685c92300cff377d51e9[m
Author: Jexsie <jessiessebuliba@gmail.com>
Date:   Fri Jun 30 12:57:07 2023 +0300

    (feat) Update start visit and visit notes forms to the new tablet design (#1245)
    
    * update tablet view for start visit and visit notes forms
    
    * updates
    
    * final update
    
    * Fix translations
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 168b85e49d9978cf368896c55462d7f754ff378a[m
Author: Jexsie <jessiessebuliba@gmail.com>
Date:   Fri Jun 30 11:29:14 2023 +0300

    (fix) Deleting a condition successfully should update the conditions table (#1232)
    
    * deleting a condition should update the conditions table
    
    * fix side scrolling in the visit notes form
    
    * update modal name
    
    * update modal
    
    * Amend translation
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 2635c12100eb64401bd1454a19bda0aa4022f473[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Jun 29 23:33:37 2023 +0300

    (fix) Amend routes for the Conditions widget delete modal (#1249)

[33mcommit 4a6a9a27d2aa5e8872198bc9c8b41db32cce8518[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Thu Jun 29 15:32:17 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1237)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit ac923c9a0a1303f83f1e7aa31f3a2436976ec080[m
Author: AlexanderMizgirev <68945262+AlexanderMizgirev@users.noreply.github.com>
Date:   Wed Jun 28 21:08:30 2023 +0300

    (fix) O3-2231: fix typos in openmrs-esm-patient-chart module (#1246)

[33mcommit a002e6b1828b435825e2c6997c295e406ad7b80b[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Tue Jun 27 15:02:56 2023 -0400

    (chore) Update to newer versions of openmrs and @openmrs/esm-framework (#1243)

[33mcommit 12902a64e11172c1b627a680b72c762401270f46[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jun 27 21:58:17 2023 +0300

    (fix) Fix program enrollment form extension (#1244)

[33mcommit fe9cdd4225fea1d1a14c5c84878b9f8f48eb3fca[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Tue Jun 27 12:35:44 2023 -0400

    (fix) Ensure routes.json is part of dist for esm-form-entry-app (#1242)

[33mcommit 2fb25f3332e08235f2cee1872e59d6eeff70ced5[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jun 27 14:58:02 2023 +0300

    (fix) Add `slots` array for the `resultsViewer` extension (#1241)

[33mcommit 23bed1b6bf019b8b540bccb3fd7418c0e2bf6580[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jun 26 23:46:23 2023 +0300

    (feat) Show add buttons on widgets by default (#1236)

[33mcommit 9fe5f23d42b59f91081f155fdd05e225bdc88a76[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jun 26 14:12:59 2023 +0300

    (fix) Fix the named export for the `FormsDetailedOverview` component (#1240)

[33mcommit 52bfb2b091b83332ac1f8dbf0b89bf9383aa733f[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jun 26 12:30:05 2023 +0300

    (fix) Exports should reference the result of getSync / getAsync (#1239)

[33mcommit ff9694ecffea54946ca044672909614941f792dc[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jun 26 08:07:54 2023 +0300

    (chore) Switch back to `swc-loader` (#1234)

[33mcommit 7457e4895f782fa4f09a05dc8e8672a7d43dbc96[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Jun 23 17:03:13 2023 -0700

    (fix) Fix component name in allergies widget routes
    
    Changes the `component` used in the allergies widget `routes.json` file extension definition for the dashboard link to the correct one.

[33mcommit 57a4f4381ad4dbb3396bad7164e904e1b779918c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Jun 24 02:16:50 2023 +0300

    (fix) More fixes for routes (#1235)

[33mcommit bf8b2ae9c6dee3d3c9da75d7633f2e133501b431[m
Author: Ian <ian_bacher@brown.edu>
Date:   Fri Jun 23 15:54:09 2023 -0400

    (fix) Exports should reference the result of getSync / getAsync

[33mcommit 13fb75daa3ab0a999a7640d1fdcd9999e991b271[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Fri Jun 23 14:46:37 2023 -0400

    (fix) Exports should reference the result of getSync / getAsync (#1233)

[33mcommit ac3e5b65a040e2a6002da2eaae78e81c7ab0a9e0[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Jun 23 06:01:36 2023 +0300

    (BREAKING) Migrate `esm-patient-chart-app` to use routes.json (#1231)
    
    Co-authored-by: Vineet Sharma <sharmava05@gmail.com>
    Co-authored-by: Ian <ian_bacher@brown.edu>

[33mcommit 582413d03b37a3d396868deb27a44fca55ca8fa4[m
Author: Jexsie <jessiessebuliba@gmail.com>
Date:   Wed Jun 21 22:26:06 2023 +0300

    (fix) Remove side scrolling in allergies, visit note and start visit forms (#1222)
    
    * fix side scrolling in allergies, visit note and start visit forms
    
    * fix spacing btn overdue tag and vitals history

[33mcommit 63f3bf428969d4eedfc9cd7dc8f0dacd8b3b1f4c[m
Author: AlexanderMizgirev <68945262+AlexanderMizgirev@users.noreply.github.com>
Date:   Wed Jun 21 12:49:47 2023 +0300

    (fix) O3-2150: Adds 'Overdue' tag translation (#1226)

[33mcommit a4b2616315f8019d1791d02792acc88de5267d14[m
Author: Jexsie <jessiessebuliba@gmail.com>
Date:   Tue Jun 20 20:19:12 2023 +0300

    (fix) Overflow menu items in the visits table  should close onClick  (#1224)
    
    fix not closing of the menu items onclick

[33mcommit 3103d621352653db16b80320e28ecb5f05e5b5b6[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Tue Jun 20 19:15:39 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1221)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit 4e1583821f05d240faea16b937d2ef16903ee56a[m
Author: AlexanderMizgirev <68945262+AlexanderMizgirev@users.noreply.github.com>
Date:   Tue Jun 20 16:27:38 2023 +0300

    (fix) O3-2150: Adds missing translation strings for side menu (#1223)

[33mcommit f2e40d2632d8c47f64b0a2e5929f7264fa40efb7[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Jun 20 07:41:09 2023 +0300

    (feat) Add ability to enroll and discontinue patient from a program for simple use case (#1199)
    
    (fix) Adapt e2e tests to match naming conventions (#1220)
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 6b2fe7fea006f4b38910ee8a978c46d4515495c7[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jun 19 17:04:01 2023 +0300

    (fix) Adapt e2e tests to match naming conventions (#1220)

[33mcommit c225349f43146dcfb7e1028cd6f7a4463cb1365a[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Mon Jun 19 12:55:06 2023 +0300

    (feat) Add ability to pass formEntrySub and patient workspace to exte… (#1219)
    
    (feat) Add ability to pass formEntrySub and patient workspace to extensions

[33mcommit 06507aaa81d39d5a98c046d9d2c6052590d5338d[m
Author: Jexsie <jessiessebuliba@gmail.com>
Date:   Fri Jun 16 23:18:21 2023 +0300

    (fix) O3-2176: Actions overflow items should have 3rem height on tablet (#1212)
    
    * fix actions menu items tablet view
    
    * Fixup
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit cedc0e885bd34e7c821871f710f133e424b22254[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Jun 16 17:37:51 2023 +0300

    (fix) Remove deprecated `extensionSlotName` prop (#1214)

[33mcommit 7a3ede8551e83835b039f5fcd79d401794c56af9[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Thu Jun 15 18:11:21 2023 +0100

    (i18n) Missing FR label added (#1216)
    
    (i18n) missing FR label added

[33mcommit 7e61326b24e9e68b25e2337808f15c75348c7d4c[m
Author: AlexanderMizgirev <68945262+AlexanderMizgirev@users.noreply.github.com>
Date:   Thu Jun 15 16:03:58 2023 +0300

    (fix) O3-2152: Fix patient-banner margins, new translation strings (#1217)

[33mcommit a6a4e4f0967d4121f2f18027cc7f52ebf0927b24[m
Author: Jexsie <jessiessebuliba@gmail.com>
Date:   Thu Jun 15 14:54:57 2023 +0300

    (fix) Encounter editing and deleting should be handled through permissions (#1190)

[33mcommit a808648300d96fc4dd18f61719731c73c9f0e058[m
Author: icrc-agomes <106243905+icrc-agomes@users.noreply.github.com>
Date:   Mon Jun 12 15:08:50 2023 +0100

    (Feat) Include location provider (#1187)

[33mcommit bbee25eaf2eb4188bb14ca4aeae4adce95deae34[m
Author: Jexsie <jessiessebuliba@gmail.com>
Date:   Mon Jun 12 16:03:37 2023 +0300

    (fix) O3-2181: Vitals & Biometrics forms fails if value is set to "" (#1209)

[33mcommit 2d590bb5946cc576a01abcfd111a58d2e220213d[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Mon Jun 12 18:20:44 2023 +0530

    (feat) O3-2160: Delete this encounter button on visits does not update the table (#1211)

[33mcommit 32bf61a53445c1b7e9511ecbab9b8186ce9b1688[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Sat Jun 10 14:14:05 2023 +0100

    (fix) Allow modifying the visit date to accommodate the new encounter date on all encounters tab (#1184)
    
    Pass visit dates from all encounters tab to form entry

[33mcommit e08feff3ff6326847c54758e88d2cdd1a567a9c1[m
Author: AlexanderMizgirev <68945262+AlexanderMizgirev@users.noreply.github.com>
Date:   Sat Jun 10 15:48:06 2023 +0300

    (fix) O3-2150: Adds missing translation 'record' strings to modules (#1207)

[33mcommit d66919d38cd6232fb19ccdee1dde8064318322db[m
Author: AlexanderMizgirev <68945262+AlexanderMizgirev@users.noreply.github.com>
Date:   Fri Jun 9 21:42:16 2023 +0300

    (fix) O3-2150: Adds missing translation strings to modules (#1206)

[33mcommit 18fad888c437166ec93c7e0e089fb11048f1aa42[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Fri Jun 9 14:20:48 2023 -0400

    (fix) Dashboard path should be derived from path not title (#1203)

[33mcommit 0e89683a5d7190ec65e10dec1b023a118ab3569b[m
Author: AlexanderMizgirev <68945262+AlexanderMizgirev@users.noreply.github.com>
Date:   Fri Jun 9 20:41:07 2023 +0300

    (fix) O3-2152: Fix patient-banner actions dropdown (#1204)

[33mcommit 2889f7f9730044e83ff130c527ffe14ee0cf9c13[m
Author: AlexanderMizgirev <68945262+AlexanderMizgirev@users.noreply.github.com>
Date:   Fri Jun 9 18:28:05 2023 +0300

    (fix) O3-2150: Translate attachments empty state (#1202)

[33mcommit a8ce19971c30d650e04b4ec9ab489b31f498ef5c[m
Author: AlexanderMizgirev <68945262+AlexanderMizgirev@users.noreply.github.com>
Date:   Thu Jun 8 22:33:10 2023 +0300

    (fix) O3-2152: Cleaning RTL styles (#1201)

[33mcommit 208042c964671f71a86112c086f876fd42c99a2b[m
Author: AlexanderMizgirev <68945262+AlexanderMizgirev@users.noreply.github.com>
Date:   Thu Jun 8 19:39:25 2023 +0300

    (fix) O3-2152: Rtl support, fix styles (#1200)

[33mcommit 300886d36df5994ec4db5167c0fdf7e30ee46acf[m
Author: Ian <ian_bacher@brown.edu>
Date:   Thu Jun 8 11:10:06 2023 -0400

    (fix) Restore patient chart navigation

[33mcommit 833b29ee50d88a41e976ae2e6139e3d086f810ab[m
Author: Ian <ian_bacher@brown.edu>
Date:   Thu Jun 8 10:51:54 2023 -0400

    Revert "(fix) Restore patient chart navigation"
    
    This reverts commit af3480905a4e09f6c522f65dcb7884dc000f7cdd.

[33mcommit af3480905a4e09f6c522f65dcb7884dc000f7cdd[m
Author: Ian <ian_bacher@brown.edu>
Date:   Thu Jun 8 10:06:13 2023 -0400

    (fix) Restore patient chart navigation

[33mcommit 777fb09ee2a3c56a9c112539930d1a22aa5dfa54[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Thu Jun 8 15:52:48 2023 +0300

    (feat) Add i18n for the left menu in patient chart (#1183)
    
    Co-authored-by: Ian <ian_bacher@brown.edu>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 743dafcd8a075121551f12de887be43c54a4baad[m[33m ([m[1;33mtag: v4.6.0[m[33m)[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jun 7 02:05:37 2023 +0300

    (chore) Upgrade yarn (#1194)

[33mcommit 7f8f80a70effd918877d0004c3bf84cfe809057d[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jun 7 02:03:48 2023 +0300

    (chore) Release v4.6.0 (#1195)

[33mcommit c425bb581bbf198ec67b75a5041dcea4aa139e22[m
Author: Randila Premarathne <106733522+RandilaP@users.noreply.github.com>
Date:   Tue Jun 6 20:43:04 2023 +0530

    (test) O3-2106: Set up patient chart repo for e2e testing (#1164)
    
    * Set up the patient chart repo for e2e testing
    
    * Set up the patient chart repo for e2e testing
    
    * Making some changes
    
    * Making some changes
    
    * Add requested changes
    
    * Add a initiative test
    
    * Adjust initiative test
    
    * Add allergies page and a test
    
    * Add some changes in package.json
    
    * Resolve the merge conflict
    
    * Adjust some changes
    
    * Adjust some changes
    
    * Add some adjustments
    
    * Add requested changes
    
    * Make some adjustments
    
    * Adjust some changes
    
    * Adjust required changes
    
    * Adjust jest file
    
    * Adjust requested changes
    
    * Add yarn lock
    
    * Update dependency cache key
    
    * Update .github/workflows/e2e.yml
    
    * Add requested changes
    
    * Add requested changes
    
    * Remove cache dependecies
    
    * adjust required changes
    
    * Adjust required changes
    
    ---------
    
    Co-authored-by: Jayasanka Weerasinghe <33048395+jayasanka-sack@users.noreply.github.com>

[33mcommit ef89583e9da735adc2c525b99108b9a7e2bcfa0a[m
Author: Jexsie <jessiessebuliba@gmail.com>
Date:   Tue Jun 6 15:11:37 2023 +0300

    (fix) Remove patient header z-index override in tablet mode (#1192)
    
    * (fix) remove patient header override
    
    * update side rail z-index

[33mcommit 2c4968a8ae3ddf67c2bd64d56fba59caebe3e5dc[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jun 6 13:53:51 2023 +0300

    (refactor) Use `.tsx` extension only for React components (#1193)

[33mcommit cbca659382b485c5429067b82ecba7625c5f3953[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jun 5 20:31:01 2023 +0300

    (fix) Fix error container height (#1177)

[33mcommit 4e78439d35a43b3de90f2c63596a22083a5d4786[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Mon Jun 5 18:47:41 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1191)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit 8db25feecf287847f8bdefa7abcde085229f98f7[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Fri Jun 2 16:49:28 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1189)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit de91921befa144d768057a3097be8b5e324b1866[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Fri Jun 2 16:36:15 2023 +0300

    (feat)Disable start visit button on a deceased patient (#1188)

[33mcommit f7374c4f9f6a960e938453a281efa5efb447c8a2[m
Author: Pius Rubangakene <piruville@gmail.com>
Date:   Thu Jun 1 11:20:52 2023 +0300

    (feat) make start visit button configurable (#1159)
    
    * Only display start visit button on patient chart based on system setting
    
    * Adds missing dependency to hook
    
    * clean up and refactors

[33mcommit be5cbc6e164f5e3af96aabf9cf4384726a558d09[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Wed May 31 20:43:26 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1186)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit 449ab7c6660d843e43c46fac7e4d08f1d00580c2[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed May 31 14:42:58 2023 -0400

    (fix) Restore styling for form-entry-app (#1185)

[33mcommit 22fc2e3d380dc69469bb3994bac60d0094d6ae6e[m
Author: icrc-loliveira <68058940+icrc-loliveira@users.noreply.github.com>
Date:   Tue May 30 12:50:23 2023 +0100

    (fix) O3-2122: Updated observations view in the visits widget (#1182)

[33mcommit b2b8343120fb2b06fefe9d2f9fe433c4e2cddace[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue May 30 17:13:27 2023 +0530

    (fix) O3-2151: Unable to create a drug order in the order basket (#1181)
    
    * Fixed the order basket store on the order basket component
    
    * Fixed the order basket store
    
    * Fixed warning on the console

[33mcommit 5aeba2f8ee724b5d2cbaedaa941de0d7da72fbc6[m
Author: openmrs-sh <132291794+openmrs-sh@users.noreply.github.com>
Date:   Mon May 29 18:14:53 2023 +0300

    (feat) O3-2150: Add Hebrew to openmrs-esm-patient-chart (#1180)
    
    Co-authored-by: Alexander Mizgirev <alexander.mizgirev@firstlinesoftware.com>

[33mcommit d6e683e8213e0ded969a93a9eb61c8a3eb2f2692[m
Author: icrc-loliveira <68058940+icrc-loliveira@users.noreply.github.com>
Date:   Mon May 29 12:51:40 2023 +0100

    O3-2122 - Updated observations view in the visits widget (#1163)
    
    * Updated observations view.
    
    * Tweaks
    
    ---------
    
    Co-authored-by: Luis Oliveira <luis.oliveira@icrc.org>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 7ef9bc5abc816ede98b77b8f590923ec56095fca[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Mon May 29 13:32:05 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1179)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit e25aeef4bc676875f69293ab289b87f421ca3ac1[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Fri May 26 17:27:41 2023 -0400

    (fix) Restore the "Edit Form" functionality (#1176)

[33mcommit 18aeb3dea6f2a60f2b5b0f27a8445b4447f2395e[m
Author: Ian <ian_bacher@brown.edu>
Date:   Fri May 26 09:09:10 2023 -0400

    (chore) Update form entry version

[33mcommit 3953bd98d433827a44147c69c24d80137394031d[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Fri May 26 15:58:54 2023 +0300

    (fix) Fix formatting in patient-chart-app index.ts (#1174)
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>

[33mcommit a845b11c38b006d44ea862b87e9abb961d3744ba[m
Author: Makombe Kennedy <kennedymakombe@gmail.com>
Date:   Fri May 26 15:35:30 2023 +0300

    (feat): Ability to configure address labels on patient banner (#1175)
    
    Co-authored-by: Makombe <makombe>

[33mcommit f271b19d704993bf041253074ee3d5bb0bb1324b[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Thu May 25 10:22:59 2023 +0300

    (chore) Ohri-UgandaEmr MUAC vital inputs status color codes. (#1170)
    
    * add color code changes to MUAC vital inputs
    
    * add config and better colors
    
    * default config to false
    
    * move func to utils
    
    * use carbon colors and add type notations

[33mcommit c0c949e1a17900a65a26d6299a9ed1d39d030a05[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Thu May 25 01:21:55 2023 +0300

    (fix) O3-1637: Test Results: Search in Tree View not working. (#1047)
    
    * implement search on tree view
    
    * implement a deep search through the tree
    
    * implement PR feedback

[33mcommit 8081b956337062e75ef856773e3a5fff10b59c7c[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Thu May 25 00:55:57 2023 +0300

    (fix)disable start visit on a deceased patient (#1147)
    
    * (fix)disable start visit on a deceased patient
    
    * fix build failure
    
    * fix proposed changes
    
    * Fixup
    
    ---------
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 2bc91fb142c23cc5fc19f7ed4041a16d5ee3e18c[m
Author: icrc-loliveira <68058940+icrc-loliveira@users.noreply.github.com>
Date:   Wed May 24 21:36:46 2023 +0100

    (feat) Enable addition of recurring appointments (#1097)
    
    * Added Recurring Appointments
    
    * Added Recurring Appointments
    
    * Allow appointments-widget to add recurring appointments
    
    * Allow appointments-widget to add recurring appointments
    
    * Fixed tests
    
    * Fixed scss
    
    * Reordered recurring toggle.
    
    ---------
    
    Co-authored-by: Luis Oliveira <luis.oliveira@icrc.org>

[33mcommit 828e35b9fa23d6d6410a3a1d455a15f2fffd34ab[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Wed May 24 20:37:27 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1173)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit 505603ce3763de91c89225cf71a8ff70d818df11[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Wed May 24 13:38:30 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1169)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit 414e77cd7456af6a72beb5902bc5b8ce62fd0468[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Wed May 24 12:40:16 2023 +0300

    Add notification error on height input for vitals (#1172)
    
    Fix notification error on height

[33mcommit 4fc81cff70dbe145a09fe2993c24ba56589ce056[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Tue May 23 12:57:05 2023 -0400

    (fix) Migrate to Zustand and fix the order basket (#1167)

[33mcommit 43f9cf8ceb522b68771ae99f4432f36546970e40[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Tue May 23 19:40:27 2023 +0300

    (fix) Add translation keys and strings for all the available dashboards in en.json , fr.json  and other locales (#1171)

[33mcommit 3d1e771de4584aa97a3559dd87d4f4026fb0bb24[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon May 22 22:13:12 2023 +0300

    (fix) Setup `esm-form-entry` to use webpack module federation (#1168)

[33mcommit c9ac9a6b0ec00b49dff94b33b552f5a70c2155ec[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Mon May 22 14:39:08 2023 +0300

    (feat) O3-2091:Support translations for breadcrumbs (#1155)
    
    * (fix)O3-2091:Support translations for breadcrumbs
    
    * fix build failure
    
    * fix the proposed changes
    
    * Add default value for the dashboard translation
    
    * Add translation keys and strings
    
    * Add translation keys and strings on json
    
    * Fixed the key and default values for the breadcrumb texts
    
    * Set defaultValue to the key
    
    * Fix defaultValue to the key
    
    * fix sentence case on translation strings
    
    * fix sentence case on translation strings
    
    * Revert "Fix defaultValue to the key"
    
    This reverts commit 46405224b052dc10c499c7e69810a4ef4e4cd100.
    
    * fix merge conflict
    
    ---------
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>
    Co-authored-by: Vineet Sharma <sharmava05@gmail.com>

[33mcommit e971cf4d4d918c6642ba94dfdb3ecfc127afc28b[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Fri May 19 15:58:37 2023 +0100

    (feat) Modify the visit date to accommodate the new encounter date (#1154)

[33mcommit ec07869db9827a0c59554cd38e36224871ec4604[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Thu May 18 14:29:03 2023 +0300

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1161)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit beed558fe5ef6eaf5e2a68489d3ecd953b4878c4[m
Author: Makombe Kennedy <kennedymakombe@gmail.com>
Date:   Thu May 18 14:04:32 2023 +0300

    (fix): Add checks for undefined in upcoming appointments card (#1162)
    
    Co-authored-by: Makombe <makombe>

[33mcommit 8329adec670ece6823a265c18a5519b71d05242f[m
Author: Jexsie <jessiessebuliba@gmail.com>
Date:   Wed May 17 17:57:39 2023 +0300

    (fix) Patient deceased widget should not break when patient is undefined (#1160)

[33mcommit a2e5fa97ef2ad4ca3752b478c281c1a672c3a324[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Wed May 17 15:42:23 2023 +0300

    (fix) O3-1955: Error message upon fetching of the order templates by users witho… (#1126)
    
    Fix error message upon fetching of the order templates by users without the Manage Order privilledge

[33mcommit 55d635363cce8e3bd42830dbf49574a8942f6b74[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Wed May 17 14:22:13 2023 +0300

    (fix) 03-1952: Do not show the Edit Encounter button for undeveloped forms (#1118)
    
    Remove delete and edit button if form uuid and display are null

[33mcommit 0306e9eb631ca78c5a85a182a9081aeea2f45478[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Tue May 16 08:01:44 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1150)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit 2ebdb34e33d3ce709458f2402cb1d1dfa0e745ee[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Sat May 13 11:39:32 2023 -0400

    (chore) Improve build efficiency of form-engine-app (#1157)
    
    * (chore) Improve build efficiency of form-engine-app
    
    * (chore) Apply default formatting

[33mcommit eabf23b9b27cc9d8b6b77f5c6bce253e64206805[m[33m ([m[1;33mtag: v4.5.0[m[33m)[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed May 10 17:46:29 2023 +0300

    (chore) release v4.5.0 (#1153)

[33mcommit 67f896b1e957ee4a5bb2917352e16a98276703d2[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed May 10 19:30:08 2023 +0530

    (feat) Temporarily allow overriding logo on the patient chart's visit header (#1152)

[33mcommit 70e33cbd8d956bb267fb9d4a4572e075d421358e[m
Author: Jacinta Gichuhi <jecihjoy@gmail.com>
Date:   Wed May 10 14:09:42 2023 +0300

    (refactor)KHP3-3397: Rename visitDate appointment property to dateHon… (#1151)
    
    (refactor)KHP3-3397: Rename visitDate appointment property to dateHonored

[33mcommit 98add76e2f9ea661900f3c86388cbe5a6983e01f[m
Author: molodkov yaroslav <yaroslav.molodkov@odysseusinc.com>
Date:   Tue May 9 16:28:04 2023 +0200

    O3-2075 Fix to display Dashboard from  the JSON application configura… (#1133)

[33mcommit 93b1d51a7a06669df9a078f864f1d43fdc3fcfb9[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Tue May 9 12:48:40 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1149)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit f378562afba25ec2bd4767dfd26ba4732e10bf59[m
Author: Jexsie <jessiessebuliba@gmail.com>
Date:   Fri May 5 20:13:05 2023 +0300

    (fix) Remove useOmrsRestPatient hook (#1148)

[33mcommit 04567fbb6a77ac7cb6e211b6b649c5bd93970d3a[m
Author: Samuel Male <samuelsmalek@gmail.com>
Date:   Fri May 5 13:11:55 2023 +0300

    (fix) O3-1980: Fix patient name header not displaying in offline mode (#1080)
    
    Fix a problem with attempting to access the patient's dentifiers
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 3d510dac654e7bbce38c48105aa9c7de00ef208d[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Thu May 4 21:38:32 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1146)
    
    * (chore) bump-form-engine
    
    * (chore) Bump `@openmrs/openmrs-form-engine-lib`
    
    ---------
    
    Co-authored-by: GitHub Actions <github-actions@github.com>
    Co-authored-by: samuelmale <samuelmale@users.noreply.github.com>

[33mcommit e28d95923c7908a5f10267b197a3b39f8948101d[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Thu May 4 10:06:00 2023 +0100

    (feat) able to delete encounters (#914)
    
    * (feat) able to delete encounters
    
    * fix label for delete encounter option
    
    * fix labelling and remove unecessary style file
    
    * fix lint warning

[33mcommit 9bd4455115b8906d7914c57e0dbfb61c7031deca[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Thu May 4 00:26:57 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1145)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit e267daf5778a7ba72fd489995c61699c060cb56d[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed May 3 18:26:17 2023 -0400

    (fix) Correct duplicated translation keys and add translations to biometrics (#1144)

[33mcommit c1eeacee147485c3e7d737f74fe2bd3ec8d1f20c[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Wed May 3 15:40:33 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1143)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit 57e17f40e03979c031e445fc63ead356eb5d2522[m[33m ([m[1;33mtag: v4.4.0[m[33m)[m
Author: Romain Buisson <rbuisson@users.noreply.github.com>
Date:   Wed May 3 14:33:20 2023 +0200

    (chore) Release v4.4.0 (#1142)

[33mcommit 7bf5cb79abdef637956318b4e87d1b981dcb3a68[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Sat Apr 29 23:10:45 2023 +0200

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1141)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit be35bebabdca10721f02cf8b5ac362f88c4d8521[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Fri Apr 28 19:58:36 2023 +0200

    (chore) Bump form engine (#1140)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit dc6681cc2f596789473ded04c342632843778141[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Fri Apr 28 18:05:35 2023 +0300

    (chore) Bump form engine (#1138)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit 8cbb4c77879c4912868b6b67b8922d160756be6c[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Fri Apr 28 14:33:04 2023 +0300

    O3-2061 Pass active visit attributes to engine if visit exisits (#1120)

[33mcommit 2451cf73053c8c5bf535441c5c766eb061dfdb51[m[33m ([m[1;31mupstream/chore/bump-dayjs[m[33m)[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Fri Apr 28 12:20:30 2023 +0300

    (chore) Bump form engine (#1137)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit 97dac258491a1c29e2416a318956182b29b6e381[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Fri Apr 28 12:04:05 2023 +0300

    (fix) 03-2028: Test Results page switches patients. (#1135)
    
    call the patientUuid inside a component which rerenders when the url changes

[33mcommit da565db84b7764c9bec1cde9db85be0c8bc10029[m
Author: Emmanuel Nyachoke <achachiez@gmail.com>
Date:   Fri Apr 28 11:32:46 2023 +0300

    (fix) KH-175 Fix regression Introduced by https://github.com/openmrs/openmrs-esm-patient-chart/pull/1042 (#1136)

[33mcommit e6c3fffef69628c14ce1b7c3a48bdf6c6413b79b[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Fri Apr 28 07:35:04 2023 +0300

    (chore) Bump form engine (#1134)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit dc646d8359c529940baaef0fa887f9ff42c6b48e[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Thu Apr 27 17:05:30 2023 +0300

    (chore) Bump form engine (#1132)
    
    (chore) bump-form-engine
    
    Co-authored-by: GitHub Actions <github-actions@github.com>

[33mcommit b5a648814516c1069ecedeae048486e0c9eaa883[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Thu Apr 27 17:13:31 2023 +0530

    (feat) O3-2047: Added combo box to search and filter through multiple locations in the start visit form (#1131)
    
    * Added combo box to search and filter through multiple locations
    
    * Finalized the location picker for start visit form
    
    * Added the error state
    
    * Final changes
    
    * Updated translations

[33mcommit 20662417baa9e4572dd05077f6cb36cfd23d55c5[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Thu Apr 27 11:59:28 2023 +0300

    (fix)fix the background color of start a visit button on the visit header on hover (#1130)
    
    (fix)fix the background color of the start button on the visit header
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>

[33mcommit 39b74630ce006408782be0b99d400fcd55d5e423[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Apr 26 09:24:03 2023 +0300

    (chore) bump `@openmrs/esm-form-engine-lib` (#1129)

[33mcommit e36ff4381ff8f09400178fc657a31dfd91655340[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Tue Apr 25 18:31:28 2023 +0300

    (chore) Bump the `@openmrs/ngx-formentry` library (#1128)
    
    pump the version of ngx-formentry to get the ng-select changes

[33mcommit 3588f1054b92b16b505b246624d1e6b5c317cbc8[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Tue Apr 25 16:52:31 2023 +0300

    (chore) Add script that bumps the form engine library version (#1127)
    
    (chore) Add script to package json, Bump @openmrs/openmrs-form-engine-lib

[33mcommit 8e28e3a2de74aa352d20c4cfdff21db4f9f4fb3f[m
Author: Jacinta Gichuhi <jecihjoy@gmail.com>
Date:   Fri Apr 21 10:24:04 2023 +0300

    (feat) Remove patient from active queue on checkout (#1109)
    
    (feat) add ability to remove patient form queue once we end a visit

[33mcommit 53ed65d990a94291ac2efc275a7425578872002f[m
Author: Makombe Kennedy <kennedymakombe@gmail.com>
Date:   Fri Apr 21 09:29:10 2023 +0300

    (feat):  Upcoming appointment card  to show list of appointment and ability to select appointment to be fulfilled (#1125)
    
    (feat): Add upcoming appointment card
    
    Co-authored-by: Makombe <makombe>

[33mcommit 332acb76e42b3d1b36c80464d838e678064eccfd[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Apr 20 22:12:50 2023 +0300

    (chore) Bump `@openmrs/openmrs-form-engine-lib` (#1124)
    
    (chore) bump form-engine version

[33mcommit a17a97687ad0f136f269d9b1cb2ff3f00813dd75[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Apr 19 18:26:09 2023 +0530

    (fix) Fix the visit.enabled property to visits.enabled property in the medications app (#1123)

[33mcommit 9e7d8c5245874e790e78d5058dd7a13c3bf94812[m
Author: Ian <ian_bacher@brown.edu>
Date:   Tue Apr 18 15:27:59 2023 -0400

    (fix) Remove dependence on Type enum from form-entry-app

[33mcommit f678d0120ea4f2171d97d9db17a03f291f50c718[m
Author: Ian <ian_bacher@brown.edu>
Date:   Tue Apr 18 15:24:43 2023 -0400

    Revert previous revert

[33mcommit 843f8adeb7f0669a678b5d7939104c2675bd11c0[m
Author: Ian <ian_bacher@brown.edu>
Date:   Tue Apr 18 15:01:39 2023 -0400

    Revert "Added diagnoses support to formentry (#991)"

[33mcommit 3a0ca9543fdcde630fe2998376cf66b05431a0c3[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Tue Apr 18 12:20:41 2023 +0300

    (fix): KH-142: Remove the time for today's dates. (#1117)
    
    remove the time for today's dates

[33mcommit b8a2f14586773d1796bcb98681fdae6778320ac4[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Tue Apr 18 10:16:12 2023 +0300

    (fix) Update bug on fetching config value in custom default facility (#1114)
    
    (fix) Updated bug on fetching config value in custom default facility

[33mcommit af1d06020b91c4d6dc24c3ef4ce406382764124d[m
Author: icrc-loliveira <68058940+icrc-loliveira@users.noreply.github.com>
Date:   Mon Apr 17 15:17:09 2023 +0100

    Added diagnoses support to formentry (#991)

[33mcommit 5cef2563308cb48c332fe4cf190f24cd8915c153[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Thu Apr 13 14:09:54 2023 +0300

    (enhancement) Add custom default facility url when location is missin… (#1113)
    
    (enhancement) Add custom default facility url when location is missing in session

[33mcommit cb65d923a81d35540106eaf2873200ea24feabbf[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Apr 12 14:51:22 2023 +0300

    (feat) Add ability to launch form in edit mode and handle error if form does not have associated JSON schema (#1107)

[33mcommit c54ba8950b97c4ef523e25651b5304c2255dfd39[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Apr 12 03:42:56 2023 -0700

    (feat) Tweak form engine loading UI (#1112)
    
    * (feat) Tweak the React form engine's loading UI
    
    * Minimal refactors

[33mcommit 532bcdac23937708181b34cdc2410ae9160339b8[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Tue Apr 11 13:38:21 2023 -0700

    Bump webpack from 5.74.0 to 5.76.0 (#1046)
    
    Bumps [webpack](https://github.com/webpack/webpack) from 5.74.0 to 5.76.0.
    - [Release notes](https://github.com/webpack/webpack/releases)
    - [Commits](https://github.com/webpack/webpack/compare/v5.74.0...v5.76.0)
    
    ---
    updated-dependencies:
    - dependency-name: webpack
      dependency-type: direct:development
    ...
    
    Signed-off-by: dependabot[bot] <support@github.com>
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit 55279570a1adc3f7545e3b68962a623a1ddc1663[m
Author: Jexsie <rayahaadiya@gmail.com>
Date:   Tue Apr 11 23:34:39 2023 +0300

    (fix) O3-1947: Auto-expand the visit note textarea as the user types (#1039)
    
    auto-expand box to view all input

[33mcommit 9afb521d0368de1d9de722cc2f0af264e6feed20[m
Author: VivekAlladi <114147733+VivekAlladi@users.noreply.github.com>
Date:   Wed Apr 12 00:59:00 2023 +0530

    (feat) Extend the patient object to support `other` and `unknown` genders (#1042)
    
    * (fix) model object now handles for all genders
    
    * Set `U` as the default
    
    Co-authored-by: jnsereko <58003327+jnsereko@users.noreply.github.com>
    
    ---------
    
    Co-authored-by: Vivek Alladi <valladi@icrc.org>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>
    Co-authored-by: jnsereko <58003327+jnsereko@users.noreply.github.com>

[33mcommit 5e5b8738e410a56138ea1f30ea29cc8f2c97f19e[m
Author: Njidda Salifu <njiddasalifu@gmail.com>
Date:   Tue Apr 11 20:24:02 2023 +0100

    O3-1679: Test results header in the "Test Results" dashboard appearing twice (#1102)
    
    * Hide dashboard tittle on test results
    
    * Hide dashboard tittle on test results
    
    * Make `hideDashboardTitle` an optional property
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 13fec53e6505077be8ccc7b589773826c987c858[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Tue Apr 11 22:14:27 2023 +0300

    (feat) O3-1976: Implement the deceased variant of the patient header (#1078)
    
    * (fix)O3-1976:Implement new patient header design for deceased patients
    
    * Touchup
    
    ---------
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 765217b8640c55a668cfa9aa8d916a3eae1fd702[m
Author: Jexsie <rayahaadiya@gmail.com>
Date:   Tue Apr 11 20:31:04 2023 +0300

    (fix) O3-2025: Visit enabled system setting should be referenced using "visit.enabled" (#1099)

[33mcommit 63b6a6aaf729ac1a742a60957cd33c894b91f395[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Apr 10 11:50:59 2023 -0700

    (fix) Restore success toast shown after starting a visit (#1111)
    
    (fix) Fix start visit form success toast

[33mcommit 8a92dc36899d9f6be8dd8d869d31bb95ea550b6a[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Mon Apr 10 14:35:12 2023 +0300

    (Fix) O3-1959: Test results datetime to only display the date. (#1103)
    
    - Set time to false while formating date

[33mcommit 9a003ae28288626cc431d5a88158a0c213edb41b[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon Apr 10 14:20:05 2023 +0300

    (bug) Fix bug on launching vitals form to use form-engine (#1110)

[33mcommit 6b26a25b8a05845873c459216439874f67171b6b[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon Apr 10 11:11:30 2023 +0300

    (bug) Fix bug on starting a visit where there is only one visit-type (#1108)

[33mcommit a3034c1f34380a8e376f925e8be271b74b524f63[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Sun Apr 9 22:06:36 2023 +0300

    (feat) Add correct form-error UI as shown on the designs (#1106)

[33mcommit 8628204312280396d5a8444a5fe6bb01c4b17458[m
Author: Jexsie <rayahaadiya@gmail.com>
Date:   Fri Apr 7 17:04:59 2023 +0300

    (fix) O3-2031: Remove unused configuration properties from useVisitNotes (#1105)
    
    * (fix) remove unused config properties
    
    * Remove more unused references
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 510a94db5bb60e614fd1f9e44edf7f62a70993a9[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Thu Apr 6 17:25:46 2023 +0300

    (fix) KH-141: Filling 5 address fields shows only 4 fields in the patient banner. (#1101)
    
    Display address lines in the address details

[33mcommit d50fb9ff82ab51e72e88831d0491db585d0fa29b[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Apr 5 23:33:19 2023 +0530

    (fix) O3-2029: Required visit attribute's default value shouldn't be the first choice (#1100)
    
    'Select an option' choice is not disabled for required visit attribute dropdown

[33mcommit 3b70982acba6b106dfbf37a79b0beca280b62045[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Apr 5 09:16:43 2023 +0300

    (chore) Switch to community-maintained `@openmrs/esm-form-engine-lib`  (#1096)
    
    (chore) bump form-engine-lib from `ohri` to `openmrs`

[33mcommit 39d570546c4a3b3bd04da8b93b5711dbf69e4b9d[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Tue Apr 4 16:49:11 2023 -0400

    (fix) Dashboard View should not use wrap property (#1091)

[33mcommit 0049d5d786e68b1cabeac656c13a221bdd5908b6[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Apr 3 23:01:31 2023 -0700

    (feat) Offline tools dashboard UI enhancements (#1094)

[33mcommit 38d17c319a39648e5a3c92d8e30ad2e804d67843[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Mon Apr 3 16:45:04 2023 -0400

    (fix) Improve performance of patient chart (#1083)
    
    * (fix) Improve performance of patient chart
    
    * Fix patient header if no identifiers exist for patient
    
    * Speculative fix for conditions widget
    
    * A few efficiencies in the visit header
    
    * Testing fixes
    
    * Add webpack-cli

[33mcommit 2416dd338bc67a076915c497810195acfc85aa66[m[33m ([m[1;33mtag: v4.3.0[m[33m)[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Mar 31 10:42:29 2023 -0700

    (chore) Release v4.3.0 (#1090)

[33mcommit 82c12a8f422fea540881296c0255ab35b10a0893[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Mar 31 16:26:18 2023 +0300

    (fix) Fix the display of medications in the visit summary encounters table (#1089)
    
    (fix) fix visi-summary medication name not displaying

[33mcommit a9caece64105504490f82bb4cfdd97d458023f6d[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Fri Mar 31 18:07:03 2023 +0530

    (feat) O3-1597: Test Results in Filter View should show ALL past lab results (#1084)

[33mcommit 713f5b43a7b4068f7925c3768573e6ead34a5600[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Mar 31 05:21:44 2023 -0700

    (fix) Fix form switching issue (#1087)

[33mcommit cd515579e3ffdf1ce6a19cd1ba486c3819cef086[m
Author: Pius Rubangakene <piruville@gmail.com>
Date:   Fri Mar 31 15:08:13 2023 +0300

    (fix) Adjustments to patient allergy form (#1086)
    
    * adjustments to allergy form to remove date
    
    * additional tweaks and test fixes
    
    * adds translations changes

[33mcommit cf279308d066064f5751edf32bca170f9f2b87d4[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Mar 31 12:32:03 2023 +0300

    (feat) Initial setup of OHRI form on patient-chart (#1082)

[33mcommit 77d1ec264c5ec18edd99c4799cae0d56bad43b2f[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Mar 30 11:46:46 2023 -0700

    (fix) Fix note text line endings (#1085)

[33mcommit 0c62086bf8130e4a40e931d299cfe6573bbd23ad[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Wed Mar 29 18:28:00 2023 +0300

    (fix) O3-2007: Fix the visit header patient name hover height. (#1081)
    
    add more padding top bottom

[33mcommit fbc4bafa272a93bf5921121e7fcbd5fad41e5cc2[m
Author: Jexsie <rayahaadiya@gmail.com>
Date:   Tue Mar 28 21:58:11 2023 +0300

    (feat) O3-1942: Lift form privileges to useForms hook (#1059)
    
    Co-authored-by: Ian <ian_bacher@brown.edu>

[33mcommit 92d6f4a06ff7e7778dde95d6fd412894ecafc4d8[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Mar 28 15:50:09 2023 +0300

    (fix) fix setting provider and location values on form-entry launch (#1070)

[33mcommit 0c12305decd749f0b1b984f940797d7598e1520f[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Tue Mar 28 09:37:20 2023 +0300

    (fix) 03-1995: Fix patient conditions sorting on "onSetDate". (#1074)
    
    * fix the onsetDateTime sorting
    
    * fix linting
    
    * modify the compare function
    
    * clean up

[33mcommit 63204b7f746524c52f9c8921cdb7dd777a5ba540[m
Author: Ian <ian_bacher@brown.edu>
Date:   Mon Mar 27 16:11:19 2023 -0400

    (fix) Fix logic for determining active and past orders

[33mcommit c1a567765a87fe2a941937e1591d03deee72948d[m
Author: Jexsie <rayahaadiya@gmail.com>
Date:   Mon Mar 27 20:47:23 2023 +0300

    (fix) O3-1973: Separate active orders and past orders in the medications  summary table (#1060)
    
    * (fix) separate active orders and past orders
    
    * update

[33mcommit 38a6e8530b638abb1fd32baa4da6d9c5236e31fd[m
Author: grace potma <67400059+gracepotma@users.noreply.github.com>
Date:   Mon Mar 27 10:13:54 2023 -0700

    O3-1998: Allergy Table shows wrong Onset date (#1073)
    
    Co-authored-by: hadijahkyampeire <hadijah315@gmail.com>

[33mcommit eab77d58243ffc802a5572f2089d5b0731a907cd[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Mar 27 01:01:35 2023 -0700

    (fix) Fix how obs from an encounter get displayed in the visits table (#1071)

[33mcommit 19630fcea298972e2791de270f0412be09af1419[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sun Mar 26 22:25:31 2023 -0700

    (fix) Vitals header should wrap when a workspace is open on desktop (#1072)

[33mcommit bb4a4d081cc1f2b291f5c6ddebaeda5fbe2d8de8[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Mar 25 02:05:31 2023 -0700

    (feat) Handle obs group questions in visits table (#1064)
    
    * (feat) Handle obs group questions in visits table
    
    * Fix overflow menu button background color

[33mcommit 54f009debcf67c869a77aa4067c086eb0c374a35[m
Author: Ayush <54752747+ayush-AI@users.noreply.github.com>
Date:   Sat Mar 25 02:07:48 2023 +0530

    (docs) O3-1993: Added missing yarn install command in the readme (#1068)

[33mcommit aead8d9fd416e1a9c1dbefb89a89f788344d520a[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Mar 24 20:56:18 2023 +0300

    (fix) fix bug on closing forms launch from form dashboard (#1069)

[33mcommit 3a2f4683ce5c03ed244cac0828f3aec903f8bcc4[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Mar 24 00:00:47 2023 -0700

    (chore) Bump @openmrs/ngx-formentry (#1067)

[33mcommit 37c2bdaea28b89eb35c4e9fa03782f0f450ae801[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Thu Mar 23 16:41:46 2023 +0300

    (docs) Add guidance for including conventional commit labels (#1065)
    
    (docs) Add guidance for including conventional commit labels in PR titles

[33mcommit deb1020efee9d3d912979e6d7b20006241b2fc01[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Mar 21 12:41:45 2023 -0700

    (feat) Allow more horizontal space for vitals header items (#1063)

[33mcommit 467d55114ad3312ed5bda923b443bb1aef53e055[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Tue Mar 21 15:04:44 2023 +0300

    (fix) 03-1971: Forms should sort alphabetically. (#1058)
    
    sort forms alphabetically

[33mcommit b869e04eba4218bd3eb50a035d1b68bd93bac11a[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Mar 20 13:23:39 2023 -0700

    (feat) Remove right margin from the overdue tag in the vitals header (#1062)
    
    (feat) Remove right margin from overdue tag in vitals header

[33mcommit 6b5919614619bdec5815c0960498365ed8abac5e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Mar 20 13:23:02 2023 -0700

    (fix) Fix forms widget content switcher (#1061)

[33mcommit 93f716cc647cc40c7fc0a9ec4373eb750ad020d8[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Mar 20 11:42:15 2023 -0700

    (feat) Flag abnormal temperature values in vitals header (#1057)

[33mcommit ae53fcb0e83b1cca505fe3b67bea0ac5766645e8[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Sat Mar 18 16:25:28 2023 +0300

    (fix) 03-1968: Panel and tree views should be full-width when the `full` button is clicked (#1050)
    
    * implement full view on test results
    
    * show tree/panel option in full view
    
    * Minor tweaks
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 6e898d3c445e71428388004f99585fae89203eeb[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Mar 18 02:01:55 2023 -0700

    (feat) Vitals header UI enhancements (#1056)
    
    * (feat) Vitals header UI enhancements
    
    * Style record vitals button in empty state
    
    * Show overdue tag when vitals haven't been recorded in an active visit

[33mcommit 83eb084bef6051a6373a309d875f1500a575ccba[m[33m ([m[1;33mtag: v4.2.1[m[33m)[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Mar 16 15:17:07 2023 -0700

    (chore) Release v4.2.1 (#1055)

[33mcommit b852ee5371c4f8dcd208d2265c4e5bf24b094348[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Mar 16 12:58:17 2023 -0700

    (feat) Move `active-left-nav-link` class to the anchor element (#1054)

[33mcommit 533ca1bfdc72530508d2ed93c1d4410a5c341bc7[m[33m ([m[1;33mtag: v4.2.0[m[33m)[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Mar 16 06:43:57 2023 -0700

    (chore) Release v4.2.0 (#1053)

[33mcommit e86cb44de2194c02f40e3bd8d54fa7637aa054cb[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Thu Mar 16 19:00:27 2023 +0530

    (fix) KH-96: Displaying patient's address in patient banner (#1051)
    
    * Displaying all the address fields in the patient banner
    
    * Updated translations

[33mcommit ba4bff4dece09dea69a7f6074d6386c943e49bc5[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Mar 16 08:30:01 2023 +0300

    03-1026 (bug) Filling out a form does not update the Forms & Notes view (#1049)

[33mcommit 5025507598cd458db6b164e15abec2c16829a884[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Mar 15 10:45:00 2023 -0700

    (fix) Port over styling for identifiers in the patient banner (#1048)
    
    * (fix) Port over styling for identifiers in the patient banner
    
    * Add translation keys and strings

[33mcommit 40074760d4b28c1d895433218ef7eb9ab0387d29[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Mar 14 12:47:26 2023 -0700

    (fix) O3-1492: Remove dangerous global selectors from stylesheets (#1045)

[33mcommit b9feefdabad13e5593d9e0cefd3811d64fd1f190[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Mar 14 12:34:56 2023 +0300

    feat: Add year on generic obs component (#1044)
    
    feat: Add date on generic obs component

[33mcommit df50c0d49c19b46ec62ff9a7a739b3b8c0b2ae21[m
Author: Jexsie <jessiessebuliba@gmail.com>
Date:   Tue Mar 14 10:58:51 2023 +0300

    (docs) Update pull request template with a link to design docs  (#1043)
    
    Update pull_request_template.md
    
    add a link to the design documentation

[33mcommit 5780de4b34c61446e696646f6bcac9c18957c5fe[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Mar 13 11:30:56 2023 -0700

    (fix) Remove global left nav menu style overrides (#1040)

[33mcommit 590b0894e5a0d6686f899a7167b393dd13d808f4[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Sun Mar 12 07:41:27 2023 +0300

    (fix) 03-1945: Do not launch the forms dashboard when there is an open form. (#1038)

[33mcommit 8927172a2d1609d1719836e05fd3a914493a4bdc[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Sat Mar 11 15:35:49 2023 +0300

    (feat): Add visit header extension slot (#1037)

[33mcommit 5529002efad11d760e678e14f1946e7a87c3a167[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Sat Mar 11 18:01:31 2023 +0530

    (fix) Table styling fixes for data tables in patient chart (#1014)
    
    * Table styling fixes (desktop and tablet) in past visits table
    
    * Table expansion padding fixed
    
    * Table styling improvements for Appointments
    
    * Table styling for biometrics table
    
    * Table styling for vitals table
    
    * Table styling for conditions table
    
    * Table styling for attachments table
    
    * Fine styling for attachments table header
    
    * Table styling for notes table
    
    * Conditioning fix in notes table
    
    * Table styling for forms table
    
    * Updated translations
    
    * Table styling for allergies table
    
    * Fixed failing test
    
    * Table styling for programs table
    
    * Fixed the stylings for icon based content switchers
    
    * Updated translations
    
    * Updated dependencies
    
    * Fixed crashing when editing an encounter

[33mcommit 976fef313b30705d81e29b4ed453cefa78893a4e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Mar 11 01:44:42 2023 -0800

    (refactor) Refactor conditions widget (#1005)

[33mcommit 3593e12eaa3007d2670c2fda8196da1b06b4a1cb[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Wed Mar 8 09:06:29 2023 +0300

    (refactor) Remove all service queue configs and inputs and replace them with extension (#1036)
    
    (refactor) Remove all service queue configs and inputs to extension

[33mcommit 40a0b56f6bf6905061a24a93225e6353c0a9d874[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Mon Mar 6 16:38:20 2023 +0300

    (refator) Remove move patient to next service button (#1035)

[33mcommit 0593dc010e88ee78881396a77bce0c7eba85f4d2[m
Author: Pius Rubangakene <piruville@gmail.com>
Date:   Sat Mar 4 13:57:43 2023 +0300

    Adds configuration to hide patient identifiers (#1033)
    
    * Adds configuration to hide patient idenfiers
    
    * clean up

[33mcommit c45b16507445b62cc49df250deda7465991d5ac7[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Mar 3 12:06:27 2023 -0800

    (feat) Tweak appearance of the side rail divider (#1034)

[33mcommit 8e1975d0e91a44017192f4d0d78396dad91e80d1[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Fri Mar 3 19:37:32 2023 +0000

    (fix) Allow opening legacy html forms on visit list (#1027)

[33mcommit 5742eceaf97d0f312b353df391fad12e6a3d5bbb[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Fri Mar 3 19:28:51 2023 +0000

    (feat) change formUuid property type to support arbitrary strings (#1010)

[33mcommit 0f16345bf18fd6dacc37d03a25139a4c31e0f0b8[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Fri Mar 3 10:56:23 2023 +0300

    (fix) 03-1932: Form Icon should be disabled if a specific form is open (#1029)
    
    disable form icon when form is open

[33mcommit 8fd960beb74996d2b8f6a19c71da8b69e860ff69[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Thu Mar 2 21:11:16 2023 +0300

    (refactor) Updated get active queue endpoint (#1023)

[33mcommit 875171cb5d8dcf62521f902427829e225fc2338a[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Thu Mar 2 13:03:36 2023 -0500

    (chore) Remove unused dependency (#1032)
    
    (chore) Remove used dependency

[33mcommit 869ad64942de0f651262d45cc5dfe7c2513f9855[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Mar 2 06:50:58 2023 -0800

    (refactor) Refactor start visit form (#1031)
    
    This PR refactors the start visit form as follows:
    
    - Replaces a couple of unnecessary `useEffect`s and instead computes their associated state updates during rendering.
    - Replaces some repetitive code with a `ResponsiveWrapper` component that wraps its children in a `Layer` component when viewing the UI in the tablet viewport.
    - Refactors the `Visit Type` selection logic so that the `ContentSwitcher` gets shown only when the Recommended Visit type feature gets enabled via config. Clicking on the `Recommended` tab of the ContentSwitcher reveals a never-ending loading screen. This feature depends on an implementation-specific external API to work, and it makes sense to disable it by default via configuration.

[33mcommit 4f8ed7514aff3a8d79ddd09b07784a5396e65f44[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Mar 1 06:12:55 2023 -0800

    (fix) Fix overflow menu background color in visits table (#1030)

[33mcommit 9fa5d9b32b4ba25397746f76b229d111fbdf2b36[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Feb 28 14:19:49 2023 -0800

    (fix) Attempt to fix weird overflow menu UI (#1028)

[33mcommit 4b20b0a75c960d2896b6838a7702a8fcc751ff34[m
Author: Jessie <104269786+Jexsie@users.noreply.github.com>
Date:   Tue Feb 28 16:19:43 2023 +0300

    (feat) O3-1896: Number input steppers in vitals and biometrics form shouldn't exceed ranges (#1022)

[33mcommit 1cdd2a39d12b4627316bbce72f39ba8e9345f5bb[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Feb 28 18:20:00 2023 +0530

    (feat) O3-1809: Using global Visit setting to either map Order Encounter to Active Visit (#969)
    
    * Configurable option for using visit in order basket
    
    * Used the global system setting to either use visit or not
    
    * Fixed failing tests
    
    * Fixup
    
    * Bound mutate function to update orders
    
    * Fixed failing tests
    
    * Test fix
    
    * Removed unnecessary variable declaration

[33mcommit 90ebdd09599b108841002a20e063136c35c0d2b4[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Tue Feb 28 13:19:07 2023 +0300

    (fix) 03-1917: Forms icon in the side rails loses the active class. (#1026)
    
    check for the specific form name

[33mcommit 20ca53939119b3de36174ed5177eb8c008aba638[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Feb 28 15:19:37 2023 +0530

    (feat) O3-1879: P.R.N. Instructions Text area should be disabled if `PRN as needed` is not selected (#1024)
    
    P.R.N. reason field disabled if P.R.N. is not checked

[33mcommit caf7e1cea949198da40b1d44e50eaba5046907fb[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Mon Feb 27 11:26:44 2023 +0000

    (chore) Bump `@openmrs/ngx-formentry` to 3.0.1-pre.124 (#1025)
    
    Bump formentry to 3.0.1-pre.124

[33mcommit b54c96d4b016c95417c1187b461d25da05319b90[m
Author: Lumu chris <59338693+lumuchris256@users.noreply.github.com>
Date:   Mon Feb 27 13:12:50 2023 +0300

    (fix) O3-1928: Set maximal width on vitals header item container (#1021)
    
    fixed vitals-header container property

[33mcommit cd4ab9c0ab909b71e84bf55767466583f16a2a40[m
Author: Herman Muhereza <hermanmuhereza22@gmail.com>
Date:   Sat Feb 25 20:30:07 2023 +0300

    Ensure the patient instructions are visible on the order card (#1002)
    
    * ensure patient instructions are visible on the order card
    
    * ensure mdash won't be left hanging when patientInstructions are not provided

[33mcommit f12632e57e02fb77fc612778937bc3ad0a6dd04a[m
Author: Lumu chris <59338693+lumuchris256@users.noreply.github.com>
Date:   Fri Feb 24 17:28:08 2023 +0300

     (fix) O3-1647: Change `Mark deceased` action button text (#1016)
    
    * change Mark deceased as Mark deceased
    
    * Empty-Commit
    
    * rename for translations
    
    * update component imports
    
    * added translations

[33mcommit d60a07d511950457073f6ae7fa3b9964de909b15[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Feb 24 08:29:07 2023 +0300

    feat: Add ability to navigate back from patient-chart to previous url (#1015)

[33mcommit 964e474825b37a3f157f7dfd6f826330c38f100f[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Thu Feb 23 22:43:31 2023 +0000

    (feat) Support search on all pages in forms list (#1017)
    
    * support search on all pages in forms list
    
    * fix total items property based on filtered forms length
    
    * UI tweaks
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 4d2989162784e940331ab5e81e094621477cfc36[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Feb 23 13:47:08 2023 -0800

    (chore) Specify max concurrency in build script (#1018)

[33mcommit f5c4a3bcd97694248362526eb96580bad0822779[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Feb 23 04:05:08 2023 -0800

    (chore) Fix environment variable workflow access (#1013)

[33mcommit 84b0f038e816ea8a542d2e8fcf24ccde904071dd[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Feb 20 16:53:56 2023 -0800

    (fix) Add a white background to the patient lists action button (#1012)

[33mcommit 61103a499194469f5c478ba1c062876d4f7b43df[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Feb 20 16:53:28 2023 -0800

    (chore) Bump upload-artifact action (#1011)

[33mcommit 2cc83e5d493032902b291169a93397fd11a7b34a[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Feb 17 12:08:04 2023 -0800

    (fix) Side rail and bottom nav UI fixes (#1007)

[33mcommit f6b5d5fe70ab6c6add6bddb68f8c18a752d818ad[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Feb 17 12:07:08 2023 -0800

    (fix) Remove redundant styling for search fields (#1009)

[33mcommit 295bccf3dba4be08a44b70c9cf2734535a0273d8[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Fri Feb 17 09:44:30 2023 -0500

    (feat) Support i18n for forms entry (#1003)

[33mcommit ad9f8ca1f79230e343fb446cea0938c9d7775edc[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Feb 17 01:37:53 2023 -0800

    (chore) Bump Turborepo GitHub Artifacts action version (#1008)

[33mcommit 29ecb9b300218ae25c1347e0319afa6b92a13731[m
Author: Nsereko Joshua <58003327+jnsereko@users.noreply.github.com>
Date:   Fri Feb 17 02:07:02 2023 +0300

    (feat) O3-1649: Show vital signs without needing to expand the vitals header (#999)
    
    * O3-1649: VS should not be hidden: Update Vitals header bar to show without 2nd click
    
    * Update packages/esm-patient-vitals-app/src/vitals/vitals-header/vitals-header-item.component.tsx
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>
    
    * Update packages/esm-patient-vitals-app/src/vitals/vitals-header/vitals-header-item.scss
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>
    
    * O3-1649: VS should not be hidden: Update Vitals header bar to show without 2nd click
    
    * rerun build
    
    * Add vitals history link plus some tweaks
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>
    Co-authored-by: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>

[33mcommit 158de0c981971313a0770a309aef4db2867ab9f7[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Thu Feb 16 18:08:55 2023 +0300

    (fix) Fix icon link states in the side rail (#1004)
    
    * (fix)O3-1674:Side rail should only have 1 active item at a time
    
    * Rename variable
    
    * Use regex check to determine active workspace
    
    ---------
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 3747c1ebd274b5d63fe51c98754f1ae8ef1212f4[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Thu Feb 16 17:55:58 2023 +0300

    (fix): 03-1855: Appointment table behaving weird. (#1006)
    
    fix the weird appointments table behaviour

[33mcommit cebfa8eae4765c869e6a8ed1b2eb8f6bbc3af8e0[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Wed Feb 15 14:54:50 2023 +0300

    (fix) 03-1857: Make the disabled condition a label instead of a disabled search. (#997)
    
    * - Make condition display a label
    
    * - Update translations
    
    * use carbon type label
    
    * some cleanup and tweaks

[33mcommit af4fc91b2985492a20ce759402ef90a618384748[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Feb 14 23:19:13 2023 +0300

    (enhancement) require an active visit before filling vitals or biometrics (#998)
    
    enhancement: require an active visit before filling vitals or biometrics

[33mcommit 94596128efaec979375d9c46dac08f1c26556d2f[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Tue Feb 14 19:57:16 2023 +0300

    (feat) Added configurable button to move patients to the next service (#1000)

[33mcommit e9c6e68f71314f99abc349d11f09ddb17dfdd649[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Tue Feb 14 19:56:29 2023 +0300

    (fix) Use first queue location and not visit location in queue locati… (#1001)
    
    (fix) Use first queue location and not visit location in queue location field

[33mcommit 19ebbf007555c9d13241765412e40c43ee8125da[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Tue Feb 14 12:38:48 2023 +0300

    (Improvement: 03-1856): Appointments cancel modal improvements. (#995)
    
    * fix disabled conditions color and appt cancel modal
    
    * update translations
    
    * Remove condition changes

[33mcommit 899cc47841397f7ea627978c2d89e8bc736b5264[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Feb 14 11:39:51 2023 +0300

    feat: Add ability to auto-populate start visit form with default values (#996)

[33mcommit 76aca780cb76e9c08010ad3da841867e19458c81[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Fri Feb 10 08:56:11 2023 +0300

    (feat) Added configurable end visit label in patient visit header and… (#986)
    
    (feat) Added configurable end visit label in patient visit header and actions

[33mcommit d0d59cc7d60440341f7d5d68c83c4dc00b06adbd[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Feb 9 11:16:34 2023 -0800

    (feat) Add batch expansion to the visit notes table (#993)

[33mcommit 6da752f83554fa0bab6abcc60efa75385e8708fc[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Feb 9 05:57:05 2023 -0800

    (refactor) Refactor visit header (#992)
    
    * (refactor) Refactor visit header
    
    * Fix patient details UI
    
    * Fix logic that determines whether to show button

[33mcommit c9b8ed7b780a5f20e3a941e1456b0c9fdc65673c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Feb 7 13:51:13 2023 -0800

    (fix) Fix syntax deprecations and remove unused imports (#990)

[33mcommit 5962dcd463d33b07683e921299ee38857b6ee98e[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Tue Feb 7 21:33:05 2023 +0000

    (fix) Fixed regression when fetching concept dictionary data using multiple requests (#980)

[33mcommit f439ebcf398529173f8f6339369da46ae15a6f42[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Wed Feb 8 00:04:03 2023 +0300

    (feat) Add the ability to edit and cancel appointments (#985)
    
    * implements editing an appointment
    
    * update translations
    
    * improvements
    
    * updating translations
    
    * implement cancel appointment
    
    * update cancel translations
    
    * polish up
    
    * update translations
    
    * Minor tweaks
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 5ff90b1b5aef1d1bd3b2c77964ad93b0447bd132[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Feb 7 11:01:41 2023 -0800

    (fix) Set `Active` as the default conditions table filter (#989)

[33mcommit 707ae60460d4f56e13e40b1d6aa0dcbb12ff60fc[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Tue Feb 7 12:59:14 2023 +0300

    (fix) 03-1848: The condition name field should not be editable when editing conditions (#988)
    
    Condition name cannot be editted

[33mcommit a691c8b41df4f8b0082f03137200ba576722d28e[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Mon Feb 6 20:13:00 2023 +0000

    (chore) Add french (FR) translations (#987)

[33mcommit ac86a1beb32df5c8f155a9939402475cd884fa9c[m[33m ([m[1;33mtag: v4.1.0[m[33m)[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Feb 3 12:56:32 2023 -0800

    (release) v4.1.0 (#984)

[33mcommit af2fe603440434cae71d237960b67e3da8671657[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Thu Feb 2 16:34:05 2023 +0000

    (fix) Show effective date on obs table component instead of issued date (#983)
    
    * Show effective obs date on obs table component instead of issued date
    
    * Show effective obs date on obs graph component instead of issued date
    
    * Adapted tests to look for obs effective date instead of issued date

[33mcommit f5330c710fa4f6f6d75d0659e7d15a7d8887d683[m
Author: Nsereko Joshua <58003327+jnsereko@users.noreply.github.com>
Date:   Thu Feb 2 15:48:43 2023 +0300

    (feat) O3-1681: Tiles should have a max width (#982)

[33mcommit 006bf7a3271137186434ecb6962dce77f5f0a2ee[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Feb 2 02:40:40 2023 -0800

    (feat) Add a forms dashboard (#977)
    
    * (feat) Add a forms dashboard
    
    * Apply suggestions from code review
    
    ---------
    
    Co-authored-by: Ian <52504170+ibacher@users.noreply.github.com>

[33mcommit 18f99a19698af2561c9fd24d5694475b1703b775[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Thu Feb 2 12:02:48 2023 +0300

    (feat) O3-1759: Add the ability to delete a Condition (#952)
    
    * add the delete functionality to conditions
    
    * some cleanups
    
    * update translations
    
    * Modify the conditions action menu
    
    * Tweaks
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 9fe80ba8499d09d313d7e718157bfdf82b48ffc6[m
Author: icrc-agomes <106243905+icrc-agomes@users.noreply.github.com>
Date:   Thu Feb 2 07:23:10 2023 +0000

    (feat) obs-by-encounter-widget can support Date concepts (#928)
    
    * (feat) obs-by-encounter-widget can support Date concepts
    
    * Changes in config-schema and in obs-table component so it uses exsting date formating functions
    
    * Add `valueDateTime` property to `ObsResult` type
    
    ---------
    
    Co-authored-by: Andre Gomes <Andre.Gomes@emea.merkleinc.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit d7e158cf154d7cb4896c31fc45aff5680dff3e78[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Thu Feb 2 00:09:30 2023 +0300

    (feat) O3-1760: Add ability to edit a condition (#975)
    
    * Edit a condition
    
    * update translations
    
    * PR review changes
    
    * Fix tests
    
    * Rename scss file
    
    * Change the import name to reflect new name
    
    * lint fixes
    
    * Fix the menu layer and onsetDate while editing
    
    * Commit translations
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit bdf4faa41091eab3dd6008e01829fbe5cd9925c5[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Wed Feb 1 23:48:56 2023 +0300

    (feat) Show lists that a patient belongs to in the patient header (#927)
    
    * Add patient lists
    
    * Add links to list items
    
    * Edit wording
    
    * Add innital patients lists
    
    * Remove unused code
    
    * Add patient list limit
    
    * Modify code
    
    * Fix lint issues
    
    * UI enhancements
    
    * More tweaks
    
    * Cleanup
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit bb4f1989b416796bc384571484b857dd99569999[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Feb 1 20:46:59 2023 +0530

    (fix) Error handling when failed to fetch a visit attribute type (#932)
    
    * Error handling when failed to fetch a visit attribute type
    
    * Updated translations
    
    * Final changes
    
    * Updated translations
    
    * Cleanup
    
    * Added warning if the visit attribute type field throws error but is not required
    
    * Reporting errors on console

[33mcommit 78da355b79e7fb5b8fef2784e03b636ef735da50[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Feb 1 19:59:44 2023 +0530

    (feat) O3-1797: Re-order Summary page widgets to match designs (and remove some) (#968)
    
    * Fixed the widget's ordering and removed unwanted widgets from patient summary
    
    * Review changes
    
    * Proper order to patient summary extensions
    
    * Proper order to condition extension

[33mcommit 8987bb3dad9a30da29f51d2aad5a76da96e1db2d[m
Author: Nsereko Joshua <58003327+jnsereko@users.noreply.github.com>
Date:   Wed Feb 1 15:38:07 2023 +0300

    (feat) O3-1681: Tiles should have a max width (#981)
    
    * O3-1681: Tiles should have a max-width
    
    * consider left and right position

[33mcommit f45b93e2293c82dce959d5b1c59db0313d573a8e[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Feb 1 17:25:48 2023 +0530

    (improvement) O3-1728: Change Note guidance text (#979)
    
    * Updated the notes guidance texts
    
    * Updated Khmer translations

[33mcommit 3450c8bc363e1dca19e36000d034e7c6c5c92e0d[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jan 31 06:35:40 2023 -0800

    (refactor) Use the bound mutate API instead of global mutate (#964)

[33mcommit c312e9247733ecce27079a60e7078b6e60bdd1c0[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Tue Jan 31 14:18:17 2023 +0300

    (feat) Added locations with queue tag to queue section in start visit form (#978)
    
    (feat) Added queue location to start visit form

[33mcommit 724dffb60cc3021a07afbee482a24f0b421f8f9f[m
Author: MUKOOVA JUMA <44743328+jumagit@users.noreply.github.com>
Date:   Mon Jan 30 23:42:37 2023 +0300

    (feat) Rename the `All visits` tab of the visits dashboard to `All encounters` (#971)
    
    * All visits tab to All encounters
    
    * Amend assertion
    
    ---------
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit b6e3bd9e1d0598f534fcd3ecde43d2b2ca48bf01[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jan 30 13:43:10 2023 +0300

    (fix) Remove bottom border from workspace header (#976)

[33mcommit 9fb13f87eb71f7919eb1a530e314f0d6cc779a9f[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Fri Jan 27 15:18:54 2023 +0300

    (chore) Bump @openmrs/ngx-formentry to get CVD calculation updates (#973)
    
    bump the form-entry-version in patient chart to get CVD calculation updates

[33mcommit 147f69842c25e11bcee52c5c706f366dff8a8564[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 25 14:13:32 2023 -0800

    (docs) Add link to design system documentation site (#970)
    
    Add link to design system docs

[33mcommit dc6bf89d075d15e692063c411fa8d18b7c98e231[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Thu Jan 26 00:28:24 2023 +0530

    (feat) O3-1810: Remove Recent Results widget from Pt Summary (#966)
    
    * Commented the recent results widget from patient summary
    
    * Delete commented out code
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 5422612cef8b4db6beb7f77587988956d898ee6e[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Wed Jan 25 21:35:08 2023 +0300

    (fix) Fix the tooltip UI shown when hovering over long names in the visit header (#954)
    
    * fixed the hover state on Full Name
    
    * css fixes
    
    * Fix Tooltip props and the HeaderGlobalAction menu's aria-label
    
    * Fix tests
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 26b12864852c020e8af31dced9ba8a1face9143c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 25 00:58:42 2023 -0800

    (fix) Fix incorrect dates on the vitals and biometrics widgets (#967)

[33mcommit 4f987774c58431d5a54f051fc962be437f8de17a[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 25 00:41:49 2023 -0800

    (feat) O3-1410: Conditions widget should filter conditions by status (#965)

[33mcommit a095a0560efc54df1066ac771e0872db4441bc73[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jan 24 04:49:27 2023 -0800

    (refactor) Derive isLoading state directly from SWR hooks (#963)

[33mcommit f9a2a41686c272fc98b9cee63b65365d912765c8[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Tue Jan 24 13:59:16 2023 +0300

    (Fixes):Pagination, multiple submissions and sorting patient chart appointments.(03-1765 & 03-1795) (#961)
    
    * Fix pagination to work well when tables are switched, Sort according to view state, Disable save button after first click
    
    * Increase mock data to fix tests
    
    * Increase mock data to fix tests

[33mcommit 30c6d1dd3725834e394603cd21894636ddf86043[m[33m ([m[1;33mtag: v4.0.1[m[33m)[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jan 24 00:12:17 2023 -0800

    (chore) Release v4.0.1 (#958)

[33mcommit a632d59033fdf49a17239172cd813cd3aacae0f7[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Mon Jan 23 17:13:10 2023 +0530

    (fix) O3-1780: Order Basket - Creates Drug Order Encounter even before Drug Order is saved (#962)

[33mcommit 937486fa6b0f41b4201b39a18cbd3d4fccc2ace6[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Mon Jan 23 15:42:27 2023 +0530

    (feat) O3-1766: Add Quantity Units in the Drug order form (#950)
    
    * Completed the initial setup
    
    * Updated translations
    
    * Added default values for various order units
    
    * Fixed linting and failing tests
    
    * Final changes
    
    * Cleanup
    
    * Changed the order config type on fetching
    
    * Updated translations
    
    * CSS Fixes

[33mcommit 663f76695e926f145125227a188094422ac41d84[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Jan 21 19:55:38 2023 +0300

    (chore) Bump swr to v2 (#960)

[33mcommit c2f0078f0a2e71382a1dfa72fcee601906fa56fd[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Sat Jan 21 15:24:14 2023 +0300

    (fix) 03-1640: Vitals and biometrics widgets do not display all observations (#959)
    
    03-1640: Fix Vitals and Biometrics widgets do not display all observations;

[33mcommit 7f687d2ca8875fc21b57caaf8524b7a903491ae3[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Sat Jan 21 00:51:01 2023 +0300

    (chore): Unable to view Notes and Type entered about Appointment.(03-1763 & 03-1782) (#957)
    
    * Add comment column
    
    * extract the comments from the provider array
    
    * translation
    
    * fix tests
    
    * add type column
    
    * update translations

[33mcommit df80ebd44750aecbad5c225655dcfb2960731bbe[m
Author: Emmanuel Nyachoke <achachiez@gmail.com>
Date:   Thu Jan 19 14:27:47 2023 +0300

    (chore) bump formentry to rename the helper extractObsValue to getObsFromControlOrEncounter and change behaviour (#956)

[33mcommit 4486d29468584e8f63c9f7488e25c1cfe0d60546[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Jan 19 12:18:48 2023 +0300

    enhanc: Add flex wrap capability on patient banner (#955)

[33mcommit 9864b621b6c8c1f9bd4128ee68fe3ab9968e6e5d[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Jan 18 17:41:44 2023 +0530

    Revert "(feat):Expected behavior for incomplete Order Basket [03-1087]" (#953)
    
    Revert "(feat):Expected behavior for incomplete Order Basket.[03-1087] (#894)"
    
    This reverts commit 1c234254c53a9aa7eac5c878738a49331f4dcb75.

[33mcommit 9de82e294a32e26c701768a6b1c51406dd8214ef[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 18 00:18:02 2023 +0300

    (feat) Add batch expansion to the visits table (#951)

[33mcommit 1c234254c53a9aa7eac5c878738a49331f4dcb75[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Tue Jan 17 23:15:21 2023 +0300

    (feat):Expected behavior for incomplete Order Basket.[03-1087] (#894)
    
    * Refactor code
    
    * Fix lint
    
    * Fix lint issues
    
    * Fix lint issues
    
    * Fix lint issues
    
    * Fix lint issues
    
    * Make notification more visible
    
    * Fix merge conflicts

[33mcommit dff6509a49221c34b60d40e779c7c5f79468596b[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Tue Jan 17 21:32:17 2023 +0300

    (feat) O3-1738: Show more than just ten items in conditions widget  (#947)
    
    * increase the number of conditions returned and paginate them
    
    * Remove pagination from the detailed view
    
    * fix tests
    
    * change count to 100

[33mcommit 918062924a34dd94cabc2da970d8f224afd37eac[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jan 17 21:30:36 2023 +0300

    (feat) Fix visits table pagination (#949)
    
    * (feat) Fix visits table pagination
    
    * Review feedback - rely on filteredRows as the source of truth on visit data

[33mcommit 7edd60602af9a5d8c2063c7581e785b04bda99d6[m
Author: Emmanuel Nyachoke <achachiez@gmail.com>
Date:   Tue Jan 17 09:35:53 2023 +0300

    (chore) Update to latest version of openmrs-ngx-formentry to add rawPrevObs datasource null check in extractObsValue (#948)

[33mcommit 316fe80b69911ecee8267d2fe08a74f76e145cc2[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Jan 17 10:50:40 2023 +0530

    O3-1747: Updated Drug Order Form UI for desktop and tablet as per latest designs (#945)
    
    * Completed the positioning of fields
    
    * Finalised form input spacings
    
    * Form layout for tablet fixed, removed unneccessary overrides
    
    * Large input boxes for tablet view
    
    * Fixed horizontal scroll
    
    * Sticking the medication info header
    
    * Added patient header in tablet view
    
    * CSS cleanup, final drug order form
    
    * Search results UI fixed
    
    * Fixes
    
    * Added scss variables and helper function cleanup
    
    * Cleanup
    
    * Linked related fields
    
    * Label corrections and tablet number inputs completed
    
    * Final changes
    
    * Updated translations

[33mcommit 9b0c21fbc6f180348d292511c76205b0f4ef6372[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Mon Jan 16 16:30:33 2023 +0300

    03-1761: Pt Chart tab: Default to "Upcoming Appointments" (#946)
    
    * Make upcoming appointments table to default
    
    * fix failing tests

[33mcommit f9ec29698b75d668603ccf8394f99ef74e7b8d27[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Sat Jan 14 17:08:54 2023 +0530

    (fix) Fixed the workspace's width for various window sizes (#942)
    
    Fixed the workspace's width for small desktop along with the minor changes

[33mcommit 567b0e988b5d724d1b32157b356445dcb116bd3e[m
Author: Emmanuel Nyachoke <achachiez@gmail.com>
Date:   Fri Jan 13 18:36:08 2023 +0300

    (chore) Update to latest version of openmrs-ngx-formentry to fix a null check in extractObsValue (#944)

[33mcommit e9dbb334624c8d797d27f0d3b2f602230469aa85[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Thu Jan 12 14:21:59 2023 -0500

    (chore) Update to latest version of openmrs-ngx-formentry to fix multicheckbox (#943)

[33mcommit ee9173e9cef4337b71278fc77936eec2c29e73aa[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Thu Jan 12 19:54:35 2023 +0300

    (fix): Properly pass the patient object datasource to the CVD calc (#941)
    
    properly pass the patient object to get sex and age for the CVD calc

[33mcommit 02fa306f399307473646f17ee862b0394a4955af[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Thu Jan 12 15:41:24 2023 +0000

    Allow editing a past encounter without having an active visit (#908)

[33mcommit b8d8323fa51da3eca1c3b3384ba6a06063e26a45[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Thu Jan 12 20:12:53 2023 +0530

    O3-1743: Fixed the discrepancies in the order basket and drug order form (#937)
    
    * Drug display values to fetched and to be displayed, sorting orders by date
    
    * Updated translations
    
    * Updated tests
    
    * Added lower case to search results

[33mcommit 22f87555dc974db9f12fbe58275500726741a7c2[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Thu Jan 12 13:58:20 2023 +0300

    (bug fix): Free text dosage drug ordering not working as expected.[03-1744 and 03-1746] (#940)
    
    * fix the null dosage in free text drug order
    
    * fix the null dosage in free text drug order signing, modifying and discontinuing

[33mcommit 914acf0ef86c05ea710fd761a3cd5aaaeab2b9bc[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Thu Jan 12 02:00:55 2023 +0300

    Hover state: Show full name on hover (#939)
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>

[33mcommit 9223fd15cb8a1006b3408371640a500abeca9203[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 11 16:59:24 2023 +0300

    (feat) Visual enhancements to the forms widget (#929)
    
    * (feat) Visual enhancements to the forms widget
    
    * Review feedback

[33mcommit cdbfbd78755bcdbe4c4660200f9389e35eaa90a8[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Wed Jan 11 16:18:25 2023 +0300

    (bug fix): Fix sign and close drug order (#938)
    
    * fix the sign button and the null display
    
    * Arrange translation

[33mcommit a2b333984fe56f1493f67f4ecc22a24e04a4248b[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 11 07:48:07 2023 +0300

    (chore) Bump @openmrs/ngx-formentry (#936)

[33mcommit 32e82fd59edda9553f16c1d0cf5808de9367c72c[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Tue Jan 10 14:13:51 2023 -0500

    (fix) Restore usePatientOrOfflineRegisteredPatient hook (#826)

[33mcommit f7de75d73c41b1c24316f5f2fcdc5a941c12f697[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Tue Jan 10 01:09:00 2023 +0300

    Rename Orders page to Medications (#931)

[33mcommit 05368a719d2559840cdb53bbf5ee17a610a5a973[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jan 9 22:44:37 2023 +0300

    (chore) Bump @openmrs/ngx-formentry (#935)

[33mcommit cdee974e1a8215bd98234a472b5d9864ec101bd3[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jan 9 22:18:29 2023 +0300

    (test) Fix tests failing due to inconsistent whitespace (#934)

[33mcommit 38d008dbb56c7a53f86186c90a5634ece41da808[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jan 9 14:38:49 2023 +0300

    (chore) Install interactive tools plugin (#909)

[33mcommit 332f9013381212ffed1a794afc97cfc5d59bccc3[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Mon Jan 9 13:34:20 2023 +0300

    (fix): Order basket workspace not closing when a patient changes.(O3-1715) (#930)
    
    * add patient uuid to saved drug order
    
    * add patient uuid to saved drug order
    
    * tweak tests
    
    * fix the issue of null dosageForm
    
    * add patientUuid to store
    
    * tweak tests
    
    * some tweaks

[33mcommit d93ab9096f1d7ab278ee2885aa0e229381ed560f[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Jan 6 01:25:05 2023 +0300

    (chore) Setup remote caching for pre-release and release jobs (#924)

[33mcommit 2953cf6d30320566393e46f8b15a802d66c3d5ab[m
Author: icrc-agomes <106243905+icrc-agomes@users.noreply.github.com>
Date:   Thu Jan 5 15:33:28 2023 +0000

    O3-1617: location_id is not saved in encounter while saving a form  (#913)
    
    Changes that were mentioned on community review
    
    Co-authored-by: Andre Gomes <Andre.Gomes@emea.merkleinc.com>

[33mcommit 5fafe919c8118ca99569951f8803bdebbe75dad3[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Jan 3 23:31:06 2023 +0530

    O3-1713: Order basket drug search implemented with SWR (#922)
    
    * Implemented Drug order and template search with SWR
    
    * Code cleanup
    
    * Updating the tests and deleted unused mock data from medications.mock.ts
    
    * Review changes
    
    * Minor improvements
    
    * Added empty state for drug search and review changes
    
    * Updated translations
    
    * Empty state tile background fix
    
    * Order basket item display drug name
    
    * Updated the error state for fetching the results
    
    * Final changes
    
    * Drug search results are now scrollable

[33mcommit dd9d2a7ecd0dd02078188a38d257d070986d5ad9[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Tue Jan 3 18:24:24 2023 +0300

    (copy changes): Change the search order place holder to sync with the mocks.[03-1714] (#923)
    
    * small improvement to the drug ordering
    
    * small improvement to the drug ordering

[33mcommit a2384747cfb1c86ee5c01f79c706efe08e1d22df[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Jan 3 17:26:10 2023 +0530

    O3-1671: Order encounters should be matched with current visit (#911)
    
    * Order basket: Encounter will be created when submitting an order
    
    * Added and resolved test cases
    
    * Fix: Orders must be mapped to single encounter
    
    * Added actionable notification when there is not an active visit
    
    * Minor fix
    
    * Added check for an active visit when opening order basket
    
    * Added necessary dependencies
    
    * Created a common hook for launching order basket
    
    * Fixed failing tests
    
    * Improvements in launch order basket hook

[33mcommit 6b95f0dee344ec3f5e1ee8e73ad0201ab6d68565[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Dec 22 20:18:09 2022 +0300

    (chore) Leverage remote caching in bundle size workflow (#917)
    
    * (chore) Leverage remote caching in bundle size workflow
    
    * Trigger second action run

[33mcommit 9e43f37bddf0ac8b98f0dab71bc5012da7960cb3[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Dec 22 20:17:19 2022 +0300

    (chore) Factor out environment variables (#916)
    
    * (chore) Factor out environment variables
    
    * Apply suggestions from code review
    
    Co-authored-by: Ian <52504170+ibacher@users.noreply.github.com>

[33mcommit 213b023ea456ca586729613a5b72b03817e0bdeb[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Dec 22 16:43:54 2022 +0300

    (refactor) Code improvements to the Conditions widget (#918)
    
    * (refactor) Code improvements to the Conditions widget
    
    * Review feedback
    
    * Temporarily fix annoying test
    
    * More tweaks

[33mcommit 7939c087494ce71dd8ba26e56f002490fb5340a0[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Thu Dec 22 17:59:54 2022 +0530

    (feat)Replaced dose's combo input with a number input (#895)
    
    * Replaced dose's combo input with a number input
    
    * Final changes
    
    * Drug order template should pass default dosage value in number in the order form
    
    * Review changes

[33mcommit 27198297f0af6804cbe51f83c08d09ee13e32522[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Dec 21 15:58:42 2022 +0530

    (fix)Showing the drug strength and drug dosage form in drug search results should be optional (#920)
    
    Made the drug strength and drug dosage form optional

[33mcommit 8d086ad88fb2ae1b9516887ebdeb69b7b913a83e[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Dec 21 15:27:54 2022 +0530

    (fix) Medication search results should show Drug's display value instead of Drug's concept's display value (#919)

[33mcommit 0e18173ea85093c4ff846726a1a3b4b8e9620a44[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Tue Dec 20 18:30:38 2022 +0300

    feat:(form-app) mostRecentObsValueBefore data source in form-entry (O3-1661) (#903)
    
    Co-authored-by: Ian <ian_bacher@brown.edu>

[33mcommit 9c73abaaac1e13ad18bcd50828e3ddd37bde6ee7[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Dec 20 16:40:34 2022 +0530

    OZ-52: (fix) Fixed the failing test results viewer when leaf.obs is undefined (#910)
    
    * Fixed the failing when leaf.obs is undefined
    
    * Fixed the ambigous types
    
    * Changed variables to const and review changes
    
    * Created LowestNode Type

[33mcommit 079254a89ded1f479f7399a3601ad09e4cf91a3f[m
Author: Daniel Marczydło <daniel.marczydlo@gmail.com>
Date:   Tue Dec 20 11:05:11 2022 +0100

    O3-1648 Tweak appearance of the Recent Results widget tooltip (#915)

[33mcommit c672ade0511182619872b786df6303e22dc3e2f7[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Dec 16 22:50:59 2022 +0300

    (fix) Form entry loading regression in fast data entry app (#912)
    
    * (fix) Form entry loading regression in fast data entry app
    
    * Tweak check
    
    * Update packages/esm-form-entry-app/src/app/fe-wrapper/fe-wrapper.component.ts
    
    Co-authored-by: Ian <52504170+ibacher@users.noreply.github.com>
    
    Co-authored-by: Ian <52504170+ibacher@users.noreply.github.com>

[33mcommit 47e20b46209fe09da3762f431f6fffbb8be33a79[m
Author: icrc-agomes <106243905+icrc-agomes@users.noreply.github.com>
Date:   Thu Dec 15 11:28:09 2022 +0000

    O3-1328: (fix) Configure default view for the obs-by-encounter widget (#907)
    
    Co-authored-by: Andre Gomes <Andre.Gomes@emea.merkleinc.com>

[33mcommit 6cc149b6450e77a703df3f94140c05b4e8d6a517[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Thu Dec 15 16:53:17 2022 +0530

    O3-1633: Restore prescription duration and dispensing info sections to medication order form (#890)
    
    * Restored duration and dispensing sections in the medication order form
    
    * Updated translations
    
    * Lint fixes
    
    * Minor fixes
    
    * Inline notification if error on fetching duration units
    
    * Review changes

[33mcommit 89312721690ae8bcb71db21c749bcc4bf1640485[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Thu Dec 15 11:01:05 2022 +0000

    (chore) upgrade form engine version (#904)
    
    * (chore) upgrade form engine version
    
    * ngx-translate/core dependency added

[33mcommit 7bc9d5f6f86b62822f5ba4f4bbd41c635719ed85[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Dec 14 14:45:41 2022 -0500

    feat:(form-entry-app) Use conceptreferences endpoint (O3-1658) (#901)
    
    🤞

[33mcommit fcc65ead4d8f39ec531efc7d31ed9922df34aeed[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Dec 14 09:19:25 2022 -0500

    (fix): Delay loading cause of death concepts (O3-1697) (#900)

[33mcommit fb906ce0c5a79a70eb5059cc33f77477ae571542[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Dec 14 17:11:08 2022 +0530

    O3-1670: Show strength and dosage form for order basket search results  (#906)
    
    * UI fixes and added dosageForm to the drug name when searching
    
    * Changes related to test cases
    
    * Test fixup
    
    * Cleanup
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 21a6e2f4a79ff666976b755c509b3b7694c6f881[m
Author: icrc-agomes <106243905+icrc-agomes@users.noreply.github.com>
Date:   Wed Dec 14 11:40:51 2022 +0000

    Added interpretation slot on the config-schema in esm-generic-patient-widgets-app (#886)
    
    Co-authored-by: Andre Gomes <Andre.Gomes@emea.merkleinc.com>

[33mcommit d6d7c6a057404f2593de1972e1b596ccaff94a68[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Dec 13 22:36:11 2022 +0530

    (fix)Side menu should be visible for large-desktop and hidden for tablet and small desktop (#905)
    
    * Hiding the side menu and showing the hamburger for small desktop
    
    * Minor fixes

[33mcommit cf9748a5326d424e8a72f50cf61f591bc08419b0[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Dec 13 15:40:46 2022 +0530

    O3-1635: Test results viewer: Search in panel view (#902)
    
    * Added searching in the panel view
    
    * Completed the work on tablet and desktop designs of searching through panels
    
    * Minor fixes

[33mcommit 363c6209a2dcf923c399d7191f5266062f2140d9[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Mon Dec 12 19:37:22 2022 +0530

    (chore)Visit attributes translation fix (#899)
    
    Visit attributes translation fix

[33mcommit 4500a6191376445cc0b4710c642cbd5bfdb1fa33[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Mon Dec 12 16:51:50 2022 +0530

    O3-1634: UI Fixes for Test results viewer in Tablet and Small Desktop (#893)
    
    * UI changes for tablet view
    
    * UI refinements
    
    * Upated translations
    
    * Removed the Grid, Column due to the breaking UI for small desktop
    
    * Removed the trendline link if the result value is a string value
    
    * Review changes
    
    * Cleanup

[33mcommit 0610b429f13e72e691c7bef24333fca5f1a289ea[m
Author: Daud Kakumirizi <dkakumirizii@gmail.com>
Date:   Mon Dec 12 11:08:06 2022 +0300

    03-1627: Delete attachments component close button should be functional (#898)
    
    * 03-1627: Delete attachments component close button should be functional
    
    * sanity

[33mcommit 1ce78c8a78e33f6668fd901d61f6bfb23966a89c[m
Author: Daud Kakumirizi <dkakumirizii@gmail.com>
Date:   Fri Dec 9 20:19:53 2022 +0300

    03-1627: Attachements upload modal should be able to close (#896)

[33mcommit e7b3b15136381b01ecf83b491f8b9104670c3cd9[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Wed Dec 7 13:15:15 2022 +0000

    (fix) Explicitly process change detection and its side-effects on form action (#873)
    
    Co-authored-by: Zac Butko <zac.butko@gmail.com>

[33mcommit 5949014bf8ee8afe253335dbb530454b62ebc6aa[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Tue Dec 6 10:09:05 2022 +0300

    (refactor) Added ability to configure vitals app in vitals header (#891)

[33mcommit ffc147045c0e3459a9fe89806e18c32fdbeaf34a[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Fri Dec 2 18:53:55 2022 +0300

    Remove the yarn start-all script (#892)

[33mcommit 05a390c549974a98f20aba408b8fa0b33810e752[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Nov 29 11:23:18 2022 +0530

    O3-1641: Ability to display configurable visit attributes as tags on patient header (#887)
    
    * Added visit attribute banner tags
    
    * Added config prop 'displayInThePatientBanner' along with default values for visitAttributeTypes
    
    * Code cleanup
    
    * Updated the config description
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>
    
    * Improved the case clauses
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 368241274b72357156b44dbe77b6461718aa70f7[m
Author: Romain Buisson <rbuisson@users.noreply.github.com>
Date:   Mon Nov 28 15:16:52 2022 +0100

    Add Khmer translations (#888)
    
    * Add Khmer translations
    
    * Apply suggestions from code review
    
    Co-authored-by: Ian <52504170+ibacher@users.noreply.github.com>

[33mcommit a84ca4fb6c472362ba4de9692f5257e89f6dbb8b[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Tue Nov 22 19:33:16 2022 +0300

    03-1623: Visit Notes widget: Items are ordered by date incorrectly. (#885)
    
    * add custom sorting to visit notes
    
    * cleanup appointments translations
    
    * pr review

[33mcommit 99ec95058f49eabfe125e813436f6bdabee2e8cb[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Nov 22 16:51:50 2022 +0530

    O3-1592: Support adding visit attributes when saving a visit (#879)
    
    * Saving visit attributes completed
    
    * Fixed the visitAttribute value for date type
    
    * Fixing failing tests
    
    * Fixed the datatypes, error handling for required fields
    
    * Updated translations
    
    * Added types in the functions
    
    * Updated the openmrs and @openmrs/esm-framework
    
    * Minor changes

[33mcommit 5ea07c4b6ef696cfb5a86a7eb6e864d05b681162[m
Author: icrc-agomes <106243905+icrc-agomes@users.noreply.github.com>
Date:   Mon Nov 21 21:10:38 2022 +0000

    Fixed extension slot declaration in esm-generic-patient-widgets-app (#884)
    
    Co-authored-by: Andre Gomes <Andre.Gomes@emea.merkleinc.com>

[33mcommit 2ab293ae419873aa50427b79f1b419a00fac7636[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Mon Nov 21 09:36:42 2022 +0000

    (feat) Add configuration to disable empty sections (#825)
    
    * add configuration to hide empty sections
    
    * update tests filter function to use useMemo
    
    * Update packages/esm-patient-chart-app/src/config-schema.ts
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>
    
    * fix lint error in config-schema
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit edf37ae8de51126a99095abd0c5cc782d1d7cb47[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon Nov 21 11:30:53 2022 +0300

    feat: Add current date appointments and fix issue with displaying past and upcoming appointments (#867)
    
    * feat: Add current date `today` appointments tab
    
    * Add translation
    
    * Fix failing test
    
    * fix failing test

[33mcommit 8b4c1b8313c1f2fb831796682aba3c04cf3081e5[m
Author: Yemitan Isaiah Olurotimi <isaiah.yemitan@commercetools.com>
Date:   Fri Nov 18 16:05:11 2022 +0100

    O3-1626: Cleanup the patient chart appointments form (#883)
    
    * refactor: remove service type input and state from appointments form
    
    * refactor: remove service type related tests
    
    * refactor: remove service type from translation file

[33mcommit e7c4d8ce764e9138f71ee5aa87a2f90c673b94f8[m
Author: icrc-agomes <106243905+icrc-agomes@users.noreply.github.com>
Date:   Thu Nov 17 21:08:22 2022 +0000

    (feat) Add ability to filter observations in the generic patient widget app by encounter type (#854)
    
    * Filter by encounter types implemented in observation endpoint on esm-generic-patient-widgets-app 2#
    
    * esm-generic-patient-widgets-app mock data for testing changed
    
    * Changes made in variables, tests and data structure
    
    Co-authored-by: Andre Gomes <Andre.Gomes@emea.merkleinc.com>

[33mcommit 885ef104b61ea77ce9237e5861bc122a0a464361[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Thu Nov 17 14:10:02 2022 +0300

    (refactor) Display the queue name in the visit header (#878)
    
    (refactor) Display queue name instead of service name in service queue visit header

[33mcommit 58a63603c084a57f4798b6f57c24cd54b250badd[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Thu Nov 17 14:08:39 2022 +0300

    Bump moment from 2.29.3 to 2.29.4 (#876)
    
    Bumps [moment](https://github.com/moment/moment) from 2.29.3 to 2.29.4.
    - [Release notes](https://github.com/moment/moment/releases)
    - [Changelog](https://github.com/moment/moment/blob/develop/CHANGELOG.md)
    - [Commits](https://github.com/moment/moment/compare/2.29.3...2.29.4)
    
    ---
    updated-dependencies:
    - dependency-name: moment
      dependency-type: direct:production
    ...
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Signed-off-by: dependabot[bot] <support@github.com>
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit 6af19736a7caa1e48013e2b7fad5067f6c13992d[m
Author: icrc-agomes <106243905+icrc-agomes@users.noreply.github.com>
Date:   Thu Nov 17 11:07:58 2022 +0000

    Possibility to add an ExtensionSlot under graph (#848)
    
    Possibility do add an ExtensionSlot under graph
    
    Co-authored-by: Andre Gomes <Andre.Gomes@emea.merkleinc.com>

[33mcommit a313837e319bca52e1ab769e07a459db6fa9f859[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Thu Nov 17 11:14:23 2022 +0300

    O3-1614: Add configurable queue entry fields to the start visit form (#870)

[33mcommit 6dcb94693937127edf9f8f1cd0d1a32355d5d768[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Wed Nov 16 11:11:58 2022 +0300

    (refactor) Added ability to launch vitals form from form entry app (#871)

[33mcommit cc93ee029a2c843e2b5df4fe804fd9c38df6331e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Nov 16 00:20:01 2022 +0300

    O3-1586: Fix the identifiers UI in the patient banner (#875)

[33mcommit a88abfec16f1be50c8445aaebb9aef03871e1a0e[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Nov 15 16:16:17 2022 -0500

    (fix) Remove redundant webpack dependency; minor fixes to obs-by-encounter widget schema (#749)
    
    * (fix) Remove redundant webpack dependency; minor fixes to obs-by-encounter widget schema
    
    * Resolve conflicts and update yarn.lock
    
    * run yarn to update the yarn.lock
    
    * reorder the translations
    
    Co-authored-by: hadijahkyampeire <hadijah315@gmail.com>

[33mcommit 1de8b4cc83ec14cf6e6f4850160a8b1fb18ac5b4[m
Author: icrc-agomes <106243905+icrc-agomes@users.noreply.github.com>
Date:   Mon Nov 14 21:10:59 2022 +0000

    Added possibility to display Graph view by default through the configuration (#823)
    
    Co-authored-by: Andre Gomes <Andre.Gomes@emea.merkleinc.com>

[33mcommit 210af6eab9ed9d18ff1affce5412073041798f64[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Mon Nov 14 23:59:18 2022 +0300

    O3-1416: Fix error upon submission of vitals form  (#832)
    
    * make weight not a requred field upon form submission
    
    * Fixtests
    
    * Translate statusText
    
    * Reverting previous commit
    
    Co-authored-by: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>

[33mcommit 20d7e3a1983a0e0cd2e4448d2ed8c3f21736c200[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Nov 14 22:22:12 2022 +0300

    (feat) Remove top border from pagination component (#872)

[33mcommit 8011b4ef650bbdd5ed927a76a694e594249f9c8b[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Mon Nov 14 22:39:27 2022 +0530

    O3-1613: UI improvements in the orders view (medication orders) (#869)
    
    * UI fixes in the medications
    
    * Fixed failing tests
    
    * Changed green tooltip provider to icon as per designs
    
    * Review changes

[33mcommit 0a80cfe52f72d998c546eae248b4b407c590e668[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Mon Nov 14 22:32:55 2022 +0530

    O3-1552: Drug Orders multiply dosage dangerously and other small fixes (#863)
    
    * Fixed drug dosage, added orderType to Drug for medications
    
    * Fixed failing tests
    
    * Reverting drugOrder UUID changes
    
    * Minor cleanup
    
    * Reverting yarn.lock
    
    * Reverting yarn.lock
    
    * Reverting UI changes from the PR
    
    * Removed getDosage implementations
    
    * Cleanup
    
    * Minor fix
    
    * Conditional chaining to avoid issues

[33mcommit e7c2f81bd19a8c6ad6eede7c54e36873535c1de3[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Mon Nov 14 21:28:13 2022 +0530

    O3-1612: Medications tables should only fetch drugOrders. (#868)
    
    Medications tables should only fetch drugOrders only

[33mcommit 244864c7a90bc9dc7d53eab3217de2267279153c[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Mon Nov 14 16:19:53 2022 +0300

    O3-1589:Refactor code on the visit form (#861)
    
    * O3-1589:Refactor code on the visit form
    
    * fixed_prettier error
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>

[33mcommit 17279569cc0c4e45cc45586f31e458c6dc7fa25d[m
Author: icrc-agomes <106243905+icrc-agomes@users.noreply.github.com>
Date:   Fri Nov 11 20:35:52 2022 +0000

    Restore normal display to diagnoses in past-visits-component (#857)
    
    * Restore normal display to diagnoses in past-visits-component
    
    * Change mock data to match new development
    
    Co-authored-by: Andre Gomes <Andre.Gomes@emea.merkleinc.com>

[33mcommit 583c16c07aa50177ae2941168cff331773b5c22c[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Fri Nov 11 16:21:39 2022 +0300

    (feat) Arrange visit notes in reverse chronological order (#866)
    
    * order visit notes descending by date
    
    * Move sorting logic to resource
    
    * Fixes
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 952a0512bba7e6d658b798348464aad29eb07ff6[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Fri Nov 11 12:15:05 2022 +0000

    (feat) Filter offline form list according to user privileges (#840)
    
    Filter offline form list according to user privileges

[33mcommit 51414c5652ce4613121b66f8fa8ab3ed68f7fee0[m
Author: Samuel Male <samuelsmalek@gmail.com>
Date:   Fri Nov 11 15:10:51 2022 +0300

    (fix) Fix hanging search operation for instances without Order Template support (#849)
    
    Fix hanging search operation for instances without Order Template support

[33mcommit 47de6a7813778f9abb7f68c0f46167b722ec019e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Nov 11 14:58:28 2022 +0300

    (docs) Add Troubleshooting section (#864)
    
    * (docs) Add Troubleshooting section
    
    Adds a Troubleshooting section to the README with instructions for developers should they need to fix their dev environments.
    
    * Add link to dev3 environment

[33mcommit 6c4f28cbf1e53d5d0af6932b219df78b62054e42[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Fri Nov 11 14:55:05 2022 +0300

    (improvement) Added configurable start visit label in patient chart (#865)
    
    (improvement) Added configurable start visit label

[33mcommit f4fe313a56d3526921d2a5725b1863c4dc5d5737[m
Author: Emmanuel Nyachoke <achachiez@gmail.com>
Date:   Thu Nov 10 17:41:12 2022 +0300

    Add formFieldNamespace,formFieldPath to getEncounterByUuid to support this change in https://github.com/openmrs/openmrs-ngx-formentry/pull/8 (#839)

[33mcommit a7acdb735ed3b294e134da74f630c9c534ddf87d[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Thu Nov 10 14:38:25 2022 +0000

    Support for rendering values from older to newer on generic widgets (#813)

[33mcommit e2a3210b818bfd91e58f1a5aace326cad7d1f033[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Nov 10 17:36:50 2022 +0300

    (feat) Add enrolment location empty state display (#862)

[33mcommit 294f9904bcf592cefcaa07ec7c83a1c168fc20d5[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Nov 10 16:48:19 2022 +0300

    (fix) Reorder items in ProgramsOverview card header (#858)

[33mcommit 7d1330aa7de219172b0b7f23d46b4e80fe33c3fd[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Nov 10 01:36:18 2022 +0300

    (fix) Tweak the empty state text showed when filtering encounters (#860)
    
    * (fix) Tweak the empty state text showed when filtering encounters
    
    * Add spec that tests the search functionality
    
    * Extend changes to the VisitTable component

[33mcommit 32337bad5141075d4b9f911d8da926e533812b2f[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Wed Nov 9 11:42:27 2022 +0300

    (fix) Arrange encounters in the visits summary in reverse chronological order (#859)
    
    * add dateTime to encounters table and style the <p>
    
    * add dateTime to encounters table and style the <p>
    
    * add dateTime to encounters table and style the <p>

[33mcommit 3f682e31514bfef3ac861de76833ac63aabcc2a7[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Nov 5 19:36:39 2022 +0300

    (chore) Set `minimum-change-threshold` value (#855)
    
    Sets a minimum file change threshold of 10 kb for the bundle size reporter so the action doesn't report on tiny changes.

[33mcommit c9aec01af0083240f2aa4722b0ef23ee7e417519[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Sat Nov 5 01:53:10 2022 +0300

    03-1578: Patient chart background changes to dark grey when the window size is expanded. (#856)
    
    Override the active overlay gray background

[33mcommit bdbfc9b2a179af6b421a9860ea97dfb3dfd7ca27[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Thu Nov 3 16:04:15 2022 +0300

    03-1566: Left Nav Highlight disappears on click and is stuck on 1st page (#851)

[33mcommit 578d35032926c4577cfe987fd82f6a9a19a70d74[m
Author: CynthiaKamau <cynthiakamau54@gmail.com>
Date:   Thu Nov 3 10:48:36 2022 +0300

    (fix) Show queue patient is in even when name is truncated (#852)

[33mcommit b6106e657fbbb771def616190a20a1391b64d8b7[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Nov 2 11:20:02 2022 -0400

    (chore) Update form entry to -pre.68 (#853)

[33mcommit 59019da567c72f26b9a348b87f47e443fd982ac7[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Nov 2 15:06:51 2022 +0300

    (chore) Change bundle size workflow event trigger (#838)
    
    Shot in the dark trying to figure out why the compressed-size-action is not computing bundle size changes between pull requests. From my sleuthing, it appears as though the action is not correctly switching between the PR and the base branches. So it's basically ending up comparing built artefacts from the same branch 🤦🏼

[33mcommit e27065897b506517ed0d0fec1ee133be42b750dd[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Tue Nov 1 21:01:50 2022 +0300

    (chore) Bump @openmrs/ngx-formentry to the latest version (#850)
    
    * upgrade formentry
    
    * change form renderer to ofe-form-renderer
    
    * (chore) upgrade form engine version
    
    Co-authored-by: Ian <ian_bacher@brown.edu>

[33mcommit 4dc6a972ffcd1b067ebeb02c17d4a5576ae04767[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sun Oct 30 18:54:01 2022 +0300

    (chore) Upgrade `esm-form-entry-app` to Angular v12 (#845)

[33mcommit 2d718229c97106eba30b3fd61c0a2f67993ce0c2[m
Author: Gabriel Mbatha Ngao <gabriel.mbatha@gmail.com>
Date:   Tue Oct 25 20:09:07 2022 +0300

    adding current patient service queue on patient summary header (#834)
    
    (feature) Added current queue patient is in in the visit header

[33mcommit ea213dade323b59e03288d19ff2ce6d8581d06de[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Oct 24 11:38:38 2022 +0300

    (chore) Bump turborepo (#836)

[33mcommit 0ecd9a45c852a2236d2807846fe2ab5796027719[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Fri Oct 21 00:53:06 2022 +0300

    03-852: Ability to Mark Patient Deceased v2 (#844)
    
    * create recovery point (not working)
    
    * make get requests work
    
    * make it work
    
    * clean code
    
    * - Tweak handling of deceased and alive
    - Add confirmation modals before saving
    
    * extract translations
    
    * correct translation
    
    * pr reviews
    
    * fix-typo
    
    Co-authored-by: jnsereko <nserekojowashi@gmail.com>

[33mcommit ffff9e47178c0e33e45106af6e122863f26b5edf[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Thu Oct 20 16:04:17 2022 +0300

    Refactor code on the Appointments form (#847)
    
    * Refectored the code on the Appointments form
    
    * DatePicker_select code refactor
    
    * Remove unnecessary space
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>

[33mcommit 1b0a489b702e805005524127466c5ca8b0a404e4[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Oct 19 14:49:18 2022 +0530

    Added units in the test results viewer and different value types to correctly display coded and text test results  (#846)
    
    * Added units in the test results viewer and different value types
    
    * Review changes

[33mcommit 39a9dd30fc9ced3d06df75e8f0f8e0c9786853c4[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Tue Oct 18 22:43:30 2022 +0300

    code_refactor on Program form (#843)
    
    * code_refactor on Program form
    
    * Fixed_pretter error
    
    * made_select avariable
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>

[33mcommit e9bee56851393e0f1312785a8486864d898619d9[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Mon Oct 17 23:36:48 2022 +0530

    (chore)Husky fix: Replaced prepare with postinstall (#841)
    
    Replaced prepare with postinstall

[33mcommit 47a14bf2a2fe1ad9af6d9724894bbe2047c82e31[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Fri Oct 7 08:50:21 2022 -0700

    (feat) Configure Show All Encounters (#837)
    
    * Visits and Encounters load separatetly on Visits page
    
    * Factor out EncountersTableLifecycle, add config schema
    
    * Fix tests

[33mcommit 49dddcbbcd1bc2eacb064bb51929a834c8135d4f[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Fri Oct 7 06:25:33 2022 -0700

    Revert force push

[33mcommit 3f73a6561a11acdb76e04bc8092b31a0f8362f47[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Fri Oct 7 05:55:49 2022 -0700

    Fix tests

[33mcommit a98b6819192fe14edd6b6aa9e0e2d3c5244b40e9[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Fri Oct 7 05:18:01 2022 -0700

    Factor out EncountersTableLifecycle, add config schema

[33mcommit d4a3911207fbedf234d59539c62e4dbd2c7cf10f[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Fri Oct 7 04:39:48 2022 -0700

    Visits and Encounters load separatetly on Visits page

[33mcommit 4ab20f8d56a5f9ce43aead053e3bd7cbee9a09e2[m[33m ([m[1;31mupstream/feat/show-all-encounters[m[33m)[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Oct 5 16:01:19 2022 -0400

    Update config-schema.ts (#835)

[33mcommit aa21f549d6e0045556eb42a0b2ece48ea80da84b[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Oct 5 08:41:45 2022 +0300

    Add identifier name to patient-banner (#829)
    
    * Add identifier name to patient-banner
    
    * fix broken test

[33mcommit a4b0105f88f437001f90554c41a320f691ad0258[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Sun Oct 2 09:24:58 2022 +0530

    Test results viewer: Panel View (#828)
    
    * Added search bar to the test results viewer, added panel view
    
    * Added usePanelData
    
    * Created a panel view and separated the Panel views and Tree views
    
    * Added panel header and fixed the errors
    
    * Added view for empty observations/panels
    
    * Panel timeline added
    
    * Refined UI for panel view
    
    * Added trendline view to panels
    
    * Updated translations
    
    * Updated yarn.lock
    
    * sync yarn.lock to fix build
    
    Co-authored-by: Zac Butko <zac.butko@gmail.com>

[33mcommit a29fed2bad3ea6c10f0b2dd4f154e5f558c56d11[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Sep 30 13:05:57 2022 +0300

    bug: fix bug with past appointments missing `appointment location` (#824)

[33mcommit cf304674048cb131fd40f810d8eca2b69c60b6f1[m
Author: icrc-agomes <106243905+icrc-agomes@users.noreply.github.com>
Date:   Thu Sep 29 20:19:01 2022 +0100

    Show visit end date on visit view if visit has ended (#818)

[33mcommit 167d8726da141b2eb4a74a61461f3ef1a15cd04e[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Wed Sep 28 15:35:26 2022 +0100

    Support to hide the add button on programs widget (#815)

[33mcommit bce6ceb09560148f0d9cf6fc01b9033a44986526[m
Author: Jose Francisco <94977371+icrc-jofrancisco@users.noreply.github.com>
Date:   Wed Sep 28 15:20:56 2022 +0100

    O3-1534: Prevent error when patient is undefined on patient-banner (#822)

[33mcommit 9cd4f6690169d50b9c549e92cb655e3b1c631d33[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Wed Sep 28 05:03:07 2022 -0700

    (feat) Show All Encounters Table (#816)
    
    * scaffold encounter resource
    
    * move encounter-list to visits-table
    
    * EncountersTable stable, working ok
    
    * translation
    
    * test for encounters-table

[33mcommit 41a9b835ac8a4a9d4790d7b6a0620d7f7a2ef737[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Tue Sep 27 13:52:57 2022 -0400

    (chore) Change deploy process to trigger Bamboo build (#817)

[33mcommit a3dfe67eeea0e96cfb822ca07fe2f33d5806f30b[m
Author: icrc-loliveira <68058940+icrc-loliveira@users.noreply.github.com>
Date:   Mon Sep 26 15:09:00 2022 +0100

    O3-1281: Visit Note - Add Ability to Mark Primary and Secondary Diagnoses (#757)

[33mcommit 860283e200996f87c42c23ca0d5d4f8abf060aab[m[33m ([m[1;33mtag: v4.0.0[m[33m)[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Tue Sep 20 15:48:42 2022 -0400

    (fix) upgrade form-entry-app to use latest version of ngx-formentry (#812)

[33mcommit 7cb5945003f2a02e7a1db6d0b88fbee490921337[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Sep 20 11:40:27 2022 +0300

    enhancement: Add identifier type name alongside value on patient-banner (#807)
    
    * enhancement: Add identifier type name alongside value on patient-banner
    
    * fix failing patient-banner-test

[33mcommit 58ffc68f2b18a3158578f779f3d0889786a80e62[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Sep 20 11:18:10 2022 +0300

    (chore) Track bundle sizes using `compress-size-action` (#811)
    
    * Track bundle size changes using compress-size-action
    
    Sets up the [compress-size](https://github.com/marketplace/actions/compressed-size-action) GitHub action for reporting bundle size changes for each pull request. This replaces the existing `@jsenv/file-size-impact` workflow with the hope that this new library will work more reliably in our setup.
    
    * Trigger workflow manually to set up the first run
    
    * Restore workflow trigger to pull_request_target
    
    * Setup repo-token and minimum change threshold

[33mcommit ca28dda90a05c6f1a0f7bc8e81c9d0a7fba7f861[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Sun Sep 18 15:01:20 2022 -0400

    (fix) Adds the correct version number for the form-entry-app (#810)

[33mcommit fe7c8ceeeaec2ad1f9101a1024e09eeea16d39da[m
Author: Romain Buisson <rbuisson@users.noreply.github.com>
Date:   Thu Sep 15 14:13:06 2022 +0200

    Setup Transifex (#809)

[33mcommit d3d9547258f058f351a9b1d22906c97e3f2134c8[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Thu Sep 15 05:12:39 2022 -0700

    (feat) Manually Trigger Form Validation (#808)
    
    Manually trigger just the validation

[33mcommit 5f1b15833ddb880d321702b382dc7b32c7034f81[m
Author: Samuel Male <samuelsmalek@gmail.com>
Date:   Tue Sep 13 11:14:20 2022 +0300

    (fix) Medication.durationUnits as a nullable attribute notably for synthetic data entry (#801)
    
    (fix) Medication.durationUnits as a nullable attribute notably for synthetic data

[33mcommit 4ba6aa6f1e62a028d72db8eec2aceede96910cb2[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Tue Sep 13 04:12:39 2022 -0400

    (chore) run pre-release before deploy (#805)
    
    * (chore) run pre-release before deploy
    
    Also patches some unnecessary dependencies
    
    * stick to Node 16 for now

[33mcommit 2e14e1e40b950b9bbd893ba0e824a723ca3bac22[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Fri Sep 9 15:01:11 2022 +0300

    fix: Update translations with gender translations. (#804)
    
    - update translations with gender translations

[33mcommit 4270942185c52426f565180a955a3918c8a12567[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Thu Sep 8 23:19:48 2022 +0300

    Hotfix: Use proper translation for gender (#803)
    
    - Use proper translation for gender

[33mcommit 1c57c62cbbdd26d4e74513584e18f02c7ee73dae[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Thu Sep 8 13:05:24 2022 -0400

    (chore) upgrade to latest @openmrs/ngx-formentry version (#802)

[33mcommit ade7330fbc8f7cbb9ad078b2290af03f654b8732[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Thu Sep 8 15:47:24 2022 +0300

    move visit header and patient banner to patient chart (#795)
    
    * move visit header and patient banner to patient chart
    
    * use common lib workspace
    
    * Properly condition the patient visit header
    
    * Fix the failing tests
    
    * use skeleton loading for the banner

[33mcommit d759ccf33c699b1de8c32b37bee7c18214e36ed8[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Thu Sep 8 11:05:15 2022 +0300

    03-1429: Appointment Save and Close button. (#790)
    
    * - Remove the service type condition.
    
    * Use service duration

[33mcommit 8a8f19cb99cb17a2e85ba9750bfde0a117ff0339[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Sep 8 15:12:29 2022 +1000

    fix: Adjust `top-of-all-patient-dashboard-slot` appears before dashboard title (#800)

[33mcommit fc25d8a4b593f85a4477d68b3052e0b39161de09[m[33m ([m[1;31mupstream/fix/revert-1685538[m[33m)[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Sep 7 22:46:51 2022 +1000

    bug: fix patient-chart navigation (#799)

[33mcommit e1371a5e7a8bbaf5aef8fe6043bec6a85cffcaec[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Sep 6 10:33:46 2022 +0300

    (feat) Automatically revalidate order data after form submission (#796)
    
    * (feat) Automatically revalidate orders data
    
    This PR is a follow-up to #774. It adds a call to SWR's `mutate` function to the orders form submission handler so that when the form gets submitted successfully, a revalidation request gets broadcasted to SWR hooks using the same key. This means that the user does not need to reload the patient chart to see newly created orders.
    
    Additionally, this PR also wraps an empty state `Tile` in the OrderBasketItemList component with the `Layer` component. This brings its look and feel in line with the rest of the app.
    
    * Reorganize imports
    
    * (fix) Rename error variable from `usePatientOrders` hook
    
    * Constrain which keys get updated post-mutate

[33mcommit 7dcb4299f37764ad6be09d9e3df27df7263dbd6e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Sep 5 20:16:44 2022 +0300

    (chore) Bump `@carbon/react`, `@carbon/charts-react` and `d3` (#797)
    
    * (chore) Bump `@carbon/react`, `@carbon/charts-react` and `d3`
    
    * Remove unused d3 references

[33mcommit b3f4576d46555b58b22bfecf8e6ed751e311c6ca[m
Author: Samuel Male <samuelsmalek@gmail.com>
Date:   Fri Sep 2 10:07:17 2022 +0300

    (feat) Refurbish Order Basket (#774)
    
    * Make Order basket functional
    
    * Remove unused imports
    
    * Align Order form stylings
    
    * Fix tests
    
    * Misc improvements
    
    * Fix lint
    
    * (chore) Fix typos
    
    * Fix build

[33mcommit 55f9e29510f0c06d8029ba12c4cc6192388a24ad[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Sep 1 20:59:53 2022 +0300

    (fix) Fix vitals header flagging logic (#789)
    
    This PR fixes the logic used to determine whether to show a warning background in the vitals header. Presently, the logic fails because of a bug in the `assessAllValues` function where the key-value pairs that get iterated over do not get properly destructured from the source `Object.entries` array. I've replaced this function entirely with a function that only looks at the interpretation results for each vital sign and returns a boolean depending on whether any vital signs with abnormal interpretations exist.

[33mcommit 2ea2240cf1e1efe2fdbc8b0840a1b298fd40b167[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Sep 1 14:19:02 2022 +0300

    (bug) fix workspace not hidden when hide button is clicked (#791)

[33mcommit 39a66bd952e3a4e4846c7e88411fd727df774584[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Sep 1 08:44:09 2022 +0300

    (fix) Allergy form style fixes (#793)
    
    This PR fixes the UI of the allergy form by wrapping the content of the form (sans the button set at the bottom of the form) in a `<div>`. This bit is necessary to get the styling in the `.form` class appearing as intended.

[33mcommit 441052b8f919d16918f51043f7cddb277434fbe7[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Aug 31 20:53:14 2022 +0300

    (fix) Remove extraneous margin around the biometrics section of the form (#794)
    
    (fix) Remove extraneous space around the biometrics section of the form
    
    This PR removes a style rule from the biometrics section of the form that led to extraneous margin being applied to the biometrics section of the form (see the before and after screenshots below).

[33mcommit 37df05b8eb6f4ee26abbf5194f2dc67a394bfeda[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Aug 30 14:45:41 2022 +0300

    (fix) Fix useVisitOrOfflineVisit hook (#792)
    
    (fix) Fix current visit not loading
    
    Presently, the `currentVisit` object does not get returned by the `useVisitOrOfflineVisit` function. This is breaking a bunch of dependent logic and UI. This PR provides a fix for this, restoring the function implementation to an older version that works.

[33mcommit b98af1ecd254a97c37bd84d73ee4f6ed03565326[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon Aug 29 10:46:20 2022 +0300

    (bug) fix bug on fetching `JSON-SCHEMA` and Concepts for forms (#788)

[33mcommit e217b9c68316e8f3470fd69785c013b843c6cb03[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Sat Aug 27 19:03:15 2022 -0400

    (chore) revert 168553 restoring obstree concepts (#787)

[33mcommit 30fd2fb5e35075d4ff144811b04fb3660396232b[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Thu Aug 25 11:46:54 2022 -0400

    (fix) add __VERSION__ constant for form-entry-app (#786)

[33mcommit cdcb66a2b134d5a7dd372f3e783c99f8ef7d769f[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Thu Aug 25 09:56:14 2022 -0400

    (fix): use hemoglobin (CIEL:21) instead of X-Ray (CIEL:12) by default (#785)

[33mcommit 7af06bd4d5ae7e1e34212d6fdd8de137dffc57ca[m
Author: Pius Rubangakene <piruville@gmail.com>
Date:   Thu Aug 25 13:14:38 2022 +0300

    Update peer dependencies to openmrs and commons 4.x (#784)
    
    Update peer dependencies to openmes and commons 4.x

[33mcommit 2fd113394638c2d19ba333499bad5ba838dda515[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Aug 25 11:04:03 2022 +0300

    (feat) Notify the user when programs have not been configured (#777)
    
    * (feat) Notify the user when programs have not been configured
    
    This PR modifies the Programs Form logic so that an error notification is displayed when programs have not been configured in the system. This communicates clearly to the user that they cannot enrol a patient when none are configured. Further, this PR also tweaks the appearance of some UI elements in tablet mode, replacing the `light` prop (from Carbon v10) with the new `Layer` component.
    
    * Fix translation strings

[33mcommit 960c329b1e2f14d0fce576a8c2d8e1835290a18c[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Wed Aug 24 22:35:15 2022 -0700

    (fix) Add back in webpack for dev servers (#783)
    
    Add back in webpack for dev servers

[33mcommit ba3dcb881f1089f7d752413885ccd5d4e73956c8[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Aug 24 19:25:08 2022 -0400

    (fix) simplify logic for which patient gets returned (#779)

[33mcommit ff4ce517aec622b739dc684d25b5b793a7b8136d[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Aug 24 18:20:15 2022 -0400

    feat(form-entry-app): Add a hook to handle the encounter before it's created (#781)

[33mcommit 9e3c013770b9fdd641e9a7efdc1a5ab63193fb07[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Aug 24 18:03:11 2022 -0400

    (chore): add version numbers for all apps (#782)

[33mcommit b385da408c7e74b45715e96536d47dc69b67d357[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Aug 24 14:44:15 2022 -0400

    (chore) use @openmrs/ngx-formentry instead of @ampath-kenya/ngx-formentry (#780)

[33mcommit 9074b4684616fa9a427eeebad613164679dd486a[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Wed Aug 24 09:10:56 2022 -0700

    (chore) Bump peer dependencies (#778)
    
    * package bump wip
    
    * all peers updated
    
    * put back lodash-es
    
    * yarn and lint

[33mcommit 91b04476ee3c3e3e06390d501d3a1de4daec5456[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Aug 24 09:51:10 2022 -0400

    (fix) reduce number of form re-renders (#776)

[33mcommit cd4cf532f239e248a7d7eccee319737a4d08557b[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Aug 24 09:50:54 2022 -0400

    (feat) add the ability to load custom data sources into the AMPATH form engine (#772)

[33mcommit 746e86c7b5c5cebcc536e7a5c33168e2faee6ac4[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Aug 23 22:27:11 2022 +0530

    O3-1449: Patient Attachments Improvement (#773)
    
    * Wrapped the modal content into ModalHeader, ModalBody and ModalFooter
    
    * Updated Translations
    
    * O3-1452-retaining-file-size-fix
    
    * File review input label text fix
    
    * Updated translations
    
    * Camera use in the background fix
    
    * Uploading file instead of base64 content and showing both file name and description
    
    * Minor changes and renamed fileContent to base64Content
    
    * Added PDF viewer in the imagePreview and added escape listener on closing the preview
    
    * Lint fixes and changed ImageSelected to AttachmentToPreview
    
    * Fixed the hiding of camera shutter:
    
    * Added Placeholder Thumbnails for pdf and other files and removed unused imports
    
    * Final additions
    
    * Updated translations
    
    * Updated translations
    
    * Review changes
    
    * Removed commented code

[33mcommit b1c844ce541d1ba45b37e5ff0da428703ed1f241[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Aug 19 22:02:33 2022 +0300

    bumb yarn.lock for @ampath/ngx-formentry (#775)

[33mcommit 7527da5cb41d7be4a007b56cafff739684ae5178[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Aug 17 12:03:05 2022 +0300

    (feat) Useful tweaks following the 4.0 upgrade (#768)
    
    * (feat) Useful tweaks following the 4.0 upgrade
    
    These include:
    
    - Removing an errant semi-colon from the form entry wrapper component.
    - Fix mismatched style declaration in the Biometrics chart component.
    - Tweak the modal copy in the Cancel Visit dialog component.
    - Upgrade the `@carbon/charts-react` and `d3` version in the Test Results app.
    - Alter the description property of the Test Results app package.json file.
    
    * Bump @carbon/react and @carbon/charts-react

[33mcommit fc24fce1e17828dedade2520de7f0aff356711b9[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Tue Aug 16 06:39:55 2022 -0700

    Fix/small cleanup (#771)
    
    * remove semicolon
    
    * update fe-wrapper scss

[33mcommit 99827fccebe093f0f38b01940bb04fb1059dcff8[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Mon Aug 15 21:38:19 2022 -0700

    (fix)  Fixes concept url (#770)
    
    * Fix concept url
    
    * one more

[33mcommit 60d28eaa81ec9c2147672b0ea8b8a2a864a92b39[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Mon Aug 15 12:20:05 2022 -0400

    (chore) upgrade to Yarn v3 (#769)

[33mcommit 4e70f8442c9fc3dce481f0a2a70eca82137a54a1[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Mon Aug 15 14:59:08 2022 +0530

    O3-1447-v1: Patient attachments Camera/Media Uploader Modal file structure change (#765)
    
    * File structure changes
    
    * Added the failed message for failed uploading
    
    * 4.0 updates
    
    * Updated translations

[33mcommit 31a1998baf6ee9aafb4e40017debed2e24f56a8c[m
Author: Ian <ian_bacher@brown.edu>
Date:   Thu Aug 11 16:28:07 2022 -0400

    (chore) update version numbers to 4.0

[33mcommit 72c1877f3f1b1249b803550407ec616e3b029806[m
Author: Ian <ian_bacher@brown.edu>
Date:   Thu Aug 11 16:28:07 2022 -0400

    (chore) master -> main

[33mcommit c71f9f53a381ed52e9bec9bd9814b8e9e0dd2f61[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Aug 11 23:24:00 2022 +0300

    BREAKING: Upgrade to Carbon 11 and React 18 (#714)
    
    Co-authored-by: Ian <ian_bacher@brown.edu>

[33mcommit 63ab4260bcc6387255f84de495f1d3b3485ba44f[m
Author: Manuel Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Thu Aug 11 16:56:29 2022 +0200

    (fix) Migrate offline form concept label loading to new bulk endpoint (#767)

[33mcommit 62f811e8a8077e4b89403e694667caecfe3f180e[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Tue Aug 9 19:39:25 2022 +0100

    (fix) Split requests when fetching labels from concept dictionary to avoid HTTP 414 URI Too Long (#764)

[33mcommit ad6c885f2c4d2b145c9ae054568be6c40238c31a[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Aug 9 23:03:08 2022 +0530

    Added lint enforcements to the patient chart apps (#766)

[33mcommit bdfbb5415e4b8d80f6babf54931f6833d2b90a9c[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Aug 5 11:29:59 2022 +0300

    Add ability to display custom program workflow (#759)

[33mcommit f503dd54643f8596170e4d8d3ff76056fdda7443[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Aug 5 08:34:46 2022 +0300

    (feature) Add `patient-flags-slot` to patient-summary-dashboard-slot (#761)
    
    * (feature) Add `patient-flags-slot` to patient-summary-dashboard-slot
    
    * Code review

[33mcommit 13b75d8f8327b01cbeef227bb9cf2f4eb321b50e[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Thu Aug 4 17:05:41 2022 +0530

    Patient chart tests fixes and lint cleanups (#762)
    
    * Fixed the patient chart's failing tests
    
    * Lint warnings fixed

[33mcommit 4eb1a477dcb9b9bad902710c3cd26dbe5e6caa35[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Wed Aug 3 15:57:38 2022 +0100

    Updated endpoint to bulk fetch form labels from concept dictionary (#750)

[33mcommit d0acf936e82330759a0798bd62d78f50ad67f198[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Aug 3 13:24:49 2022 +0530

    Patient attachments app improvement (#751)
    
    * Improved the UI for capturing the picture from camera
    
    * Improved the movement of uploading files/ clicking image, and reviewing the uploaded files to change name and description
    
    * Updated translations
    
    * Added file dropper
    
    * UI fix for drag and drop component
    
    * Updated translations
    
    * Uploading and saving files working
    
    * Capturing image, uploading files, and confirmation after completing the file completed
    
    * Updated translations
    
    * Added SWR to the attachments overview and UI updated to the overview component
    
    * Added tabular view to the attachments overview
    
    * Added dragOver capture to the overview component and onCompletion function in the camera-upload component
    
    * Added skeletons in the attachments grid
    
    * Intermidiate changes
    
    * Added functionality for deletion and image previewing
    
    * Lint fixes completed
    
    * Updated translations
    
    * Review changes
    
    * Review changes

[33mcommit ae218d00aa2dce049bb36eb0b08c91bf00967d7b[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Aug 3 13:21:51 2022 +0530

    Patient chart widget additions to patient search banner (#758)
    
    * Added start visit button to the patient search banner
    
    * Lint fixes
    
    * Added action buttons for Ending visit, cancelling visit and adding past visit to the patient search banner

[33mcommit f19c3c6006124eff19b91bff36a3922326c83c68[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Aug 2 03:58:57 2022 +0300

    Add ability to configure forms url (#755)
    
    Add ability to configure custom forms url

[33mcommit 168553860f4e63730fbaa12ea575fdf731c90931[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Fri Jul 29 09:24:01 2022 -0400

    (chore) Update concept uuids for obstree (#756)
    
    Update concept uuids for obstree

[33mcommit a5611b0657f7efa4b8c57718ec82ef38a937ee41[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Thu Jul 21 10:06:57 2022 -0700

    (feat) Form Entry Hide Submit Cancel Buttons + Outside Submit Control (#753)
    
    * Allows turning off Discard / Submit buttons
    
    * External trigger + state events working
    
    * Use unistore

[33mcommit 0dbeaa37478cce38ed2cf25efdccff17470b76ad[m
Author: Makombe Kennedy <kennedymakombe@gmail.com>
Date:   Wed Jul 20 12:14:52 2022 +0300

    (fix):Fixup on getting form resource valueReference (#748)
    
    Co-authored-by: Makombe <makombe>

[33mcommit f39567f0dd5a6769c98252caa13f5d62df74a46e[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Mon Jul 11 20:27:19 2022 +0200

    (feat) Add basic support for a multi-column layout for custom dashboards (#729)

[33mcommit 6ad16f830a55352c8b158f0cadfda1559e8c1a10[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Mon Jul 11 00:34:45 2022 -0700

    (feat) Add optional handlePostResponse function to AMPATH form wrapper (#747)
    
    * Add optional handlePostResponse function to AMPATH wrapper
    
    * revert yarn.lock

[33mcommit af2d2dd6eec2fadc77c3614c6ff7f2b0d9f91df9[m
Author: icrc-agomes <106243905+icrc-agomes@users.noreply.github.com>
Date:   Thu Jul 7 17:48:49 2022 +0100

    O3-1329: Configurable decimal rounding in obs-by-encounter widget (#742)

[33mcommit a13f55bd21080041dfc0b04ca05dea4c617859f4[m
Author: Samuel Male <samuelsmalek@gmail.com>
Date:   Thu Jul 7 13:50:01 2022 +0300

    Extract a "conditions widget" out of the conditions-forms (#708)
    
    * Extract a "conditions widget" out of the conditions-forms
    
    * Use an Observable as a submission notifier

[33mcommit 330de42fd12ecf199aba2005b380ddf88037cfa0[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Jul 7 13:24:09 2022 +0300

    (fix) Fix age based validation (#746)
    
    Fixes validation that relies on the `age` model. The form entry wrapper depends on the `age` helper from `@openmrs/esm-framework` - which did not compute the age correct value from the given birth date. I've added a `calculateAge` function that returns the correct age from the patient's birth date.

[33mcommit 703c23be61de10283adf5cc7be065d6cefdb321e[m
Author: grace potma <67400059+gracepotma@users.noreply.github.com>
Date:   Tue Jul 5 19:47:56 2022 +0300

    Update README.md

[33mcommit 5d6faf0acb582950b0cf0060c2de391dc37fe4dc[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Jul 1 20:32:08 2022 +0300

    (enhancement) Fix leftNavBar styling (#741)

[33mcommit 697d45b1397c36e1991795e3fdbadd5fa7a592dc[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Fri Jul 1 12:31:44 2022 +0530

    O3-1365: Error state on Test results page (#739)
    
    Added error check when fetching test data

[33mcommit 3606a63f3a88dc826eafa8a0147ed680b84a7e04[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Thu Jun 30 15:56:37 2022 -0700

    (fix) Results Viewer Default Schema - Point to extant concepts (#740)
    
    Point to extant concepts

[33mcommit e6972f566a074030540e27a82f40b0ce1fc94845[m
Author: grace potma <67400059+gracepotma@users.noreply.github.com>
Date:   Thu Jun 30 23:54:39 2022 +0300

    Update README.md

[33mcommit 585cb3978eb4bf1bfb340743b225effbd1b443c0[m
Author: ashewring <ashewring@users.noreply.github.com>
Date:   Wed Jun 29 22:48:31 2022 +0200

    (docs) Fix broken link to Implementer Documentation (#734)

[33mcommit 848dd5ec1daf2cbfc2b441044c517846f9115222[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Wed Jun 29 22:38:27 2022 +0200

    (feat) Add ability to edit program enrollments (#735)
    
    * Progress work: Adding edit button on programs widget
    
    * Translation
    
    * (feat) Should be able to edit program enrollments
    
    * Update tests
    
    * Prettier
    
    * Undo changes to attachments app and dashboard-view
    
    Co-authored-by: benjamin <bniyonshuti@pih.org>

[33mcommit f28110d77691033ac6176340eefd992189a4ffa8[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Jun 29 11:24:19 2022 -0400

    (chore) Serve the JS files from the CDN (#738)

[33mcommit c75aa24453b853ce65e21b62cbf552c359237696[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Jun 29 11:17:43 2022 -0400

    Fix the fix for generic dashboards (#737)
    
    Try a simpler fix

[33mcommit 4df6eced107b181d9397065c31eebf976e693e37[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Jun 29 09:28:41 2022 -0400

    Fix the fix for generic dashboards (#736)

[33mcommit bf3207f611f1927baad2d565d02d00b666c6e6bf[m
Author: abertnamanya <abertnamanya@gmail.com>
Date:   Wed Jun 29 11:37:31 2022 +0300

    O3-961: Photo caption is not displayed in attachments (#712)

[33mcommit 94d5e7bf1525cdfdef2879183fa512900ce12988[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Jun 28 23:10:41 2022 +0300

    (enhancement) Update workspace minimize and close button to match designs (#731)
    
    * (enhancement) Update workspace minimize and close button to match designs
    
    * Remove now obsolete currentPath prop
    
    Co-authored-by: Zac Butko <zac.butko@gmail.com>

[33mcommit f19d2972161c99ab46d08c066fb7081db03e3573[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Tue Jun 28 15:12:00 2022 -0400

    O3-578: Restore Generic Dashboard Links (#733)

[33mcommit a2c359c9dbf2e68e7d4a4e6a0e657afbf5a21b9e[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Mon Jun 27 14:12:52 2022 -0400

    Fix the size reporter (#730)

[33mcommit d8625ae097ea65d8c4884ffab37ba47675b23a6c[m
Author: kyampeire Hadijah <30952856+hadijahkyampeire@users.noreply.github.com>
Date:   Mon Jun 27 20:58:39 2022 +0300

    O3-578: Left Nav Page section is not highlighted correctly. (#721)
    
    * Wrap dashboard extension in router.
    Use location from react-router
    
    * Remove the !important and
    remove the overriding
    styles from core
    
    * Use global active class
    
    * remove duplicate styles for the active global class

[33mcommit cda5b5518ca6d77dc45623643e276ccdc7520b68[m
Author: icrc-agomes <106243905+icrc-agomes@users.noreply.github.com>
Date:   Mon Jun 27 16:16:16 2022 +0100

    O3-1277: obs-by-encounter-widget should support more concept types (#709)

[33mcommit d54cb0bdf495122ad3da78ab92f5f476fc60e2ff[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Jun 24 22:27:21 2022 +0300

    (docs) Small tweak to README (#728)

[33mcommit 85d175a2bfaaffee3a1f943290bd7bf199f666f8[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Jun 22 17:12:50 2022 -0400

    (chore): Fix size-generator script (#726)
    
    See #725

[33mcommit 57010d84b03ce93765eb99dacae7a7fe8be84dd7[m
Author: Manu Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Tue Jun 21 16:13:05 2022 +0200

    (feat) Dynamic Offline Data for Forms | Offline Support for Concept Labels (#710)
    
    * Migrate forms to dynamic data API.
    
    * Sync forms.
    
    * Offline support for concept labels of forms.
    
    * Improve isSynced handling and offline forms tile. Fixed bugs.
    
    * Form sync handler improvements.
    
    * Cache user's current language.
    
    * Fixed a wrong URL being called. Improved RX handling of a form schema service function.
    
    * Upgrade package lock.
    
    * Fix TS build error.
    
    * Rename concept UUID function name to concept identifier.

[33mcommit 4089136d2372f40900540eaa16197b753e06b473[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jun 21 15:52:57 2022 +0300

    (feat) Tweak empty state illustration dimensions (#715)
    
    This PR tweaks the dimensions of the empty state illustration so that it doesn't get cut off at certain zoom levels, as is currently the case.

[33mcommit 0dbfb7c0586bc1940d1492ff7e4b20d26c589694[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Fri Jun 17 10:47:08 2022 -0400

    Revert "(feat) Add a build script for patient-common-lib (#717)" (#722)

[33mcommit 505c850f5335ec3b2c260b9b20b25b333571a00b[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Thu Jun 16 18:09:32 2022 +0300

    Fix O3-785: Handle Errors in Attachment Upload (#704)
    
    * Fix O3-785: Handle Errors in Attachment Upload
    
    * Modify error message
    
    * change variable from var to const

[33mcommit 9043469ab68eddf0c9f2ee2ac75d64a3fd18840d[m[33m ([m[1;33mtag: v3.2.0[m[33m)[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Wed Jun 15 07:13:08 2022 -0700

    (chore) Release v3.2.0 (#720)
    
    v3.2.0

[33mcommit a59073a952287d5d2ae2eaf8f8fe47a35a8f3be3[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jun 15 13:10:20 2022 +0300

    (chore) Limit build job concurrency (#719)
    
    * (chore) Limit build job concurrency
    
    * Fixup

[33mcommit dd8aa39e90776dfb180fd49a0c1d46f14312360d[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Jun 14 14:50:43 2022 +0300

    Fix bug with date control displaying only time when datePickerFormat is not set (#718)

[33mcommit 419aec97b7afb9f3248ef2d5eb2baf1a76b78c41[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Mon Jun 13 18:58:39 2022 -0700

    (feat) Add a build script for patient-common-lib (#717)
    
    Add a build script for patient-common-lib

[33mcommit 96f963797e71479bf9ff07004f4f62bab31d126d[m
Author: Pius Rubangakene <piruville@gmail.com>
Date:   Mon Jun 13 11:21:29 2022 +0300

    Adds isExpanded option to createDashboardGroup and scrollable patient chart sidenav (#713)

[33mcommit 1313d7f794302934df4142e95052cf7c2d9ca728[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Jun 10 09:21:27 2022 +0300

    (feat) Enhancements to the biometrics widget (#703)

[33mcommit cb020d4083f564fcda8864dff2897bc3fb9cc8a5[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Fri Jun 3 09:21:54 2022 +0300

    03-1277:obs-by-encounter-widget should support more concept types (#705)
    
    Co-authored-by: jwnasambu <julietwamalwa@yahoo.com>

[33mcommit 3d36885872d376a19346b44cf25897681761b9a3[m
Author: Jovan Ssebaggala <jssebaggala@outlook.com>
Date:   Thu Jun 2 17:18:58 2022 +0300

    O3-520 Add + Button to add active medications (#629)
    
    * O3-520
    
    * 03-520 add tests for button to launch drug order basket under active medications
    
    * 03-520 remove un used imports
    
    * Resolve conflicts
    
    * fix lint issue

[33mcommit 415790e1ad9b8bdbd1201958d21a06fa93ec7237[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Thu Jun 2 11:05:52 2022 +0300

    Bump eventsource from 1.1.0 to 1.1.1 (#707)
    
    Bumps [eventsource](https://github.com/EventSource/eventsource) from 1.1.0 to 1.1.1.
    - [Release notes](https://github.com/EventSource/eventsource/releases)
    - [Changelog](https://github.com/EventSource/eventsource/blob/master/HISTORY.md)
    - [Commits](https://github.com/EventSource/eventsource/compare/v1.1.0...v1.1.1)
    
    ---
    updated-dependencies:
    - dependency-name: eventsource
      dependency-type: indirect
    ...
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit 22ac06a08d42a635d60b669086168c8c26a04ac7[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Jun 1 17:12:40 2022 +0300

    03-1223: Fix display issues and screen cut off on Acer Chromebook (#706)
    
    03-1223: Fix display issues and screen cut off on Acer chromebook

[33mcommit d602e1bfabb31789c6ac88f28e56aa85ac01562f[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Tue May 24 23:12:13 2022 +0300

    Bump dexie from 3.2.1 to 3.2.2 (#701)
    
    Bumps [dexie](https://github.com/dfahlander/Dexie.js) from 3.2.1 to 3.2.2.
    - [Release notes](https://github.com/dfahlander/Dexie.js/releases)
    - [Commits](https://github.com/dfahlander/Dexie.js/compare/v3.2.1...v3.2.2)
    
    ---
    updated-dependencies:
    - dependency-name: dexie
      dependency-type: indirect
    ...
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit cad5864ba285bd595ce2025cc77bf0632ac26542[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue May 24 14:35:12 2022 +0300

    (fix) Fix object property access bug in forms widget (#702)
    
    This PR fixes a bug in that causes the forms widget to fail to load in some cases.

[33mcommit 0b496daeb9bf0cfe82c40429683533770b8023fd[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Thu May 19 17:47:32 2022 +0100

    (feat) Include returnUrl parameter when opening a legacy html form (#699)

[33mcommit e405aa3f325c992fd06a6f2bdf9c60835b56f18d[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed May 18 17:23:51 2022 +0300

    O3-1253: Highlight abnormal vitals (#694)
    
    * O3-1253: Flag abnormal vitals
    
    Abnormal values for vital signs should be flagged in both the vitals header and the vitals widget.
    
    This PR enables highlighting of abnormal vitals in the vitals widget as described in the ticket https://issues.openmrs.org/browse/O3-1253.
    
    * Fixup test
    
    * Incorporate design feedback from Ciaran
    
    * More design feedback - represent missing values with --
    
    * Fixup

[33mcommit d36ed1f2cf92c168928d7a51a421cd9d3feb280a[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Tue May 17 11:22:48 2022 +0300

    Fix bug: Opening a form resets the patient chart view (#695)
    
    (fix) Launching the workspace should not trigger navigation

[33mcommit fea198d4025c0a2053add1a33c8ced8a416eef7f[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue May 17 11:21:42 2022 +0300

    (chore) Cache file size workflow deps (#698)
    
    This PR enables dependency caching for the file size impact workflow.

[33mcommit a85980e20ae35362bde154e7b7ec0cfacf17db31[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon May 16 14:55:37 2022 +0300

    (chore ) Update OpenMRS CI status badge (#697)
    
    This is necessary to reflect changes made to CI actions

[33mcommit 34fd97250e4252f6736d6867fb9e596c00a812f5[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon May 16 14:16:14 2022 +0300

    (chore) Cache CI dependencies to speed up workflows (#696)
    
    * (chore) Cache CI dependencies to speed up workflows
    
    This PR sets up the [cache](https://github.com/actions/cache) GitHub action to enable dependency caching in this repository.
    
    * Fixup
    
    * Test cache

[33mcommit 6b583c765c30e5816297bf8736d30863e0a10de2[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri May 13 08:11:51 2022 +0300

    03-837 : Display `unsaved-changes` modal when start-visit-form changed (#690)
    
    * 03-837 : Display `unsaved-changes` modal when start-visit-form has changed
    
    * Code review changes
    
    * Add workspace test
    
    * further enhancement on `closeWorkspace` function

[33mcommit bd8f963fbf3f69583dc719a31990ef24d79c631d[m
Author: jwnasambu <33891016+jwnasambu@users.noreply.github.com>
Date:   Wed May 11 18:16:05 2022 +0300

    Attachments widget does not support PDF files (#654)

[33mcommit e0cf7a491361313813f4344d0ab95a804af5f8c5[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed May 11 13:00:09 2022 +0300

    (chore) Rename steps in the CI `build` job (#693)
    
    This PR amends the names of some steps in the `build` job of our CI workflow to make them more descriptive.

[33mcommit ab8732785295db08fc5084828104cb50ffb688a9[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed May 11 10:47:30 2022 +0300

    (chore) Rename CI workflow (#691)
    
    This PR renames our main CI workflow from `NodeJS CI` to `OpenMRS CI`, an arguably far more descriptive name.

[33mcommit 3f518328e795f99d5c08b6c788cdabf285de2c15[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon May 9 19:26:29 2022 +0300

    (chore) Limit workflow task parallelization (#688)
    
    This PR limits the number of tasks that run in parallel in our CI workflow. This is so as to reduce the likelihood of the CI workflow execution running out of memory. It does so by separating the `lint` and `typescript` jobs into their own pipeline that is separate from the `build` job.

[33mcommit cfcbc20daa8bf3e7642431cdc4f1987e09006697[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Mon May 9 13:34:14 2022 +0300

    (test) Add specs to vitals header test (#651)
    
    * Test vitals header
    
    * merge tests for abnormal values into one

[33mcommit 2b6f27c4ba6f299f467d22e650fc16cbc40a5010[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Mon May 9 13:26:46 2022 +0300

    (test) Add tests for the allergies form (#686)
    
    * Add tests for the alergies form
    
    * Modify allergies test
    
    * Modify allergies test

[33mcommit e9e9357b9dd0f87ffbcf0edf392df88fddb72460[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon May 9 12:09:42 2022 +0300

    03-1283 : Add diastolic values to chart (#689)
    
    * 03-1283 : Add diastolic values to chart
    
    * Code review changes

[33mcommit 6a01287330a294ce8764d1dbdfce157597b94a21[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu May 5 11:53:12 2022 +0300

    fix `session` failing on form-component (#687)

[33mcommit 55be9f7c2675c62a9512c378332621bdfc0b2957[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu May 5 11:52:20 2022 +0300

    (feat) Sort encounter types list in Encounters widget (#685)
    
    This PR sorts the encounter types used in the Encounters widget dropdown filter alphabetically.

[33mcommit 1cec0407a482ea23d0ac269e0e5be2acef5b8c47[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu May 5 11:51:58 2022 +0300

    (feat) Add empty state to filters in encounters widget (#684)
    
    This PR adds an empty state to the encounters widget in the visits dashboard. This empty state gets displayed when filtering patients yields no results.

[33mcommit 3ae1a121bc51550d41a22a7a194057ab66b67208[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu May 5 11:51:33 2022 +0300

    (chore) Bump setup-node (#681)
    
    This PR bumps the `setup-node` action in the `file-size-reporter` workflow to its latest version.
    
    Currently, the file-size-reporter workflow is failing because the node version that gets installed does not match what the workflow expects. See the attached screenshot for more information.

[33mcommit 1f4e8323dc85dec6a9b5960395acf50310f13bdb[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Wed May 4 15:43:09 2022 +0100

    O3-1226: Filter form list according to user privileges (#639)

[33mcommit fce2700ce887fa414523428b7576063035b8b9a9[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Tue May 3 12:12:20 2022 -0700

    Update stale link

[33mcommit 554e9ea4a8d0b24d65196e4c868577933e2624ea[m
Author: MiguelAHPpih <59062871+MiguelAHPpih@users.noreply.github.com>
Date:   Mon May 2 12:09:15 2022 -0500

    Making ampath forms work on Vitals section (#665)

[33mcommit 6d7c5ef9948eb3eaf134c7ab33d680f2a4739ac2[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon May 2 19:41:53 2022 +0300

    O3-1276: Users need a way to exit the workspace when forms don't load (#683)
    
    * O3-1276: Users need a way to exit the workspace when forms don't load
    
    Presently, the form engine handles rendering a form and its action buttons when a user launches a clinical form. If there is a problem loading a form, its action buttons won't get loaded either (see the attached screenshot). In such a circumstance, the user cannot exit from the workspace. This situation is often very frustrating.
    
    Ciarán has helpfully crafted up an error state design which affords the user with a way to back out of the workspace when a form fails to load. The user can click on the `Close this panel` button to exit the workspace. In future, an affordance would navigate the user to the forms list from where they could choose an alternative form to open.
    
    This PR implements the empty state design in the workspace.
    
    * Remove unused style declaration
    
    * Switch stylesheet to SASS to reuse color variables

[33mcommit 16c3ffbf1ca41d5392289bc2201832d13ae30fd4[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Fri Apr 29 12:26:57 2022 -0400

    Delete clinical-view-form.component.tsx

[33mcommit 77dbdf2dd068c2930caca7982057e3349d55b0c9[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Apr 28 18:24:32 2022 +0300

    Fix workspace not launching (#682)

[33mcommit 7730ce10730fabb21574d90407a9e8461ef8126d[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Apr 28 13:42:52 2022 +0300

    (feat) Filter and search encounters list (#672)
    
    * (feat) Filter and search encounters list
    
    This PR adds the ability to filter encounters in the Visits dashboard by encounter type. It also adds a searchbox where users can type in a search term to filter the encounter list by as well.
    
    * Fixup
    
    * Translate table headers

[33mcommit d2a35c68dbfccf005119cf750d77c89559decb7c[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Wed Apr 27 11:41:00 2022 -0700

    Use framework left nav system (#677)

[33mcommit e84cee5e919cf5e12ab644d1aa5f7ad45c1a9c95[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Wed Apr 27 20:56:54 2022 +0300

    Fix bug: O3-1231: Actions menu overlays the user's next action (both … (#673)
    
    * Fix bug: O3-1231: Actions menu overlays the user's next action (both desktop and tablet)
    
    * Change variable name
    
    * Change variable name
    
    * Change variable name
    
    * Change variable name

[33mcommit 53d0036c0b8cdb2b7eff1f5aebcbe8fa6b7db339[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Apr 27 18:58:47 2022 +0530

    O3-1204: Results trendline viewer (#656)
    
    * Created the trendline view for the test results. When a user clicks on a test result's name link, he/she is navigated to /trendline/testUuid and the chart opens up.
    
    * Created UI improvements for the test-results app, which include scrolling, adding action buttons, etc.
    
    * Created both the desktop view and the tablet view for the trendline.
    
    * Added value indications in the data table in the trendline view.

[33mcommit 70ce0e6d37db1a5378ffe2d4733b99ffa9d8b294[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Apr 27 09:14:20 2022 +0300

     (enhancement) use showModal function to display start-visit-modal (#663)
    
    * (enhancement) use `showModal` function to display start-visit-modal
    
    * Add unit test for showModal change

[33mcommit 09d53f6bdf57a6f2fcfd13425b3dd3fa82bf967f[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Apr 26 21:27:00 2022 +0300

    O3-1269: Form names should try use display property (#679)

[33mcommit 4cb02d0a7214d6ab2b685cf24a9fbd60dfe5623a[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Tue Apr 26 06:34:13 2022 -0400

    (chore): update size reporter (#676)

[33mcommit 1bee2ca63bc9b5d7c86e84b2934290f84b34865c[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Apr 26 11:09:31 2022 +0300

    (bug-fix) Fix bug on form-entry-app labelMap (#678)
    
    * Fix bug on form-entry-app
    
    * Fix liniting errors on form-entry-app

[33mcommit 432e43c15250928649049b337b526ba00703eb57[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Tue Apr 26 10:14:57 2022 +0530

    Type fixes in patient medications app (#675)
    
    * Removed placeholder from Combo boxes since it's giving typescript errors
    
    * Ran Prettier
    
    * Added ts-ignore for placeholders in Combo boxes
    
    * Updated translations

[33mcommit d3784336bcc245be0cc90858a63bf3ec8f6721b2[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Apr 26 00:27:15 2022 +0300

    03-1177 : Fix workspace not opening once minimized in desktop mode (#669)

[33mcommit 60ca6fc95a8cae3ade5011309d12daa32ece72da[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Sat Apr 23 01:31:19 2022 -0700

    (fix) O3-1273 Clicking a form with no active visit fails to launch start visit prompt. (#671)
    
    * (fix) O3-1273 Clicking a form with no active visit fails to launch start visit form
    
    * Config description fixup
    
    * Prettier

[33mcommit cb8e510bca549ee513e0c636f2560a958096fdee[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Apr 22 17:40:21 2022 +0300

    (refactor) Rename pagination components to "PaginatedX" (#668)

[33mcommit 8d150b799ab187f74105d686077ef389206b25b0[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Apr 21 18:43:36 2022 +0300

    (refactor) Replace deprecated `useSessionUser` with `useSession` (#661)

[33mcommit 5d0a265c6c87b22939113effe585fd72cadcd6c4[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Thu Apr 21 06:14:10 2022 -0700

    Children pass up hasData (#666)

[33mcommit 931567706870d659429889a706a08234fd1c98e4[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Apr 21 14:29:43 2022 +0300

    03-1254 : Fix vitals & biometrics wrong directions (#662)
    
    * 03-1254 : Fix vitals & biometrics wrong directions
    
    * Code review changes

[33mcommit 6d10360ce258de6e865efcd1278a4a15f22eaec0[m
Author: Manu Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Thu Apr 21 10:57:19 2022 +0200

    (fix) Offline visit being created multiple times / Offline forms card loading infinitely (#664)
    
    * Form offline improvements.
    
    * Update yarn.lock.
    
    * Fixed offline visits being created multiple times.
    
    * Fix 'Available offline' not rendering while offline.

[33mcommit bed6205fc4805a1e184f0c7703d8d21c2292dcb3[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Apr 20 08:31:31 2022 +0300

    (enhancement) use `showModal` function to display visit-modals (#640)
    
    * (enhancement) use `showModal` function to display visit-modals
    
    * remove unused visit-dialog code

[33mcommit 647c58658517c89e09b0c6d130d1e27f2b005d29[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Apr 20 08:31:00 2022 +0300

    (bug) fix clinical form name not updating (#659)
    
    * (bug) fix clinical form name not updating
    
    * Add regression test for updating clinical-form title

[33mcommit 4f365ba92878f2a0575478164767b619fe623c55[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Mon Apr 18 16:32:01 2022 +0100

    (fix) Forms: only try to load concepts for questions with a concept (#660)

[33mcommit 9509bb860bb11ae2cbd86827b16b36b6f254f9c5[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Fri Apr 15 09:40:11 2022 -0700

    (fix) Eliminate the need for dashboards to have names (#658)

[33mcommit 2bcaa2b52e5af1b1b1a1d408d88971a8a013728a[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Thu Apr 14 18:07:52 2022 -0700

    (bugfix) Prevent Filter Tree Infinite Render (#655)

[33mcommit d78be0c39a3a0e4a33619ec900f780dfe12762f8[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Apr 14 18:07:28 2022 -0700

    (fix) Rename pagination props (#657)

[33mcommit 06c9d11cdadc0a27e08dc156d0b18a10a69d876d[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Apr 14 06:40:10 2022 -0700

    (feat) Should be able to create dashboards using config (#653)

[33mcommit 597734b17c046f32d90f30f9d5ea37c0797c56c9[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Wed Apr 13 22:32:04 2022 -0700

    Bump moment from 2.29.1 to 2.29.2 (#648)
    
    Bumps [moment](https://github.com/moment/moment) from 2.29.1 to 2.29.2.
    - [Release notes](https://github.com/moment/moment/releases)
    - [Changelog](https://github.com/moment/moment/blob/develop/CHANGELOG.md)
    - [Commits](https://github.com/moment/moment/compare/2.29.1...2.29.2)
    
    ---
    updated-dependencies:
    - dependency-name: moment
      dependency-type: direct:production
    ...
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit 86f5c57e6b568109a621bcb40338383414c883ff[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Wed Apr 13 11:45:04 2022 -0700

    Update configuration link

[33mcommit 9e445be3d2784f967b7d53e7bd0cc495be963890[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Wed Apr 13 15:38:14 2022 +0100

    (feat) O3-965: Load missing concept labels from the backend (#610)

[33mcommit fdf05709ebb8f8b354febb2fd0eff3689c627058[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Tue Apr 12 14:24:38 2022 -0400

    (chore) move from babel -> swc (#650)

[33mcommit 5562a78d41dac38d6280038b5da3f013c292212d[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Mon Apr 11 12:37:21 2022 -0700

    (feat) Remove @openmrs/esm-paitent-clinical-view-app (#652)

[33mcommit b28254252a120ac5468d9a2a16e03db05d3bfe99[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Apr 8 22:04:35 2022 +0300

    (test) Rename swrRender helper method (#638)
    
    This PR renames the SWR `render` helper method from `swrRender` to `renderWithSwr`. The latter is an arguably more descriptive name and it blends nicely with other similar `render` helpers like `renderWithRouter`.

[33mcommit b5fa43acb2da9607c7861ae993e3a24461705ab1[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Fri Apr 8 12:03:54 2022 -0700

    Bump minimist from 1.2.5 to 1.2.6 (#621)
    
    Bumps [minimist](https://github.com/substack/minimist) from 1.2.5 to 1.2.6.
    - [Release notes](https://github.com/substack/minimist/releases)
    - [Commits](https://github.com/substack/minimist/compare/1.2.5...1.2.6)
    
    ---
    updated-dependencies:
    - dependency-name: minimist
      dependency-type: indirect
    ...
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit faea533faf0cc2bfa828e17fa84b119f95d07ada[m
Author: Sumedha Chathuranga Karunarathna <sumedhachathuranga@gmail.com>
Date:   Sat Apr 9 00:32:37 2022 +0530

    O3-1156 Vitals and biometrics boxes does not correctly handle 3 digits values (#607)

[33mcommit 09b46e203962b509e937b4dd2dde8061c2f12d65[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Apr 8 21:58:04 2022 +0300

    (feat) Better dashboard titles in breadcrumbs menu (#560)
    
    This improves the display of dashboard titles in the breadcrumbs menu. More specifically, it improves how dashboard titles containing more than one word are displayed. It proposes a convention where the dashboard `name` for dashboards with multi-word titles is an underscore delimited string (e.g. `clinical_views`). Then in the title property of the `registerBreadcrumbs` invocation, we replace the underscores from the string with spaces and capitalize the result. With this, we end up with `Vitals and biometrics dashboard` instead of the previous `Vitalsandbiometrics Dashboard`.

[33mcommit 59ec98e5fc12b65d5d43c9604803b362c6b025d9[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Fri Apr 8 10:22:52 2022 -0700

    (fix) Adapt to public/internal API split in esm-framework (#634)

[33mcommit 425addcfe58f4d4ad6cc7d747295bb6a0524b4e3[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Apr 8 18:53:45 2022 +0300

    (chore) Bump turbo version (#644)

[33mcommit f6bbd1c3f36a912e36061b07cd23774423509fe1[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Apr 8 09:26:52 2022 +0300

    (fix) Fix alignment and positioning of side rail tooltips (#643)
    
    This PR fixes the alignment and positioning of tooltips in the side rail. Presently, tooltips for some buttons in the side rail get cut off by the right margin of the page.

[33mcommit 1cfb81a7e72697a1ddb46ccc3b8473307d0b6068[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Apr 7 08:47:45 2022 -0700

    Prettier

[33mcommit 3c6378774ee2b7ed45f8f5a65373c1154eaca915[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Thu Apr 7 18:05:06 2022 +0300

    O3 1187 Make hard-coded constants in Medications app configurable (#628)
    
    Co-authored-by: Brandon Istenes <brandonesbox@gmail.com>

[33mcommit c19356bde45e52b9d44fbb90e3e654e42926eca8[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Apr 7 14:07:34 2022 +0300

    03-1240: Fix patient-banner re-renders b/c of offline activeVisitSWR (#645)

[33mcommit b25ed38e850803cf176274a112bdfbf69cb60b5f[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Apr 7 11:02:45 2022 +0300

    (fix) Restore top border to PatientChartPagination component (#642)
    
    This PR deletes styling that removed a top border from the PatientChartPagination component. With this change, a top border now appears above the component, effectively separating it visually from the datatable.

[33mcommit 14911358235b53d0cb9a2338c00805bf955b0f91[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Apr 6 11:43:43 2022 +0300

    (test) Fix warnings raised when running tests (#637)
    
    * (fix) Fix warnings raised when running tests
    
    This PR silences a bunch of warnings that get raised when running the test suite in this repo.
    
    * Rename file
    
    * Remove misleading assertion
    
    It's probably best to remove this assertion because it's existence is necessitated by a hack. For Carbon to render a DataTable with expansion correctly, we need to have a placeholder DOM element to render when a table row is not in an expanded state. Previously, we used an empty `<div />`, but this would lead to a `validateDOMNesting` warning in the browser console. That's because the only permitted children for a `<tbody>` tag are zero or more `<tr>`s. So, I chose instead to a render a table row but then to hide it from the UI using CSS. This works fine in the browser but obviously won't in a testing environment. So I've elected to remove the assertion altogether.

[33mcommit 830dc16d546bcd6b821ba0bb294cc71a7fdcb569[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Tue Apr 5 22:18:46 2022 +0300

    (test) Test the vitals and biometrics form submission logic (#619)
    
    * Add tests for vitals-biometric form submission
    
    * clean up test
    
    * clean up test
    
    * Add more realistic figures
    
    * Add more realistic figures
    
    * remove duplication from import
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit e194b9ae235e448689b3399d454ceb57675dedc6[m
Author: Manu Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Tue Apr 5 16:50:24 2022 +0200

    (fix) O3-1160: Fix Offline Visit Not Being Used Correctly | Offline Form Fixes (#625)
    
    * Fix issue where JSON.stringify ran into circular references.
    
    * Restore offline visit functionality, specifically for esm-patient-forms-app.
    
    * Use correct patient in form entry component.
    
    * Fix offline form actions not launching the workspace from non-patient-chart pages.
    
    * Fix failing form entry tests.

[33mcommit e331f710b73b40b4c6988b1afc32ebf3b2a9407b[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Apr 5 15:00:21 2022 +0300

    (fix) O3-1219: Fix contact details not showing correctly (#636)

[33mcommit c930f43ee4b7a10454a033a2372055571225745e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Apr 5 02:09:55 2022 +0300

    (fix) O3-1220: Vitals header does not update upon form submission (#635)
    
    This PR fixes an issue where the vitals header does not auto-update after the vitals and biometrics form gets successfully submitted. This is because the key passed to SWR `mutate` function does not match the URL that the form is configured to POST to.
    
    This PR fixes this issue by using a regular expression to find matching keys and then run `mutate` on them. Because the URL bound to the `useVitals` hook changes based on whether biometrics concepts are included or not, using a RegExp to perform a partial match is a more robust approach than using a fully formed URL that's more likely to not match.

[33mcommit f0c7806012d02361b80b9a1774c59ac7edcb0568[m
Author: Sumedha Chathuranga Karunarathna <sumedhachathuranga@gmail.com>
Date:   Sat Apr 2 07:49:01 2022 +0530

    O3-1196: Tablet design (horizontal): "Select local photo instead" button is hidden in attachment popup (#632)
    
    * O3-1196: Fix select local photo instead button in tablet design
    
    * Fix alignments based on width

[33mcommit 9438a47fae15470c981b61f5a639f020c1f2f9f4[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Fri Apr 1 09:12:19 2022 -0700

    (bugfix) Results viewer is proper extension (#633)
    
    * Results viewer is propper extension
    
    * Remove unused hiveMeta

[33mcommit 8705051cf7105dcdbaccafb6b635330e812c6b84[m
Author: grace potma <67400059+gracepotma@users.noreply.github.com>
Date:   Thu Mar 31 01:12:08 2022 -0700

    Added Lab Filter Concept Set-Up documentation

[33mcommit 331cfa3b7def8f4de7c8f25e43a0303446fd5e7d[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Wed Mar 30 15:23:09 2022 -0400

    (chore): Fix #62 (#631)
    
    * (chore): Fix #62
    
    * Update pre-commit

[33mcommit 30ef3d92af711b66e45392271fa2224ade5597a3[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Mar 30 16:44:28 2022 +0300

    (chore) Fix pre-release and release CI jobs (#626)

[33mcommit 207f3f4b8a800db0042d6c1f97161c67dbd97f11[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Mar 30 13:40:17 2022 +0300

    (enhancement) update vitals and biometrics chart (#614)

[33mcommit d065aaeefa835fa1d167c160086dd5d1e40e73f8[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Mar 26 01:36:37 2022 +0300

    (chore) Add lint and typescript jobs to cached pipeline (#623)
    
    Add the `lint` and `typescript` jobs to the cached turbo pipeline.

[33mcommit 1aaaf26dd183266b10074649731d16f696c5be97[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Mar 25 19:29:04 2022 +0300

    (chore) Fix file size reporter buildCommand (#624)
    
    Fixes failing CI runs by changing the file size reporter buildCommand from `npx turbo run build` back to `npx lerna run build`.

[33mcommit c10ce46a927f26bcbf0b20c016abb5eb9e0bcf86[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Mar 25 19:28:25 2022 +0300

    (fix): Add patientName to useMemo's dependency array (#622)
    
    The `patientName` argument used to compute the memoized `patientPhotoSlotState` value should be included in the `useMemo` call's dependency array.

[33mcommit 7805eff6193fdd7d9dd52cea3dec27f8ccb4918d[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Mar 25 01:45:21 2022 +0300

    (chore) Add Turborepo (#620)
    
    Add Turborepo and configure task running and caching to use `turbo` instead of `lerna`. This allows us to leverage the power of turbo to achieve faster, incremental builds.

[33mcommit 5cab58c30e5bef5001047211df9794582788f1e3[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Mar 24 09:48:40 2022 -0700

    (chore) Upgrade openmrs and @openmrs/esm-framework deps (#618)

[33mcommit 10906bfb07e2bd43d2622304e9c1a3ab077961b2[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Tue Mar 22 13:37:02 2022 -0700

    (feat) Results Viewer Abstraction, Timeline Cleanup, Translations (#617)
    
    * File reorg
    
    * Cleaned up Filter, added desktop styling
    
    * More refactor + stylesheet cleanup
    
    * Some Translations
    
    * Changes per Ian + Vineet

[33mcommit 3890c958dba02d6e93aae93b6f0cbac0ea726b9f[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Fri Mar 18 07:34:43 2022 -0700

    Update README.md (#616)

[33mcommit 2dd4a7bdbefa206fccb025c25aba7dc2311af266[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Thu Mar 17 15:46:20 2022 -0400

    (fix): only try to process dashboard extensions once the patient-chart-dashboard-slot has been mounted (#615)

[33mcommit 10bff0ab62474dd7cf9698c9f0562b8152260269[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Mar 17 12:00:26 2022 +0300

    Fix failing test on side menu and form-entry components (#613)

[33mcommit ead9335b6328b9d7bd121605a2b6e0fea11f1af8[m
Author: Manu Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Thu Mar 17 07:42:02 2022 +0100

    (feat) Offline Form Improvements (#611)
    
    * Form offline improvements.
    
    * Update yarn.lock.

[33mcommit c956e2740a347921aec39710c4b0f7132a469a88[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Mar 17 00:08:14 2022 +0300

    03 1168: Add ability to cancel (`void`) active visit (#608)
    
    * 03-1168 : (enhancement) Add ability to cancel active visit
    
    * add translation
    
    * Add test for end and start visit components
    
    * Code review changes

[33mcommit 0f6e4daec6513041291f5106356f95e25d92d395[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Mar 16 23:11:08 2022 +0300

    (enhancement) add test for `visit-note,order-basket & clinical-form` action buttons (#606)

[33mcommit ee1c9d436671dc345fc917404165db62a86b5302[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Mar 16 14:49:02 2022 +0300

    bump `@ampath-kenya/ngx-formentry` (#612)

[33mcommit 9bd7a8df9b8ae5757ec90c454571d4da1d4fda5e[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Tue Mar 15 13:08:13 2022 +0300

    (test) Assert appearance and disappearance of `Add` and `Edit` buttons (#603)
    
    * test clinical view app
    
    * edit test clinical view app
    
    * Modify test on appearance of Add view and edit view button

[33mcommit d8cd49eb90747d05fbc1dbdd38282f36ad52d036[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Mon Mar 14 14:32:48 2022 -0700

    Fixes bad leaf behavior, sets max-width for Firefox (#605)

[33mcommit e4926ef29fc38fbbf3a93ecbf3307f832e842bdd[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Sat Mar 12 20:30:16 2022 +0300

    03-1166: Add bottom navigation on tablet view (#602)
    
    * Add bottom navigation for tablet view
    
    * Add translations
    
    * Style active menu item
    
    * Code review & desktop side-rail
    
    * Add more translations
    
    * Code review changes

[33mcommit d629a779b167166982e842a6a5d562b8f939fb59[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Fri Mar 11 11:49:22 2022 -0800

    (feat) Timeline Results Grouping O3-1060 (#591)
    
    * Rough POC all tests on same timeline
    
    * Now includes interpretation + stronger typing
    
    * Style changes
    
    * Table header is frozen
    
    * small style changes
    
    * Use /obstree endpoint
    
    * Major refactor
    
    * Grouped timelines
    
    * Some good style changes
    
    * Small progress towards multi-timeline
    
    * X scroll synchronized
    
    * Group headers stay fixed
    
    * Supports config, multiple concepts at once
    
    * small tweaks

[33mcommit 4c2680e7bf72a558584540faf38ae1c08c37f720[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Mar 11 21:32:02 2022 +0300

    (feat): `useSWRImmutable` for fetching vitals concept metadata (#604)
    
    Since v1.0, SWR provides a helper hook useSWRImmutable to mark a resource as immutable. This means that once data is fetched and cached, it will not be requested again. Concept metadata is unlikely to change and as such revalidating is largely unnecessary.
    
    This PR modifies the `useVitalsConceptMetadata` hook to use `useSWRImmutable` for data fetching.

[33mcommit 7fdd83836b0c2e0aded0b1b09d2f188890162ada[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Mar 11 11:56:10 2022 +0300

    03-1125: (bug) fix current visit retaining previous patient visit-data (#570)
    
    * 03-1125: (bug) fix current visit retaining previous patient visit-data
    
    * Updated `@openmrs/esm-framework`
    
    Co-authored-by: Donald Kibet <donaldkibet@Donalds-MacBook-Pro.local>

[33mcommit 973adf2254da0f2cd334374be4968b2bbf1d8744[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Wed Mar 9 17:02:47 2022 -0800

    (fix) Minor bug where extensionId is used instead of extension name (#601)

[33mcommit cc696389ed227dca491eec26cddb80d2c33cc303[m
Author: Nsereko Joshua <58003327+jnsereko@users.noreply.github.com>
Date:   Thu Mar 10 03:17:40 2022 +0300

    MF-828: The date field in the start visit form is truncated at small display widths (#600)

[33mcommit 449a6faae4be8d40e1b01175f87a8abeb4480996[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Wed Mar 9 16:14:19 2022 -0800

    (feat) O3-1108  Left nav should support groupings (#595)

[33mcommit 77635e00b9e2907110ad345f1d509313e47ffaf0[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Wed Mar 9 14:14:44 2022 -0800

    Use cross-env to pass TZ=UTC environment variable to jest (#599)

[33mcommit 1ca6ebb814d35b560937a285da65da1aa54c4081[m
Author: Lars Albino Lemos <larslemos@gmail.com>
Date:   Wed Mar 9 20:16:58 2022 +0200

    OHRI-452 Form Patient Banner - Optional hideActionsOverflow, optional param (#598)

[33mcommit 67b85a781a3c806a04b0f1f2206421b67cc3db56[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Mar 9 12:12:00 2022 +0300

    (WIP) first step to add ability to display recommended visit-type and forms (#590)
    
    * Add recommended visit work-flow
    
    * Add ability to recommended clinical forms
    
    * Adapt visit and forms recommended tab with design
    
    * Add ability to show completed forms
    
    * Conditionally load program config if showRecommended tab config is set to true

[33mcommit f94ef90d7b6f276d49ced98463ca43c4ba177608[m
Author: Vineet Sharma <sharmava05@gmail.com>
Date:   Wed Mar 9 13:41:45 2022 +0530

    O3-928: (Solved) "Renew" action disapeared on past medications actions (#597)
    
    * Enabled showing the renew button on the past orders
    
    * Assigned different keys for activeMedications and pastMedications with different casing
    
    * Minor fix

[33mcommit f5d472f3c8ad9302ec4138388d924c4ebd0ec5ab[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Mar 8 05:40:12 2022 -0800

    Use 'name' in extension declaration, not 'id' (#596)
    
    * Use 'name' in extension declaration, not 'id'
    
    * Fixup

[33mcommit a3be5fba0b1c7e4f9f36072f2d3fda3f8a863bd8[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Mon Mar 7 10:01:15 2022 -0800

    (fix) Remove all remaining references to subview (#592)

[33mcommit e20f1c9a2552eb9706d5b64a0f888e3ef61b9469[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Mon Mar 7 09:36:33 2022 -0800

    (refactor) esm-patient-chart to organize by functionality; eslint ts files (#594)

[33mcommit d667ffcc72ddb779826d8895750a51cc80755899[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Mar 5 06:04:57 2022 +0300

    (readme) Update README  (#582)
    
    This commit improves upon the guidance in the existing README, including adding and linking to new READMEs in each of the constituent microfrontends.

[33mcommit 6a859f5c4f1e6c862a711d6a065fd6f47cf11cfe[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Mar 5 05:57:30 2022 +0300

    Update vulnerable dependencies (#593)

[33mcommit 6edbf2b577b75935361fc2b94296307ef805b2b7[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Mar 3 12:32:09 2022 -0800

    Add `launchPatientChartWithWorkspaceOpen` function (#587)
    
    * Add launchPatientChartWitthWorkspaceOpen function
    
    * Review feedback

[33mcommit a6a8615e414a155023238880f1c8d6703dcb8a14[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Mar 2 23:03:15 2022 +0300

    (docs) Remove errant comma from PR template (#584)

[33mcommit b431fd9994b77afc6ba2da826fb656d0bc61c741[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Mar 2 21:56:03 2022 +0300

    (feat) Remove pagination from medications widget (#588)
    
    The original scope of this feature involved replacing the stock Carbon pagination used in the medications widget with our custom `PatientChartPagination` component.
    
    Instead, Ciaran's guidance is that the medications widget shouldn't have pagination controls anyway. This change is corroborated by the [designs](https://app.zeplin.io/project/60d59321e8100b0324762e05/screen/60d5e12ebc329c17022caf7e) as well.

[33mcommit a6633af4c940c6be1a9ac8b7e05c8d1547b14faa[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Wed Mar 2 20:02:24 2022 +0300

    Bump karma from 6.3.12 to 6.3.16 (#589)
    
    Bumps [karma](https://github.com/karma-runner/karma) from 6.3.12 to 6.3.16.
    - [Release notes](https://github.com/karma-runner/karma/releases)
    - [Changelog](https://github.com/karma-runner/karma/blob/master/CHANGELOG.md)
    - [Commits](https://github.com/karma-runner/karma/compare/v6.3.12...v6.3.16)
    
    ---
    updated-dependencies:
    - dependency-name: karma
      dependency-type: direct:development
    ...
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit 7d92aab53fa6d101d81577d63f1119a5f383a8d1[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Mar 1 21:49:19 2022 +0300

    (refactor): Better variable names (#586)

[33mcommit 5ffa1c00763535ed7feef6c83de98d87e286d2a6[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Mar 1 08:12:10 2022 -0800

    (refactor) Refactor chart-review component (#583)

[33mcommit 4aea5e10141ecbc1fc4ada3b2212385627fadb37[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Tue Mar 1 13:30:41 2022 +0300

    Bump url-parse from 1.5.7 to 1.5.10 (#581)
    
    Bumps [url-parse](https://github.com/unshiftio/url-parse) from 1.5.7 to 1.5.10.
    - [Release notes](https://github.com/unshiftio/url-parse/releases)
    - [Commits](https://github.com/unshiftio/url-parse/compare/1.5.7...1.5.10)
    
    ---
    updated-dependencies:
    - dependency-name: url-parse
      dependency-type: indirect
    ...
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit 0dfe78e4174bfd39887ebedaa80ac05697a58085[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Mon Feb 28 18:22:12 2022 +0000

    O3-1041: Improve HFE forms configuration url scope (#569)

[33mcommit 5c37f8e7d93e544e4da3d1d4086f11fe003b184c[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Mon Feb 28 09:30:55 2022 -0800

    (fix) Improve use of extensions API; simplify dashboard system; remove cruft (#578)

[33mcommit 05f5b049f3ac86859bc70282b8d28e7a21cc05e4[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Feb 26 18:45:41 2022 +0300

    (fix): Fix encounter note metadata display (#580)

[33mcommit 2b63eb6d337e4c068dcb93b3d616c39f9f685835[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Feb 26 18:32:38 2022 +0300

    (fix): Fix errant styling in vitals header (#579)

[33mcommit 8820bf7243c2ffa1de0dec2a7f008f39da9cd0c6[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Feb 25 22:57:54 2022 +0300

    03 1113:Make calendar icon on forms clickable & bump @ampath form-entry (#575)
    
    * 03-1113 Make calendar icon on forms clickable to open datepicker
    
    * Add ability to view Form Name on workspace
    
    * bump @ampath-kenya/ngx-formentry to alpha16 version

[33mcommit 2cea2a777cb61e203c1a326471cde0f56f5e1ab5[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Feb 25 21:38:03 2022 +0300

    O3-1103: (feat) Further enhancements to the vitals widget (#577)
    
    This PR makes the following enhancements to the vitals widget:
    
    - Factor out the `VitalsHeaderTitle` component into the `VitalsHeader` component. This centralises all the vitals header concerns under one main component - `VitalsHeader`.
    - Add `interpretation`s for `heart rate`, `pulse` and `respiratory rate` values so abnormal values get flagged.
    - Add helper functions that simplify assessing vital signs to determine abnormal values.
    - Add various style fixes.

[33mcommit a3edbb07e659a74981c2da2db1dfa0c378a54b21[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Fri Feb 25 10:15:43 2022 -0800

    (chore) Improve husky workflow and PR template (#576)

[33mcommit 3f90ee00993e306bb981d63b23a8a412e0f2ee71[m
Author: Makombe Kennedy <kennedymakombe@gmail.com>
Date:   Fri Feb 25 01:47:32 2022 +0300

    (enhancement) Add ability to display poc forms only and filter out ht… (#573)

[33mcommit 858b2121d3d4d202f92fe05d051abdd9f8fef965[m
Author: Piumal Rathnayake <piumalrathnayake@hotmail.com>
Date:   Thu Feb 24 03:58:15 2022 +0530

    O3-1116: Update test-result observation request count (#571)

[33mcommit 329a85d892e942def9eb27691bcea4ada77f77df[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Feb 23 20:39:25 2022 +0300

    O3-1105: (feat) Add metadata to visit notes display (#574)
    
    * O3-1105: Add metadata to visit notes display
    
    This PR is a follow-up to https://github.com/openmrs/openmrs-esm-patient-chart/pull/555. It adds the following metadata about a visit note to the visit notes widget:
    
    - The encounter provider.
    - Their role.
    
    * Add translation string

[33mcommit 811134c09ad480ed2b18f2ae448bf8e556466ba7[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Tue Feb 22 14:39:39 2022 -0800

    [O3-1060] Data Timeline FilterSet (#557)
    
    * Timeline handles no data case
    
    * HIV page displays, some stubbing out of Filter
    
    * FilterSet basic accordion working
    
    * Filter context is working with checkboxes and timeline. POC somewhat stable
    
    * concept cleanup
    
    * Refactor to handle more complicated state
    
    * updateParent working
    
    * some style changes
    
    * small style bump
    
    * Added updating parents
    
    * Skip a test
    
    * some stronger typing
    
    * Changes per Ian, Dennis, Daniel, and Brandon
    
    * Refactored FilterProvider
    
    * Default to showing data
    
    * test works now?
    
    * Change slot name, fix FilterContext initialization

[33mcommit 9cd53ef8f66eeee3f2f7b15ae05b4159290917ce[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Feb 22 22:43:45 2022 +0300

    O3-1114: Adapt encounters widget to match designs (#572)
    
    * O3-1114: Adapt encounters widget to match designs
    
    Presently, the encounters widget doesn't quite match the available spec. This PR fixes a whole bunch of design mismatches such as:
    
    - Use of a content switcher for toggling between the `Visit summaries` view and the `All encounters` view. Tabs ought to be used instead.
    - Addition of a missing tab for `Encounters` in Visit summary overview.
    - Completely redoing the `All encounters` view so that it displays a tabular summary of _all_ the encounters.
    - Applying visual tweaks to the UI to get it as close as possible to matching the spec.
    
    * Incorporate design review feedback from Ciaran
    
    - Rename the `encounters` dashboard to `visits`.
    - Show just the encounter `Time` in the Encounters tab summary. The `All Encounters` summary should show both the date and time of an encounter.
    - Show a simpler empty state for the Encounters tab when no encounter data is available.
    - Add options for editing an encounter, launching an encounter in the encounters dashboard and deleting an encounter to the overflow actions menu.
    
    * Fix translation string and styles

[33mcommit c2a27c0c34ac9707b81d1afc55716187ecfa1f29[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Sun Feb 20 22:08:27 2022 -0800

    Bump url-parse from 1.5.4 to 1.5.7 (#568)
    
    Bumps [url-parse](https://github.com/unshiftio/url-parse) from 1.5.4 to 1.5.7.
    - [Release notes](https://github.com/unshiftio/url-parse/releases)
    - [Commits](https://github.com/unshiftio/url-parse/compare/1.5.4...1.5.7)
    
    ---
    updated-dependencies:
    - dependency-name: url-parse
      dependency-type: indirect
    ...
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit bcfd84996851f68bc3262b53a9b024e9a8d3980c[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Sun Feb 20 17:44:50 2022 +0300

    (enhancement) improve mechanism of fetching biometrics and vital signs (#567)

[33mcommit 5cb1560fd584fb8f8391cf87bf94dbee577774ec[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Sat Feb 19 06:38:36 2022 -0800

    (fix) active-medications workspace not opening (#566)
    
    * Fix active-medications workspace opening
    
    * Fixup

[33mcommit 74c20f3e5c54d706aa711b99f74d525abc380bc6[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Fri Feb 18 11:13:55 2022 -0800

    (feat) O3-1038 Workspace system should allow notifying with unsaved changes (#564)

[33mcommit 57e8e6f70930e50fc8ff7ff244cb7c6b4fcce748[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Feb 18 20:21:03 2022 +0300

    (refactor): Remove unused code from Programs widget (#565)
    
    This removes a bunch of unused code from the Programs widget. These include:
    
    - The `Programs` component - originally used to handle routing between the detailed summary component and the record component. We got rid of the record component so this is no longer required. At some point in its history, this component got refactored and ended up with the same code as the `ProgramsOverview` component, despite not being used or referenced anywhere.
    - `ProgramsContext` - provided a `patient` object and `patientUuid` in a Context object for consumption by the detailed summary component and the record component.
    
    This also makes a few inconsequential code changes to some props and variable names.

[33mcommit 59f04f12b056ef340219e53aa9c0d45b29084f92[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Feb 18 00:23:32 2022 +0300

    (feat) More enhancements to the Vitals widget (#563)

[33mcommit 741ae66e057a77bea275e5771cf464f3de2d1469[m
Author: Piumal Rathnayake <piumalrathnayake@hotmail.com>
Date:   Fri Feb 18 02:07:25 2022 +0530

    O3-1106: Remove 'isTablet' workspace prop (#559)

[33mcommit 71f8830a5756a2dd48decf5d2b2ab35f91f67fc4[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Feb 17 10:10:21 2022 -0800

    (fix) The intermittent 'Cannot redeclare block-scoped variable' type error (#561)

[33mcommit 68a3f208ad9e5a6b636a969be9b4dadf9196c2a3[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Feb 17 21:07:57 2022 +0300

    (fix): Fix SWR mutations upon form submission (#562)
    
    * (fix): Fix SWR mutations upon form submission
    
    This fixes SWR mutations in the patient chart. Mutations aren't working as they should following https://github.com/openmrs/openmrs-esm-patient-chart/pull/493. v1.1.2 changed the way SWR exports the `mutate` function. This PR updates all usages of `mutate` and gets them back working.
    
    * Fix failing tests (by temporarily omitting SWR related bits)

[33mcommit 4a7fb821c830a0cd055d8b453f9186177586420d[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Wed Feb 16 22:12:59 2022 -0800

    (refactor) Part 1 of O3-1038  Workspace system should allow notifying with unsaved changes (#556)

[33mcommit aad411205ddde133be7cc637a673fd686ecbe8e4[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Wed Feb 16 11:47:21 2022 -0800

    Bump karma from 6.3.12 to 6.3.14 (#550)
    
    Bumps [karma](https://github.com/karma-runner/karma) from 6.3.12 to 6.3.14.
    - [Release notes](https://github.com/karma-runner/karma/releases)
    - [Changelog](https://github.com/karma-runner/karma/blob/master/CHANGELOG.md)
    - [Commits](https://github.com/karma-runner/karma/compare/v6.3.12...v6.3.14)
    
    ---
    updated-dependencies:
    - dependency-name: karma
      dependency-type: direct:development
    ...
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit 8376a6c59c4991530b1136a35bc249c284462a34[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Feb 16 22:46:24 2022 +0300

    O3-1103: UI enhancements and fixes for the vitals widget (#548)
    
    * O3-1103: UI fixes for the vitals widget
    
    Provides a bunch of fixes and enhancements that get the vitals widget UI in line with the latest designs. These include:
    
    - Reordering the vitals and biometrics widgets in the vitals and biometrics page.
    - Flagging abnormal blood pressure and oxygen saturation values in the vitals header as specified in the designs.
    - Some minor visual tweaks and enhancements.
    
    * Use reference ranges from `useVitalsConceptMetadata`

[33mcommit 1aba5e5af295a235cc10ba4ee60dde18807a876c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Feb 16 22:45:37 2022 +0300

    O3-1105: Visit notes widget should only display visit note data (#555)
    
    * O3-1105: Visit notes widget should only display visit note data
    
    Presently, the visit notes widget displays data about encounters. This widget should instead show data from a visit note, including:
    
    - Any recorded diagnoses.
    - Any recorded visit notes.
    - The date of capture of the information.
    
    Link to Ciaran's design QA which flagged this anomaly - https://www.notion.so/Patient-Summary-7e91d9b019a24e07b27301aa8164c323
    
    Relevant Zeplin screen - https://app.zeplin.io/project/60d59321e8100b0324762e05/screen/60d5e3accb92fbbaeb9e6edc
    
    * Update `formatDate` signature

[33mcommit caaf30040a8471c39876b03ceccf975fc76b94df[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Feb 16 22:43:41 2022 +0300

    bump @ampath-kenya/ngx-formentry to alpha15 version (#558)

[33mcommit 3a545df6d605b8e53f43c5cd5f7ab6ee47216834[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Feb 16 14:45:43 2022 +0300

    03-1104: Hide component forms (#554)
    
    * 03-1104: Hide component forms
    
    * 03-1104: Code review

[33mcommit 350935677ffb53af054087f415bd7f9156fff558[m
Author: Piumal Rathnayake <piumalrathnayake@hotmail.com>
Date:   Tue Feb 15 11:11:18 2022 +0530

    O3-997: Use formatDate for date and time formatting (#539)

[33mcommit b82063c7b1695822797e75db962c4116bc0fe1a2[m
Author: Pedro Sousa - ICRC <68599335+icrc-psousa@users.noreply.github.com>
Date:   Mon Feb 14 19:29:51 2022 +0000

    O3-1041: Make list of HFE forms configurable (#542)

[33mcommit 5e7e306b7c9bacdb9b64f70d215528e25053a78a[m
Author: Florian Rappl <rappl.florian@gmail.com>
Date:   Fri Feb 11 12:30:50 2022 +0100

    Update PR event target

[33mcommit 22c1da5c310739e2326d1b5faff676104eb89a5e[m
Author: Manu Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Fri Feb 11 11:24:30 2022 +0100

    Provide patient UUID to queued offline actions. (#549)

[33mcommit f4aa6116c75ac7b2bf29d3e6c0eade3d534f7994[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Feb 11 03:07:05 2022 +0300

    Fix medications details table overflow menu (#547)

[33mcommit d1e41061dc3fa10c85a01599fb07c161ac56dccb[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Feb 10 09:43:41 2022 -0800

    O3-1023 Should be possible to launch patient chart with workspace open (#546)

[33mcommit 6a958f7f16b02fd74d82fd768cb422b159d5ad6f[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Feb 10 00:14:16 2022 +0300

    03-1083: Prevent users submitting two clinical form encounters (#544)

[33mcommit 75e22b520e0f5f335fb9d319a795623123906598[m
Author: Manu Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Wed Feb 9 14:18:46 2022 +0100

    fix: O3-1073: Don't filter form list in online mode (#545)

[33mcommit ab8e7fde94e023b974f9bdf0a2b4bc047b643f01[m
Author: Zac Butko <zac.butko@gmail.com>
Date:   Tue Feb 8 19:40:45 2022 -0800

    O3-1060: [Step 1] Refactor Timeline Widget as Extension (#543)
    
    * unique keys for react
    
    * MVP to have timeline as independent extension
    
    * removed timeline from patient dashboard
    
    * Changes per Brandon

[33mcommit 5e6a6df57fc46c780e89056d1c0d5b97c64d70ef[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Feb 8 20:32:49 2022 +0300

    O3-1072: Remove unused notifications menu implementation (#541)

[33mcommit 56cf1bdf1b484b7a01f6c7e8c367b4b0f11cbe0f[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Feb 8 05:59:04 2022 -0800

    feat O3-1036: Centralize workspace API and remove dependency on extension system (#540)

[33mcommit 35fe93059827071e8a671521f9d31cf99fe0557f[m[33m ([m[1;33mtag: v3.1.0[m[33m)[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Fri Feb 4 15:30:47 2022 -0800

    V3.1.0 (#538)
    
    * (chore) Rename 'ci:release' to 'release', remove 'ci:prerelease'
    
    * Release v3.1.0

[33mcommit 3042ed5995b75559639df5f06903d7ebd3dbff62[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Fri Feb 4 15:25:28 2022 -0500

    chore:CI: Bump patch version on release (#537)

[33mcommit 3c7d0da2cd6df5522a5d4837e7564fa3fa5adbfa[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Feb 4 21:06:43 2022 +0300

    03-1018: fix forms widget design confusion over link coloring (#533)

[33mcommit 819d724c48c5c27e922edd3066ab2d17dbf5e336[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Thu Feb 3 14:41:59 2022 -0500

    Nav menu should use standard `usePatient()` hook (#536)

[33mcommit cf423bf3ad8ec3882f193d9b3b9e9d6499953202[m
Author: Piumal Rathnayake <piumal1999@gmail.com>
Date:   Thu Feb 3 22:25:48 2022 +0530

    O3-1035: Update date formatting for timeline view (#535)

[33mcommit 069d5107a82228a3b264e19cb93bc5c063bd2e30[m
Author: Manu Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Thu Feb 3 13:28:18 2022 +0100

    O3-1021: Make the offline visit type UUID configurable. (#528)

[33mcommit 5eaf6094bec92f546a711392c0b27853814426de[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Feb 1 23:48:31 2022 -0800

    Move useContextWorkspaceSize hook to esm-common-lib and rename to useWorkspaceWindowSize (#534)

[33mcommit e548dacf45b214f954d9331a60d91f47b2a64f9a[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Fri Jan 28 16:53:38 2022 -0500

    O3-1027: Encounters view should use the encounter time (#526)

[33mcommit 73a5c2490b7b42fe23d8631805a5189357469251[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Jan 28 23:32:31 2022 +0300

    (enhancement) add ability to edit existing encounter (#530)

[33mcommit 90c904e4547f6fcd36b2fefcf294495e9c087eaf[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Jan 27 23:14:42 2022 +0300

    (bug) fix test-results not showing on encounters widget (#529)

[33mcommit 21d8eab3b8e739f8142192b7a351b6f70c765e4e[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Jan 27 23:13:09 2022 +0300

    (enhancement) Add ability for form-entry to display scheduled appointments (#499)
    
    * wip
    
    * Implement appointment schedule for form-entry
    
    * Add ability to configure data sources for monthly appointment
    
    * Add etl url to be configurable
    
    * code review changes

[33mcommit 91ed15eec566d440c6fa3560b045c308689a93be[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Thu Jan 27 11:55:45 2022 +0100

    Bump nanoid from 3.1.30 to 3.2.0 (#521)
    
    Bumps [nanoid](https://github.com/ai/nanoid) from 3.1.30 to 3.2.0.
    - [Release notes](https://github.com/ai/nanoid/releases)
    - [Changelog](https://github.com/ai/nanoid/blob/main/CHANGELOG.md)
    - [Commits](https://github.com/ai/nanoid/compare/3.1.30...3.2.0)
    
    ---
    updated-dependencies:
    - dependency-name: nanoid
      dependency-type: indirect
    ...
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit 9782f784335c169eba61f920c7df74f9086290ce[m
Author: Manu Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Thu Jan 27 11:55:35 2022 +0100

    Basic Support for Offline Registered Patients (#527)
    
    * Pre-merge master.
    
    * Enable patient banner to work with offline registered patient.
    Improved patient banner typing.
    
    * Fixed new bug where the offline visit conversion failed due to undefined.
    
    * Improve and fix queued sync items w.r.t. offline registered patients.
    
    * Refined fhir.Patient <> PatientCreate interaction.
    
    * Consider FHIR errors when fetching an online patient.
    
    * Adapted patient FHIR gender mapping and values read from registration sync queue.
    
    * Use expected visit sync type dependencies.
    
    * Adapt FHIR mapping to use correct `id` prop.
    
    * Updated yarn.lock.
    
    * Fixed offline registered patient loading which got broken by newest changes.
    
    * Use dedicated offline visit.
    
    * Moved FHIR mapping to patient-registration.
    
    * Adapt to updated patient registration typings.
    
    * Pin @jsenv/file-size-impact dep.

[33mcommit 5cdbd203197ac8fa68392b48f86e83eeefee016b[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Jan 26 19:11:01 2022 +0300

    03-1028: (enhancement) add support to display value codeable concept for test results (#525)

[33mcommit 718641d2557251a8c1feb93a10d5694ed879d14c[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Jan 26 00:31:21 2022 +0300

    (bug) fix error on loading deceased patient tag (#523)

[33mcommit 016e0defef2426501edae1231a31ee92056ca380[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jan 25 20:19:59 2022 +0300

    Enhanced deceased patient banner tag implementation (#524)
    
    Makes the following improvements:
    
    - Add a check for the `deceasedBoolean` property in the patient object. If truthy, proceed to render the component. Otherwise, return `null`. Presently, an error gets rendered in production because some patient objects do not have this property.
    - Simplify the type annotation for the `patient` prop by picking only the `deceasedBoolean` property.
    - Rename the component from `DeceasedBannerTag` to the more informative `DeceasedPatientBannerTag`.
    - Rename the extension from `deceased-tag` to `deceased-patient-tag`.
    - Add a missing translation string.

[33mcommit a83e48653ba876c81c34fa12ad2aaf64c051f993[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jan 25 20:18:52 2022 +0300

    Remove unused components (#522)
    
    * Remove unused components
    
    This commit removes record-level components from this repo. They're a relic of the old designs and have no place, at least currently, in the new designs. At the very least, getting rid of them should help minimise confusion for folks just getting started on the project.
    
    * Update translations

[33mcommit 4d14f8d9fbfad90b8554c289217871e678cbb5dd[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Jan 25 03:42:23 2022 -0800

    Switch from useCurrentPatient to usePatient (#520)
    
    * Update to new useCurrentPatient API
    
    * Switch to usePatient
    
    * Bump @openmrs/esm-framework
    
    So we're able to use the new `usePatient` implementation provided by the latest version of `@openmrs/esm-framework`.
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit 24f3135cadda943e6a0777a99373a3753b979171[m
Author: Kalungi Deborah <kalungi2k6@gmail.com>
Date:   Tue Jan 25 03:40:55 2022 +0300

    O3-849: Fixes Tag in Patient Header for Deceased (#511)

[33mcommit e9a4b42cbd216ab1c1b8b19e53387d8a82962c93[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Mon Jan 24 09:31:09 2022 -0500

    O3-1015: Implementers should be able to configure primary color here too (#518)

[33mcommit 99f149f08073973ef612ea7136c7589ad7386bb3[m
Author: Ian <52504170+ibacher@users.noreply.github.com>
Date:   Fri Jan 21 16:44:18 2022 -0500

    Removes frontendDependencies as we use peerDependencies for this (#517)
    
    This functionality was removed in esm-core in [0690298](https://github.com/openmrs/openmrs-esm-core/commit/0690298e2423175cd158e8b2f9868ea5ace0d8ed)

[33mcommit fc3782055bd92095fe36c552b2ca7a3985cf354b[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Jan 20 21:27:57 2022 +0300

    Additional medications widget fixes (#513)

[33mcommit cff648cea47363b30fe3913c52b7a4e5b0c17461[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Jan 20 21:25:31 2022 +0300

    O3-1020: Form entry widget should only list published forms (#515)
    
    Clinical forms listed in the Form Entry widget should get filtered by their `published` status to omit `retired` or `unpublished` ones.

[33mcommit 32fd8036f84d9221d49f37f0842dd7b57b151f7e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Jan 20 18:28:33 2022 +0300

    Remove old workspace implementation (#516)

[33mcommit a5974c9acdaf353523efd384d09b68646aa6c5cd[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Jan 20 13:09:09 2022 +0300

    bump @ampath-kenya/ngx-formentry" to alpha12 version (#514)

[33mcommit a6544e6e58c02282ce091f05ed5ed6e9bcd80c31[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Jan 20 09:13:20 2022 +0300

    03-1006 : Fix bug on opening offline form (#512)
    
    * squash form-entry launching console errors
    
    * 03-1006 : Fix bug on opening offline form

[33mcommit 7194a8e318e94a96d4a529607dc93cfba738b1fd[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 19 00:00:58 2022 +0300

    O3-1010: Full-screen clinical forms (#508)
    
    A follow-up to https://github.com/openmrs/openmrs-esm-patient-chart/pull/504.
    
    We need to adapt the design of clinical forms built using the form engine to make maximal use of the workspace.
    
    These changes include:
    
    - Making the form container full screen so that form content fills the height of the viewport.
    - Pin action buttons to the bottom of the viewport.
    - Render a loading spinner when the form schema is loading.

[33mcommit d3c07ffe1edf2dd2653d059b3d1157d4e9ddb2f7[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jan 18 22:52:17 2022 +0300

    O3-1011: Fix Start Visit form time picker validator regex (#509)
    
    The regular expression supplied to the pattern prop of the TimePicker input in the Start Visit form isn't working as it should. It's currently excluding some valid dates. This commit fixes it so it matches all valid 12-hour clock values.

[33mcommit 0fadbf10f91150333f445fd0e21c80d8967a2ea2[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jan 18 22:51:57 2022 +0300

    O3-1012: Show orderer name on tooltip hover (#510)
    
    Per the designs, the medications table show should the `orderer` name when the user hovers the tooltip.

[33mcommit 07ea10b69ca370cc266bab3170c2e45a8fddcb50[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Jan 14 23:10:20 2022 +0300

    Enhancements to the Allergies Form (#487)
    
    * Enhancements to the Allergies Form
    
    * Add tests and InlineNotification
    
    * Fixes after rebasing
    
    * Fix biometrics type error

[33mcommit dca6ecdb0760af6430b8dea3156be9c9f4c4af09[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Fri Jan 14 09:41:54 2022 -0800

    Bump engine.io from 6.1.0 to 6.1.1 (#506)
    
    Bumps [engine.io](https://github.com/socketio/engine.io) from 6.1.0 to 6.1.1.
    - [Release notes](https://github.com/socketio/engine.io/releases)
    - [Changelog](https://github.com/socketio/engine.io/blob/master/CHANGELOG.md)
    - [Commits](https://github.com/socketio/engine.io/compare/6.1.0...6.1.1)
    
    ---
    updated-dependencies:
    - dependency-name: engine.io
      dependency-type: indirect
    ...
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit cb9ca61a27a85d7b6c5b140dbcce72443b453861[m
Author: Florian Rappl <rappl.florian@gmail.com>
Date:   Fri Jan 14 18:06:36 2022 +0100

    Added file size check workflow (#505)

[33mcommit 507e8108782554cf40c743df92002213755cb53f[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Jan 14 13:03:21 2022 +0300

    O3-1000: Full-screen workspace forms (#504)
    
    * O3-1000: Full-screen workspace forms
    
    Following recent enhancements to the workspace, we can now adapt our forms to match the available designs fully. This would involve modifying their design so that their content fills the entire viewport height, effectively making them full-screen. Additionally, their action buttons ought to be sticky positioned to the bottom of the viewport.
    
    Note that these changes don't target forms built using the AMPATH Form Engine. Modifications for those forms will be packaged in a subsequent pull request.
    
    * Fix tests

[33mcommit ba4eb41d6140289a6bedac4bf17042716e5754db[m
Author: grace potma <67400059+gracepotma@users.noreply.github.com>
Date:   Fri Jan 14 06:03:42 2022 +0300

    Update README.md

[33mcommit bfeb1ee8494411b6173557fc70403e54950a0b35[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Jan 13 20:34:11 2022 +0300

    Fix typo on Forms  & Notes (#502)

[33mcommit 1b84b35c514f5b99a2403edadea4fd8b92133ae4[m
Author: Florian Rappl <rappl.florian@gmail.com>
Date:   Thu Jan 13 17:02:57 2022 +0100

    Enable sharing of common lib (#503)

[33mcommit 1eacbb51c4eb5e1983d982e9273f952e981ee031[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Jan 13 14:32:25 2022 +0300

    Add use-value feature to Ampath forms (#476)
    
    * Add use-value feature to Ampath forms
    
    * Finalize use-value feature

[33mcommit 35f7048bd2de14705e02dbc282c05800cba0d70c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Jan 13 02:55:47 2022 +0300

    More workspace enhancements (#501)

[33mcommit 76b92932ab003ce092b6861796dfb603628d4797[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Jan 13 01:54:51 2022 +0300

    Update handling of vitals/biometrics concept symbols (#489)
    
    * Update vitals and biometrics handling of units symbols
    
    * fixing broken test

[33mcommit 2fb4edd9bec24b0a89d2cb5735f7f9feb841c581[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 12 01:14:38 2022 +0300

    Constrain tooltip flex container (#498)

[33mcommit cac105f131fc71e734b3cb1def5417474819013a[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jan 11 19:40:20 2022 +0300

    O3-683: Independently scrollable chart body and workspace (#492)
    
    This ensures that the user can scroll independently between the patient chart body and the workspace when a form is open.

[33mcommit 0d6685c94fccb3048fefbf5a52e5d5babe9ba004[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Jan 11 19:37:30 2022 +0300

    (enhancement) update care-programs resource to return latest unique care-program (#497)

[33mcommit 22ea601db27f927f2ca21ae13bce7d8eb39db809[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jan 11 12:33:35 2022 +0300

    Add contextual information to test results overview (#495)

[33mcommit 5f3a54deeb30635991cef9ab2a626868789b2d25[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Jan 11 12:32:51 2022 +0300

    Fix bug on loading workspace (#496)

[33mcommit 35d2ee90342223cd6c2c96c430984aa7cffacebe[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Jan 11 05:30:52 2022 +0300

    03 983: Add Additional Columns to Care-Programs Widget (#483)

[33mcommit 6a802ce23281747a0682ef0d298ab5247130b408[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jan 11 01:56:27 2022 +0300

    Typeahead visual fixes (#494)
    
    Applies some UI fixes to the typeahead search inputs for conditions and diagnoses. These include:
    
    - Use of a border around the search results container to distinguish it visually from the rest of the form content.
    - Use of enough padding for each search result so that the last visible result gets partially hidden from view. The hope is that this makes it apparent to the user that the results container is scrollable. I'm keen to hear if a different approach would work better here.
    - Making the conditions search input in the `Conditions` form full-width. Constraining it to just 50% of the viewport meant search results with long names aren't instantly parseable on first viewing. Full-width might be too wide but it certainly looks better than half-width.

[33mcommit 513b3418e0a97161610c69dabce3c8971fcfb7cf[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jan 11 01:54:48 2022 +0300

    Bump SWR version (#493)

[33mcommit 478af0dc57e7a908c2868768e80684596d707995[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Sun Jan 9 17:32:27 2022 +0300

    Update form entry to display lab order-numbers (#488)
    
    * Update form entry to display lab order-numbers
    
    * Code review changes and updates

[33mcommit b43d43dfe17717cd7610b5824d0254f9891867f4[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Fri Jan 7 23:03:48 2022 -0800

    Always run tests in UTC timezone (#491)

[33mcommit 7cc718e790ee61c7b1c4db84def8ef9e8df606b5[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Sat Jan 8 00:59:46 2022 +0300

    03-973 : Remove tabs from Encounters page & move Notes extension to from (#479)
    
    Co-authored-by: Brandon Istenes <bistenes@gmail.com>

[33mcommit de06f63f13a2c9d924d67e1732ab48e7c09f8f86[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Jan 7 11:54:35 2022 +0300

    fixing broken test (#490)

[33mcommit 43b8c361ab961638827301cc22a177ecef20d412[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Jan 6 19:25:12 2022 +0300

    bug fix - fix wrong bmi calculations (#481)
    
    * bug fix - fix wrong bmi calculations, updated biometrics background
    
    * Code review changes and updates

[33mcommit 66b68d19831e7704d372358d4e3c5f21a4211f7b[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Jan 6 18:13:36 2022 +0300

    Fix failing Visit Form spec (#486)
    
    Yet another case where asserting against a Date value doesn't work reliably. Fixed by removing the errant assertion.

[33mcommit 47404f996844a243ff0fd54e260c0cb1611710cf[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 5 23:20:46 2022 +0300

    O3-978: Workspace tweaks (#480)
    
    Fixes some issues that arose from clinical testing. These fixes include:
    
    - Making the workspace header sticky positioned.
    - Making overflowed workspace content scrollable when the workspace window is maximized. This is currently not possible in the demo environment.

[33mcommit f496826bb0fa0642ae26f8ec6880aaab959af9bc[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Jan 5 20:52:49 2022 +0300

    bump up ampath-ngx-formentry version to the latest (#475)

[33mcommit 2ebe18bd23aee486feb9b9e188fe3c527cfa5c07[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jan 4 21:09:54 2022 +0300

    O3-985: Further enhancements to the Start Visit form (#484)
    
    * O3-985: Further enhancements to the Start Visit form
    
    * Update Past Visit modal prompt copy

[33mcommit b3a0771feb25c70205d293825c09378ce2a67a32[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Dec 21 21:56:36 2021 +0300

    O3-982: Visit form UI tweaks (#482)
    
    * O3-982: Visit form UI tweaks
    
    * Fixup

[33mcommit 86ba70540ffc1a9ef7f961de2ff7e88c9a389245[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Sun Dec 19 14:04:59 2021 +0300

    Change Vitals and Biometrics Detailed page to grid view (#474)

[33mcommit 56f1971007b4d65320618ffd6ece47d671d4a5a0[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Dec 16 05:11:14 2021 +0300

    Workspace warning modal enhancements (#478)

[33mcommit 2fcb80903272964bf78b36ba5cb09192044e519c[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Dec 14 00:35:44 2021 +0300

    03-938: Add ability to navigate to patient registration in edit mode (#469)
    
    * 03-938: Add ability to navigate to patient registration in edit mode from patient-search page
    
    * Code review changes and updates
    
    * Fixup
    
    Co-authored-by: Brandon Istenes <bistenes@gmail.com>

[33mcommit 07c50f7772f70d0eeac6c711e36bc301807a2179[m
Author: Emmanuel Nyachoke <achachiez@gmail.com>
Date:   Mon Dec 13 20:57:07 2021 +0300

    MF-868:Add providerUuid to valueProcessingInfo for Ampath form engine (#435)

[33mcommit 803d73c79e5eb2336ceb8790c7eeebc86954cfaa[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Dec 9 18:40:59 2021 +0300

    Fix form bugs on Validation by gender, visitType and program enrolment (#473)
    
    * Fix form bugs on Validation by gender, visitType and program enrollment
    
    * Fix WHO Staging data source

[33mcommit 04b5973a768efce765b15a6bfd968fe58e3e8f7b[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Dec 7 21:04:30 2021 +0300

    O3-940: Redesign patient avatars (#464)
    
    Redesign patient avatars to match the designs outlined in https://app.zeplin.io/project/61434fa756474d5545f65cf4/screen/614362b21dd66d20a276d8b8.
    
    This commit passes the patient name through the state prop into the Display Patient Photo extension. This will be used by the Avatar component to generate the patients initials and display them as a fallback when an image source is not provided. It also gets used as part of the alt text in case there's a problem rendering a user's avatar (so you have something like `John Wilson's avatar` instead of the more generic `Patient avatar`).
    
    `react-avatar` derives the patient's initials and display them as a fallback if an image source is not provided.
       - Set the colour prop to a transparent colour so that the background image (provided by geopattern) can be seen.
       - Set the `photo.imageSrc` value from the aforementioned `usePatientPhoto` hook as the src prop.
       - Finally, set the background image of the avatar to the pattern generated by geopattern using the patient UUID.

[33mcommit 5040727fc78ba54ce88130301966cf422c8410a9[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Dec 2 22:03:35 2021 +0300

    O3-935: Apply shadow to corner grid element on scroll (#470)
    
    Apply a box shadow effect to the corner grid element when the Timeline Overview is scrolled horizontally. This should have been included in https://github.com/openmrs/openmrs-esm-patient-chart/pull/462. Additionally, this commit makes some improvements to type annotations.

[33mcommit c5f7f786efbf6ad6e63e603b5460b10ca5350806[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Dec 2 19:25:23 2021 +0300

    O3-943: Recent Results overview header style fixes (#467)
    
    Fix the Recent Results overview header so that:
    
    - The test/panel title has a darker shade of grey in the tablet viewport versus a lighter one in the desktop viewport.
    - The test/panel title uses the 'productive-heading-02' Carbon type style.
    - The test/panel title is constrained to a max-width of 50% so that long names overflow.

[33mcommit 0283924bdedb6b84f581a7357ec28d4608857e15[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Dec 2 19:15:40 2021 +0300

    O3-942: Tweak the Recent Results overview action button (#466)
    
    There should be a button to the left of the test/panel title in the Recent Results overview header. This button should be labelled 'See all results' with an `Arrow24` icon. It should navigate to the Test Results dashboard when clicked.

[33mcommit 13fb76feb92e07267eb5dc909ae915f99b5d3570[m
Author: Manu Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Mon Nov 29 17:59:18 2021 +0100

    O3-834: Implement Caching of the Offline Forms (#471)
    
    * - Added essential offline forms UI and integrated it into the offline-tools.
    - Provide stubs/outline for offline caching strategy.
    
    * First iteration on the offline forms caching flow: Enable toggles and connect them to the caching logic.
    
    * Translation files.
    
    * Project restructuring.
    
    * Stop registering global cache requests for esm-patient-forms-app and remove requirement for past form encounters as they are used for rendering only.
    
    * Added explanation for offline code design decision.
    
    * Restored frontend deps and formatted file.
    
    * Enhance URLs cached for offline forms. Integrated offline forms into the patient-forms-app module.
    
    * Remove debug helpers.
    
    * Removed duplicate form entry extension registration.
    
    * Updated form caching to leverage SW messaging.
    
    * Added offline forms overview card to offline tools.
    
    * Translations.
    
    * Revert esm-form-entry-app package.json changes.
    
    * Removed console.log.
    
    * Allow invalidation in useLocalStorage hook.
    
    * Revert package.json.
    
    * Reinstalled packages.
    
    * Fixed failing tests caused by reinstalling packages.
    
    * Remove setupTests from tsconfigs.
    
    * Updated yarn.lock.
    
    * Fixed line endings.
    
    Co-authored-by: Manu Römer <manuel.roemer@smapiot.com>

[33mcommit 08b24a62f545f6add50d649c5ca31b9f43053dc4[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Nov 25 17:28:24 2021 +0300

    03-936 :  Fix error on clicking show all details on patient banner (#468)
    
    * 03-936 :  Fix error on clicking show all details on patient banner
    
    * Update design

[33mcommit c3a21b78353166d04edeef406ae55bb5fa518ae4[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 23 03:08:21 2021 +0300

    O3-922: Reorganize files in test results widget (#463)
    
    This commit makes the following changes that improve colocation in the test results widget:
    
    - Delete the `helpers.tsx` file and move the `Separator`, `InfoButton`, `TypedTableRow` and `RecentResults` components out to the places where they're used directly.
    - Delete the `lab-results.scss` file and move out the styles defined within it out to the places where they're used directly.
    
    Other changes include:
    
    - Fix the disjoint union type specified in the `CommonOverview` component (as suggested by @brandones in 03-922: Fix test results overview card border styling #455).
    
    - Replace the loading state in the `Timeline` component with a simple `InlineLoading` component.
    
    - Restore the teal bottom border under the Recent Results overview heading (in `recent-overview.scss`).

[33mcommit 152ae32e1d47d95c891381750bcee0030e23e71b[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Nov 20 11:20:06 2021 +0300

    03-922: Fix test results overview card border styling (#455)
    
    * 03-922: Fix test results overview card border styling
    
    Fixes the border styling of the test result overview cards so that:
    
    - A 2px solid teal border is applied to the active/selected card. That is, the card whose Trendline/Timeline view is currently open. If no card is active, then the topmost card in the layout should be considered the active/selected card. Also, this styling should only be applied when in the Desktop viewport. See Zeplin screen https://zpl.io/aRR4KLN.
    
    - All the cards have a 1px solid gray border around them in the Test Results dashboard view so they match the rest of the patient chart widgets.
    
    * Review feedback + reorganize components
    
    Sorry for the huge diff - I just felt it necessary to reorganize these components to help me better understand what's going on.
    
    Summary of changes in this commit:
    
    - Remove the ExternalOverview component - it's not being used anywhere.
    - Move CSS styles into SASS files.
    - Rename `desktopView` to `desktop-view.component` - helps make things consistent and also has the benefit of allowing i18next to automatically extract translations from the component.
    - Extract the `CommonDataTable` component into its own file.
    - Remove `isPatientSummaryDashboard` prop - I can use the insertSeparator prop to toggle styles based on whether the CommonDataTable is used in the Recent Results overview or in the Test Results overview.

[33mcommit fca4997b9f7a1efbd40dbf932b1000b2d96ce544[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Nov 19 22:35:01 2021 +0300

    O3-935: Visual tweaks to the test results timeline (#462)
    
    Apply some visual enhancements to the Timeline view UI to get it closer in line with the designs. These include:
    
    - Typography fixes - swap custom font styles for their corresponding Carbon type tokens.
    - Clean up CSS - move some of the style property definitions into classes in the corresponding SASS file.
    - Replace colour hex codes with colour variables from our style guide.
    
    While these fixes help move the needle in the right direction, they still don't fix all the outstanding design issues. Some tweaks to the grid layout are still needed - particularly around the look of grid item borders. Similarly, highlighting abnormal values can be improved. Box shadows are likely not the best solution for this, but they seem to yield better results than borders or outlines.

[33mcommit 3c337bc030dd90e3ad5cb943129dd790cde9539a[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 16 19:51:02 2021 +0300

    O3-933: Modifications to the Trendline view header UI (#461)
    
    This commit adds the following visual tweaks to the test result Trendline view header UI:
    
    - Display the reference range (when available) to the right of the test/panel title.
    - Add a `Back to Timeline` button with an `ArrowLeft24` icon button to the left of the test/panel title. The icon button should appear to the left of the button label.

[33mcommit a9045c12e44e73090a30886337c60235cd52397c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Nov 15 23:45:49 2021 +0300

    O3-930: Improve highlighting for abnormal test results (#460)
    
    Change the `outline` and `outline-offset` properties applied to table rows containing abnormal test results in the Results Overview as follows:
    
    - Change the `outline` applied to `low` and `high` test result table rows from `1px solid $ui-05` to `1px solid black`.
    - Change the `outline` applied to `critically-low` and `critically-high` test result table rows from `1px solid $danger` to `2px solid $danger`.
    - Change the `outline-offset` applied to `critically-low`, `critically-high`, `off-scale-low` and `off-scale-high` test result table rows from `-2.08px` to `-1px`.
    - Change the `outline-offset` applied to `low` and `high` test result table rows from `-2px` to `-1px`;
    
    Additionally, this commit also:
    
    - Adds a check that ensures that a table is rendered for a panel of tests even when a test within that panel might not contain an `interpretation` value.
    - Refactors the existing styles so that they are more easily readable.

[33mcommit 24ac7c2c740b943e4dcab66d601764a7f21be055[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Nov 12 23:52:40 2021 +0300

    Set patient chart dashboard title color (#457)

[33mcommit fb7417696c6d22bd0e29395c30dd484225ccf710[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Nov 12 23:50:54 2021 +0300

    Add extract-translations task to test results app (#456)

[33mcommit c43429283311e1e37b370fc7c60195d159ca30e9[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Nov 11 15:06:59 2021 +0300

    03-902 : : Fix immunizations form bug (#454)

[33mcommit 10f4388633e69dc03e195e8e6a75c61809e5754f[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Nov 6 03:22:42 2021 +0300

    Remove unused styles from CardHeader refactor (#453)
    
    Should've been part of https://github.com/openmrs/openmrs-esm-patient-chart/pull/451. Also applies the same refactor to the ObsSwitchableComponent.

[33mcommit e6d7e18873160e2e837993130209c60cdb6a6cfa[m
Author: Walter Kiprono <48877319+walteronoh@users.noreply.github.com>
Date:   Fri Nov 5 19:39:29 2021 +0300

    MF-721: set time range options in timeline to start from the current date (#448)
    
    * fix: set time range options in trendline to start from the current date
    
    * change: set upperRange as current date

[33mcommit 5cd1d4490499b9a294a3de38806d718f1d70c099[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Nov 4 13:00:35 2021 -0700

    Add generic patient widgets app to deployment (#452)

[33mcommit 4494b1a914539462e614cbaaebf2421702e70e2f[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Nov 4 22:18:15 2021 +0300

    MF-635: Reusable `CardHeader` component (#451)
    
    * Add CardHeader component to esm-patient-common-lib
    
    Factor out the widget card header UI to a reusable CardHeader component.
    
    * Remove duplicated card header styles
    
    * Reuse CardHeader component across patient chart widgets

[33mcommit c08e85cf06fafaf3e8670e6876b866ee91566c62[m
Author: Walter Kiprono <48877319+walteronoh@users.noreply.github.com>
Date:   Thu Nov 4 22:13:00 2021 +0300

    MF-831: add patient header details (#436)

[33mcommit f984328b1137a097bcf3e664b6d6caebdb610e21[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Nov 4 01:53:07 2021 +0300

    Fix incorrect `useLayoutType` import (#450)
    
    * Fix incorrect useLayoutType import
    
    `useLayoutType` is being imported from the wrong package in the ErrorState component - a change mistakenly introduced in https://github.com/openmrs/openmrs-esm-patient-chart/pull/446.
    As a result, an error is displayed instead of the appointments widget. This commit fixes the import and thus fixes the error.
    
    * Fix failing AllergyForm test
    
    This test was failing because of a missing implementation for `useLayoutType`. Despite a manual mock being available for `esm-framework`, this test suite was overriding that manual
    mock without providing a suitable alternative (a partial mock or similar). This commit fixes that problem by removing the partial mock of `esm-framework` and relying entirely on the
    already available manual mock.

[33mcommit c2affd39f511e50ebdb48b55a12e72f57ff2eddc[m
Author: Cynthia Chebet <40205991+KorirC@users.noreply.github.com>
Date:   Wed Nov 3 22:01:10 2021 +0300

    MF-737: validate biometrics and vitals form inputs to only allow numerals (#430)
    
    * validated biometrics and vitals form inputs to only allow numerical values
    
    * validated input fields to accept numbers only
    
    * chnaged input type to number
    
    * Inlined the jsx in return block

[33mcommit dddc14577d214babdb87845579c7ec35b9d2d717[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Nov 2 18:07:49 2021 -0700

    Proof of concept: generic patient summary widget (#443)

[33mcommit 29e3468b6d033e6135adef82d80f5c61ae27e003[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 2 21:21:51 2021 +0300

    MF-635: Fix patient chart widget card headers (#446)
    
    * MF-635: Fix patient chart widget card headers
    
    * Rebase and fix conflicts

[33mcommit 8edde9f27a223ffd8f4a544d98116f6f7e49b47b[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 2 18:05:11 2021 +0300

    MF-796: Add SWR to the immunizations widget (#441)

[33mcommit 63f77a2d9469d7982991a67156c1a1c67f6071b2[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 2 02:41:34 2021 +0300

    MF-635: Fix patient chart widget pagination (#447)
    
    * MF-635: Fix patient chart widget card pagination
    
    * Fix failing test

[33mcommit 30a75b73f1a149cc45c66339f7c8ed74807bba06[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 2 02:31:12 2021 +0300

    MF-635: Fix MedicationsDetailsTable dosage display (#444)
    
    * Fix failing tests
    
    * Fix dosage display in the MedicationsDetailsTable component
    
    * Remove test fixes - failures were false positives

[33mcommit f0805d13d15a594fe85e6e4be4b84d55872e3abf[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 2 02:29:06 2021 +0300

    Add type definitions for jest-dom (#445)

[33mcommit fb41112ab6f95c0dbf864b3095ff6fead5ac9e14[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Oct 29 01:48:36 2021 +0300

    MF-635: Fix design issues in the patient banner (#442)

[33mcommit 3de2b17396713baffd5a201e927eb290f84a8473[m
Author: Walter Kiprono <48877319+walteronoh@users.noreply.github.com>
Date:   Thu Oct 28 18:54:31 2021 +0300

    style: change expanded workspace tooltip (#440)

[33mcommit 364986031cbd7a18bf457c00bcda41d248b4c9f9[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Oct 27 18:27:42 2021 +0300

    MF-886: Program enrollment notification (#439)
    
    There should be a subtle way to notify the user that a patient has enrolled in all the available programs.
    
    This PR adds a check that evaluates the available care programs for enrollment eligibility. If a patient has already enrolled in all the available programs, an inline notification is displayed and the Add button (which launches the program enrollment form) gets disabled.

[33mcommit 0b3cf8adfb9662a2f8dbd07c3509f786b1bb76f6[m
Author: Maureen Nduta <67265839+maureennduta@users.noreply.github.com>
Date:   Wed Oct 27 00:16:06 2021 +0300

     MF-718:Fix and enlarge data points on chart  (#438)
    
    * MF-792:Patient header: Reduce space between borders and sectional headings
    
    * Trend: Data point dots should be visible all the time (without hover)

[33mcommit fc6f98f19fe79cddcfeb9920661aff5c0e00377a[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Oct 21 19:34:36 2021 +0300

    MF-817 Update Default ordering for chart and patient summary slots (#408)

[33mcommit f25aa92351b07dda5872619d86cb01941d925a8b[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Oct 21 18:51:53 2021 +0300

    Move extract translations task to pre-commit hook (#434)
    
    `yarn run extract-translations` should run pre-commit so that the updated translation files get committed.

[33mcommit fc39b922771508085fe00dc5f5e27cb88a2fc5f4[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Oct 21 07:21:03 2021 +0300

    MF-880 Fix patient-banner navigation on search page (#437)
    
    * MF-880 Fix patient-banner navigation on search page
    
    * MF-880 Add test and fix broken tests
    
    * Add test to pre-push

[33mcommit c151d56e9ed760620e32bf8613affe8968f446db[m
Author: Rubangakene Pius <piruville@gmail.com>
Date:   Wed Oct 20 22:52:27 2021 +0300

    Pius/add extension slot to workspace header (#428)
    
    * Add extension slot to context workspace header
    
    * fix linting
    
    * Remove changes to translations/en.json
    
    Co-authored-by: Brandon Istenes <brandonesbox@gmail.com>

[33mcommit bb7d8aea20651002e3f47137f9063ba2370dc8cd[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Oct 19 18:27:59 2021 +0300

    MF-699 : Fix New patient search shows previous patient workspace (#372)
    
    * MF-699 : Fix New patient search shows previous patient incomplete workspace
    
    * MF-699 : Code review

[33mcommit b6d9226422a02ed66e411ba5205353d19a39a73b[m
Author: Rubangakene Pius <piruville@gmail.com>
Date:   Fri Oct 15 12:20:34 2021 +0300

    Remove overflow-y from workspace container (#421)

[33mcommit cf7a9cd563c4a675a85e92a2fb21a33f6e565d3b[m
Author: Cynthia Chebet <40205991+KorirC@users.noreply.github.com>
Date:   Fri Oct 15 09:48:55 2021 +0300

    Disjoined Forms widget from other widget (#433)

[33mcommit d29331c115ac499c99effb6180f1570a720ed61f[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Oct 15 09:42:17 2021 +0300

    Restore test step in CI environment (#427)
    
    * Restore test step in CI environment
    
    * Fix failing tests

[33mcommit 0613587d69c851115180b05633ff41c5db771a87[m[33m ([m[1;33mtag: v3.0.3[m[33m)[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Oct 14 10:45:12 2021 -0700

    Release 3.0.3

[33mcommit 9a62c09f8469396ac366a8cb1d212ff46bd73b42[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Oct 14 10:43:33 2021 -0700

    Update yarn.lock

[33mcommit 0210af19d971db3594d21b2d1c902e1d6ae96b0b[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Oct 14 18:48:54 2021 +0300

    MF-709: Update warning modal text message (#432)

[33mcommit 37ea81caea17ffb6e8f8c218eeb1c8d8f7049ac8[m[33m ([m[1;33mtag: v3.0.2[m[33m)[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Oct 14 08:37:55 2021 -0700

    Release 3.0.2

[33mcommit 318ab65924b2585ad9bda56c7344ee7ac7358ff8[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Oct 14 08:00:45 2021 -0700

    Update deps, remove jsxBracketSameLine rule, run prettier (#431)
    
    * Update deps and run prettier
    
    * Switch from prettier/recommended to prettier
    
    * Use plugin:prettier/recommended. Disable jsxBracketSameLine

[33mcommit da7c6425cbaec352d119147c6557650ff320b21d[m[33m ([m[1;33mtag: v3.0.1[m[33m)[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Oct 14 06:18:11 2021 -0700

    Release 3.0.1

[33mcommit e983e315344d3dd2f085d221ca519b97bd8eb328[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Oct 14 06:20:15 2021 -0700

    Prettier

[33mcommit c09f5b1997f33637ff8d90ebc6da67892ccd90b4[m
Author: Eric Kibet <83347293+Eriq-Kibet@users.noreply.github.com>
Date:   Thu Oct 14 11:20:52 2021 +0300

    Changed concept units (#429)

[33mcommit 183b8cffd66c7eadfa3bd3b1f2caf82c700d0466[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Oct 14 04:00:11 2021 +0300

    MF-840: Add swr to past visits widgets (#425)

[33mcommit ca3905c222486ac58fa1a43214a24c123be3ad3a[m
Author: Manu Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Wed Oct 13 14:27:01 2021 +0200

    Preparations in esm-patient-forms-app for offline form tools and SWR introduction (#423)
    
    * - Migrated form hooks to SWR.
    - Simplified form fetching.
    - Cleaned unused files and members.
    
    * Renamed hook.
    
    * Remove obsolete API calls.
    
    * Use LF line endings.
    
    * Translation updates.
    
    * Line endings.
    
    * Updated translation string of search result and added missing class.
    
    * Remove unused imports.
    
    * Removed obsolete test file.
    
    * Removed min height rule.
    
    * Improved usage of SWR hooks. Added isValidating span.
    
    * Moved types to dedicated folder. Convert ?? to || for isValidating check in useForms.
    
    * Slight code style improvements.
    
    * Extract translations for esm-patient-forms-app.

[33mcommit 5f26dd9e760591ae248eb48066373d4ba85b9f30[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Oct 12 20:55:34 2021 +0300

    Fix broken tests (#426)

[33mcommit a558ba72b900d79eca021c237d1a34fef50c2837[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Oct 8 10:59:47 2021 +0300

    (bug) fix workspace not launching in maximized state (#424)

[33mcommit efe7e362c99c9e74dde32bc62f78862da8ae8a0e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Oct 7 20:14:57 2021 +0300

    MF-775: Order entry UI enhancements (#374)
    
    * MF-775: Order entry UI improvements
    
    This PR provides wide-ranging enhancements to the order entry UI with the primary motivation of getting things in line with the available designs.
    
    * Review feedback
    
    * Review feedback: stop prop drilling isTablet boolean

[33mcommit 654b2d4a2e244e44ed4de5dc546bc5cf64c2be0f[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Oct 6 23:04:32 2021 +0300

    MF-701: User should not be able to have multiple forms open at once (#406)

[33mcommit 282e59e0fc5eb5a3f8c9b2143b745c043500a718[m
Author: Samuel Male <samuelsmalek@gmail.com>
Date:   Wed Oct 6 11:51:04 2021 +0300

    Fix undefined reference error within the <Contact/> component (#420)

[33mcommit 488cb480af727e7189a3ebd6e7930ce3658287ad[m
Author: Cynthia Chebet <40205991+KorirC@users.noreply.github.com>
Date:   Tue Oct 5 18:44:41 2021 +0300

    Adjusted Recent Results widget to be sized like other Patient Summary Widgets (#413)

[33mcommit c948e75bbbe6a952275266edb617e3a055bb7a8a[m
Author: Nsereko Joshua <58003327+jnsereko@users.noreply.github.com>
Date:   Tue Oct 5 18:42:56 2021 +0300

    MF-827: Start Visit Form should require a visit type before a visit can an be started (#414)
    
    * MF-827: Start Visit Form should require a visit type before a visit can be started
    
    * Update packages/esm-patient-chart-app/src/visit/visit-form/visit-form.component.tsx
    
    Co-authored-by: Brandon Istenes <brandonesbox@gmail.com>

[33mcommit 13b4b0d25e5fa06293a90322e8a2799940ae53b9[m
Author: Cynthia Chebet <40205991+KorirC@users.noreply.github.com>
Date:   Tue Oct 5 14:53:17 2021 +0300

    resolved conflicts (#418)

[33mcommit 7b54c63787671b7fbf77db9038abf88f873e1f9a[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Oct 5 12:00:32 2021 +0300

    MF-829: Allergies page won't show if reaction manifestations are missing (#416)

[33mcommit f15d6d9113cb268a05d80ad709058df9342d1345[m
Author: Samuel Male <samuelsmalek@gmail.com>
Date:   Tue Oct 5 04:56:40 2021 +0300

    Make PatientBanner typing more specifc (#419)

[33mcommit 13875166de9b2ade157dfd34a32584a89aad6cb1[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Oct 4 17:34:49 2021 +0300

    MF-794: Add swr to biometrics widget (#407)
    
    * MF-794: Add swr to biometrics widget
    
    * Review feedback + enhancements

[33mcommit 89e7b1edbfe3394123ded2e8a865be547c606a0a[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Oct 4 16:16:34 2021 +0300

    MF-795: Add swr to vitals widget (#405)
    
    * Add swr to vitals widget
    
    * Review feedback
    
    Improvements to the VitalsOverview involving the use of the `withUnit` function. Additionally, this commit adds improvements to the Vitals resource that include:
    
    - Better type annotations.
    - Inlining the `filterByConceptUuid` function implementation in the `useVitals` hook.
    - Invoking `formatVitals` directly on the results of calling `filterByConceptUuid`. This has the corollary of reducing the number of lines of repetitive code significantly.

[33mcommit 7a0207104abd2f3dcc367aa610a7174aaa656f0b[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Oct 4 12:10:05 2021 +0300

    MF-797: Add swr to medications widget (#403)
    
    * MF-797: Add swr to medications widget
    
    * Review feedback

[33mcommit 79459609fb1bc757e19daaa473c8663351d4b7a6[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Oct 4 10:37:12 2021 +0300

    MF-790: Add swr to programs widget (#399)
    
    * Add swr to programs widget
    
    * Review feedback - inline change handler + enhance error condition logic

[33mcommit 4aa2468e2c5c03d5f8e7f76bab21407502500d0d[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Oct 1 20:47:42 2021 +0300

    Add swr to relationships widget (#409)

[33mcommit 814315843f6c545526440c56e00c2a17d58d0600[m
Author: Walter Kiprono <48877319+walteronoh@users.noreply.github.com>
Date:   Fri Oct 1 15:45:01 2021 +0300

    style: change semantics in order workspace (#398)

[33mcommit edd05b6cb832fab2afa9c9f250768f6498ae47a3[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Oct 1 06:17:39 2021 +0300

    MF-798: Add swr to appointments widget (#400)
    
    * Add swr to appointments widget
    
    * Wide-ranging refactors
    
    1. Refactor the appointments Form logic to:
    
      - Use SWR for data fetching.
      - Add a call to mutate so that the appointments widgets get a trigger to revalidate their data when a new appointment is successfully scheduled.
      - Simplify state change handlers so it's absolutely clear what's changing at any given time.
      - Render a SearchSkeleton instead of a DataTableSkeleton when the form is loading after launch.
    
    2. Rename the appointments form workspace extension slot to the plural form `appointment-form-workspace`.
    3. Move the useAppointmentService hook to the appointments resource.

[33mcommit 08c0c5b4c44ac014af3646aebb9226f87ae8c3f1[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Oct 1 05:15:42 2021 +0300

    Add swr to notes widget (#401)

[33mcommit 313205bb7b8461ed199b746bcb55be4a016cb8b4[m
Author: Manu Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Thu Sep 30 13:55:24 2021 +0200

    Added missing entries to panel test data. (#411)

[33mcommit 029b419c6445270ae3e8de77bd973b390239af5c[m
Author: Vineet Sharma <51502471+vasharma05@users.noreply.github.com>
Date:   Thu Sep 30 16:09:16 2021 +0530

    MF-783: Session Check Fixup (#384)
    
    * Session Fixup
    
    * lint fixup
    
    * TS error fix in visit-notes-form.component
    
    * Final fixup

[33mcommit 1bbe2f6b633028a287277132ea18d43612b5e264[m
Author: Manu Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Thu Sep 30 12:15:10 2021 +0200

    Fix the formatting of the dates in the timeline grid. (#410)

[33mcommit 8c46d2647835fcfe98f040053c92c37c4a50c595[m
Author: Samuel Male <samuelsmalek@gmail.com>
Date:   Wed Sep 29 00:00:43 2021 +0300

    Patient banner to be used in the patient search (#385)
    
    * Patient banner to be used in the patient search
    
    * Remove unused imports
    
    * Revert local linter fixes
    
    * Use <button> for clickable elements
    
    * Remove unused import
    
    * Scrap off  extension prop

[33mcommit abddc4b132d9651f02a2f7348d558b63823b1e7c[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Sep 28 15:08:22 2021 +0300

    (enhancement) carbonise appointment form (#387)
    
    * (bug) fix failing test on visit and medication apps
    
    * (enhancment) implement carbon appointment form
    
    * Code Review changes

[33mcommit e3dac715eea0affb426639fed5f9cce0e6e81a00[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Sep 28 15:04:08 2021 +0300

    MF-757: fix bug on failing charts (#392)

[33mcommit 4b2928191a1b845144ba778baf2592aa1abeacd6[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Sep 28 11:44:36 2021 +0300

    MF-793: Add SWR to conditions widget (#397)
    
    * Add SWR to Conditions widget
    
    * Refactor `ConditionsForm` logic
    
    Remove the view state reducer logic from the ConditionsForm component code. I'll argue that it only served to make the code unwieldy and harder to reason about. This change shaves 100 lines of boilerplate from the component code as well.
    
    * Review feedback - reduce mock observable delay time to 10ms

[33mcommit 447845bb4d50e879f522fcdaec762f8fc3722d22[m
Author: Manu Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Tue Sep 28 02:51:07 2021 +0200

    - MF-713: Show akk data for a test (#393)
    
    - Update D3 and carbon charts to fix version runtime errors.

[33mcommit cccfddaaac07c3cab96f08913352a63e77362311[m
Author: Cynthia Chebet <40205991+KorirC@users.noreply.github.com>
Date:   Fri Sep 24 05:42:25 2021 +0300

    MF-744: Tablet mode-Expand Date and time column to fit - not wrapped (#365)
    
    * Tablet mode: Expand Date and time column to fit - not wrapped
    
    * Tablet mode: Expand Date and time column to fit - not wrapped
    
    * Expand Date and time to fit in tablet mode
    
    * Remove extraneous table color changes
    
    Co-authored-by: Brandon Istenes <brandonesbox@gmail.com>

[33mcommit f3826a3ce4bae638e94a228f9a978c2c1f9e7d3b[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Sep 24 05:19:02 2021 +0300

    Tablet mode: Border-line showing up on patient chart - almost similar to side rail (#394)

[33mcommit df62e1c3ea11f3bc3f37af5ef42b1e9229fab92f[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Sep 24 03:40:19 2021 +0300

    MF-788: Add swr to allergies widget (#383)
    
    * Add swr to allergies widget
    
    * Update success toast message
    
    * Add pagination to overview component
    
    * Update tests to reuse swrWrapper

[33mcommit 443c0b6f15f357160b5d732cbed2d9131439bc74[m
Author: grace potma <67400059+gracepotma@users.noreply.github.com>
Date:   Thu Sep 23 14:46:51 2021 -0700

    Add "pillstoDispense" (#395)
    
    * Add "pillstoDispense"
    
    Added "pillstoDispense"
    
    * Update packages/esm-patient-medications-app/translations/en.json
    
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>
    
    Co-authored-by: Brandon Istenes <bistenes@gmail.com>
    Co-authored-by: Dennis Kigen <kigen.work@gmail.com>

[33mcommit aae0f1d94439a0a6927d9be1561b43be4cfeefb6[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Sep 23 15:13:45 2021 +0300

    Add SWR test helpers (#389)
    
    * Add SWR test helpers
    
    * Review feedback

[33mcommit 320ebc4e79bddba1d642a99408ff88cdffdc7906[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Sep 23 02:57:01 2021 -0700

    Add "descriptive title" requirement to PR template (#390)
    
    * Add "descriptive title" requirement to PR template
    
    * Update pull_request_template.md

[33mcommit 16d87b1f99fb7c3de78fff4280c4e69548515ac0[m
Author: Walter Kiprono <48877319+walteronoh@users.noreply.github.com>
Date:   Thu Sep 23 11:07:20 2021 +0300

    style: change text to sentence case on the allergies form (#391)

[33mcommit f56d0be6ff47c463bf77e1eb2a6d76ba32082157[m
Author: Maureen Nduta <67265839+maureennduta@users.noreply.github.com>
Date:   Tue Sep 21 18:20:18 2021 +0300

    MF-765 Change Actions list items to sentence case (#386)

[33mcommit 50d4ea3e7eaf139df1e7f6133b28a7ec146a6b1d[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Fri Sep 17 17:59:10 2021 +0200

    Adjusted imports of carbon-components-react

[33mcommit d35a27241b16b3932b7aff37f8c15c80f2c202e9[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Sep 17 17:02:12 2021 +0300

    Wrap patient chart in SWRConfig context (#382)
    
    * Wrap patient chart in SWRConfig context
    
    This PR adds the SWR dependency to the patient chart and wraps the `PatientChart` component in an SWRConfig context that
    specifies some sensible global configuration default options for all SWR hooks.
    
    * Review feedback

[33mcommit de948d71602fe87569afa742e667a1d201bf0848[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Fri Sep 17 01:33:48 2021 +0200

    Started refactoring the carbon-component-react imports

[33mcommit c33201eb52b1b1fa4c90db5479e56c52f50070a7[m
Author: Cynthia Chebet <40205991+KorirC@users.noreply.github.com>
Date:   Thu Sep 16 15:19:05 2021 +0300

    MF-679: Carbonize immunizations form (#322)
    
    * carbonize immunizations form
    
    * carbonize immunizations form
    
    * added vaccine name
    
    * resolved conflict
    
    * made the changes as requested
    
    * changed interface name to be in PascalCase

[33mcommit 5103b7aeeb7b8cb2ae482eee3f0b0bd7680510ea[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Sep 14 16:39:05 2021 +0300

    Enhancement : Carbonise Appointment widget (#380)
    
    * Enhancement : Carbonise Appointment widget
    
    * Enhancement : Carbonise Appointment widget Code Review

[33mcommit 3d4127731da546d62ee1f4bf0ab0dedb8ac098cb[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Sep 14 00:05:00 2021 +0300

    MF-635: Biometrics and Vitals widgets toggle buttons (#379)
    
    * MF-635: Biometrics and Vitals widgets content switcher
    
    This PR modifies the table/chart toggle on the Biometrics and Vitals widgets to match the provided design.
    
    * Review feedback

[33mcommit 4bb07625842589e2de48386cd192c59629293f1b[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Sep 13 23:49:26 2021 +0300

    Fix forms rendering bug (#381)
    
    Fixes a bug in the forms widget where a `0` is being rendered when the `allForms` array is empty.

[33mcommit b6087467ef259b519df97edaf9b3f93313c83873[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Sep 13 15:59:20 2021 +0300

    MF-635: Add a border to individual patient chart widgets (#378)
    
    Adds a border of `1px border $ui-color` to each widget card (including EmptyState and ErrorState widgets) as stipulated in the [designs](https://app.zeplin.io/project/60d59321e8100b0324762e05/screen/60d59c8c1ff239bbe989d7d5).

[33mcommit 567857f6e995c60b25af9ba25418454d272f0672[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Sep 13 10:31:48 2021 +0300

    MF-635: Enable `useZebraStyles` striping for widget datatables (#377)
    
    Add the `useZebraStyles` prop to Carbon `Table` components so they have zebra-striped design as specified in our [designs](https://app.zeplin.io/project/60d59321e8100b0324762e05/screen/60d59c8931f6ac12c4675c2d). This PR also fixes a problem with the Appointments widget card header.

[33mcommit fbd0934bc50b03719405ce7acefac3ac2e74b586[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sat Sep 11 01:09:31 2021 +0300

    MF-774: Add empty states to medications widget (#376)
    
    This PR adds empty states to both the Active and Past medications widgets. Additionally, this PR also:
    
    - Tweaks the header title of the medications widget card so it matches the style of the other widgets (as well as the designs).
    - Renames a SASS stylesheet.

[33mcommit cabc6b3d2ebb4d714103a9b9f31a5d1cf98270f4[m
Author: Vineet Sharma <51502471+vasharma05@users.noreply.github.com>
Date:   Sat Sep 11 02:38:05 2021 +0530

    MF-776 and MF-715: Changes in the medications tab in the patient chart. (#369)
    
    * Fixed the orders according to the designs.
    
    * Review Changes
    
    * Completed

[33mcommit 4ab9835fd33b80c5714ea396392e6f3e9a91a0e0[m
Author: Cynthia Chebet <40205991+KorirC@users.noreply.github.com>
Date:   Fri Sep 10 11:21:01 2021 +0300

    Widen patient chart widgets to match designs in tablet mode (#375)

[33mcommit 2b1f5a3dcc83bbc7f25addd7c8a55772534b9ed8[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Tue Sep 7 01:57:59 2021 +0200

    Merge branch 'master' of https://github.com/openmrs/openmrs-esm-patient-chart

[33mcommit 67d817ad97a1704fc10406cab034b22e36519283[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Sep 9 12:16:47 2021 +0300

    Add test helpers (#373)
    
    Add a test helpers file with `getByTextWithMarkup` and `waitForLoadingToFinish` helpers.

[33mcommit f1fb52039ad2ab9483e9398886884607c820d279[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Sep 9 01:27:01 2021 +0300

    Create pull_request_template.md (#371)
    
    ### What does this PR do
    
    1. Following [this](https://github.com/openmrs/openmrs-esm-patient-chart/pull/334#pullrequestreview-733686067) discussion on PR templates, this PR introduces PR template whenever a pull request is created

[33mcommit fa2acf5c396618969c4a408cf709c948db56ca9f[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Sep 8 16:55:42 2021 +0300

    MF-564 : Fix tests that were deactivated (#370)
    
    * MF-564: Reactivate allergy form tests
    
    * MF-564: Reactivate clinical form tests
    
    * MF-564: Reactivate  visits tests
    
    * MF-564: Add actions buttons tests
    
    * MF-564: Add form entry tests

[33mcommit 76aff83ab91b38db7f7993ced8e14bfd4e765fc1[m
Author: Vineet Sharma <51502471+vasharma05@users.noreply.github.com>
Date:   Wed Sep 8 15:29:15 2021 +0530

    Fixed the margins in the patient banner (#368)
    
    * Fixed the margins in the patient banner
    
    * Added check for skipping lib checks for typescript
    
    * Corrected the JSON format in tsconfig.json

[33mcommit 975c661776a40dfd49009397d7e9638a3068b0e9[m
Author: Eric Kibet <83347293+Eriq-Kibet@users.noreply.github.com>
Date:   Wed Sep 8 10:55:46 2021 +0300

    MF-751 Closing workspace using Forms Icon (#363)
    
    * Closing workspace using Forms Icon
    
    * Close Workspace side panel by clicking Forms icon
    
    * Type Changes

[33mcommit 385680344dc310c6746b95a28a15a1705ecfdbf5[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Sep 7 13:23:06 2021 +0300

    Update README (#367)
    
    Update dev server startup command. It won't run as currently configured.

[33mcommit 2ba59799316f1127a7e6983b4d96f11e6e26f0bd[m
Author: Maureen Nduta <67265839+maureennduta@users.noreply.github.com>
Date:   Tue Sep 7 12:10:16 2021 +0300

    MF-768: Fix broken VitalsOverview test. (#366)
    
    * MF-730 Change Actions button on patient chart to match designs
    
    * Updated Vitals-Overview Test

[33mcommit ebc0205e5e717fd804fb2796272dda68a0f6db54[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Sep 6 14:34:15 2021 +0300

    Patient chart summary UI enhancements (#364)
    
    This PR introduces enhancements to the patient chart summary UI that include:
    
    - Showing header titles for dashboard widgets in the grid-based layout (explanatory screenshot linked below).
    - Adding a teal bottom border to the Immunizations and Medications widget header titles.
    - Removing a superfluous CSS style reset from the Medications widget.

[33mcommit 766ee0d37725ba0125be6519be273f1157baec7d[m
Author: Maureen Nduta <67265839+maureennduta@users.noreply.github.com>
Date:   Mon Sep 6 11:59:21 2021 +0300

    MF-763 Enhance vitals and biometrics chart to match designs (#361)
    
    * MF-763 Enhance vitals and biometrics chart
    
    * Update biometrics-chart.component.scss

[33mcommit ffa604382f560a221a6e6ab4f76b1da84949bfef[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sun Sep 5 00:18:28 2021 +0300

    Remove duplicate `Date enrolled` form label (#362)
    
    A recent change to the ProgramsForm component test suite involved mistakenly adding a superfluous label to
    the `Date enrolled` date picker input. This commit removes that label.

[33mcommit 3c5964c3719e438fdde16db6cc2500667d2c3fb9[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Sep 2 23:36:11 2021 +0300

    Restore form tests (#358)
    
    * Restore form tests
    
    Refactors and restores outdated tests for the following components:
    
    - `ConditionsForm`
    - `ProgramsForm`
    - `VisitNotesForm`
    
    Also includes small refactors to overview components and app entry points, mostly involving renaming extension slot
    names to include the word `form`. This hopefully helps to disambiguate extension slots for forms. Overall, coverage for these tests exceeds 80%.
    
    * Review feedback + finalise `VisitNotesForm` component
    
    Fix lodash imports and complete `VisitNotesForm` component test suite.

[33mcommit 453de3fdd35ae6f75af096f3a1a13d95e74720d9[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Sep 2 16:06:43 2021 +0300

    MF-764 : Fix Error on loading form widget (#360)

[33mcommit 15534508b40eb45a8d3772bbce4e24ad9c91c8ed[m
Author: Maureen Nduta <67265839+maureennduta@users.noreply.github.com>
Date:   Thu Sep 2 12:14:36 2021 +0300

    MF-730 Change Actions button on patient chart to match designs (#350)
    
    * MF-730 Change Actions button on patient chart to match designs
    
    * Prettify

[33mcommit e0ecbeda8efa955544cd32978ab5896de2b2896c[m
Author: Eric Kibet <83347293+Eriq-Kibet@users.noreply.github.com>
Date:   Thu Sep 2 12:13:56 2021 +0300

    start visit button open form (#359)

[33mcommit 2a1f0f515a8ecd5f09c4fca96e5107a1c4da1757[m
Author: Cynthia Chebet <40205991+KorirC@users.noreply.github.com>
Date:   Thu Sep 2 11:55:22 2021 +0300

    Alternating background colors for rows (#342)

[33mcommit 83ee08080116227943af79b8ae76aa52a07ab766[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Sep 1 14:16:20 2021 +0300

    MF-755 : Lab Results Showing under wrong Panel in Summary Widget (#356)

[33mcommit 73ea84e43cd4cab74cbcb0e9d2f1273a48f062c3[m
Author: Eric Kibet <83347293+Eriq-Kibet@users.noreply.github.com>
Date:   Wed Sep 1 14:02:39 2021 +0300

    Clicking Modify Should open the order basket (#357)

[33mcommit 702f27b85d5379cb71a9d4754f282973bd0568f5[m
Author: Eric Kibet <83347293+Eriq-Kibet@users.noreply.github.com>
Date:   Tue Aug 31 12:43:29 2021 +0300

    Renamed Change button  to Add (#354)

[33mcommit 911746ce74e5238c968b94858ef76a545d150cb1[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Aug 31 12:32:28 2021 +0300

    Test fixes (#352)
    
    This PR includes fixes for tests in this repo. These include:
    
    - Fix tests that are currently failing (for `PatientBanner`, `NotesOverview`, `NotesDetailedSummary` and `VitalsOverview` components).
    - Add new tests for the `ActiveVisitBannerTag` , `EmptyState`, `ErrorState` and `PatientBanner` components.
    - Fix TypeScript errors for missing extend-expect Jest matchers in tests by modifying the `extend-expect` import in `setupTests.js`.
    - Omit tests in the `esm-form-entry-app` package from being run by the testing environment. These tests were meant to be run in an Angular context.

[33mcommit afaf8c6b73e94a884ac3fe6997f21192211c31d9[m
Author: Cynthia Chebet <40205991+KorirC@users.noreply.github.com>
Date:   Tue Aug 31 10:06:25 2021 +0300

    MF-731: Prettify the scss file  (#351)
    
    * Enhancements on the patient header expansion to match designs
    
    * Prettify

[33mcommit 0d533821c6d7211b7daf9b59913fd6dd7525cd6f[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Aug 31 00:22:46 2021 +0300

    MF-685: Red dot for in-progress item when workspace item is closed (#353)

[33mcommit c937da78747d0d5493c4e0aaffdb03ca699e596c[m
Author: Eric Kibet <83347293+Eriq-Kibet@users.noreply.github.com>
Date:   Mon Aug 30 13:58:03 2021 +0300

    Mf 758 Change Muac to caps since they are initials - MUAC (#348)
    
    * Added Muac(cm) to biometric Table
    
    * Change Muac to caps since they are initials - MUAC

[33mcommit 111376b5b67b11f281f4fbc67c666d36b789433c[m
Author: Cynthia Chebet <40205991+KorirC@users.noreply.github.com>
Date:   Mon Aug 30 12:55:07 2021 +0300

    Enhancements on the patient header expansion to match designs (#349)

[33mcommit d3080b4677784df49b6e7032037b55027e9ae48a[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon Aug 30 10:08:29 2021 +0300

    MF-694 : Add border highlighting for abnormal results (#345)

[33mcommit 89005fe1c1fce0f0ae81bee9eba77cfad0a5f567[m
Author: Eric Kibet <83347293+Eriq-Kibet@users.noreply.github.com>
Date:   Sun Aug 29 20:10:53 2021 +0300

    Added Muac on biometric Table (#347)

[33mcommit 853197ceb6dd2b870f8a2a640f0ecf35e8259fc4[m
Author: ALEX KEMBOI <84083929+alexkemboi4127@users.noreply.github.com>
Date:   Sun Aug 29 19:59:49 2021 +0300

    Mf 740:Changed the design of the  success message (#344)
    
    * added a toast confirm message
    
    * MF-740:Changed success message

[33mcommit 8163ade197f03dbc65d9b6a9bdc4d775bee393fd[m
Author: Nischith Shetty <drnjshetty@gmail.com>
Date:   Thu Aug 26 23:59:32 2021 +0530

    MF-439 & MF-736:  'See All' link redirection and widget pagination (specifically for: Vitals, Biometrics & Notes widgets) (#337)
    
    * MF-439 Vitals/Biometrics/Forms Pagination
    
    * MF-439 and MF-736 Vitals/Biometrics/Forms Pagination commit2
    
    * MF-439 Vitals/Biometrics/Forms Pagination commit3
    
    * MF-439 and MF-736 Vitals/Biometrics/Forms Pagination commit4

[33mcommit 7b69087f6905af5b358f419cfe0b59945b21b3af[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Aug 26 16:10:40 2021 +0300

    Fix README typo (#346)
    
    Just that.

[33mcommit 5a5749775db8375c3826bd346212f7f508b9c020[m
Author: Eric Kibet <83347293+Eriq-Kibet@users.noreply.github.com>
Date:   Thu Aug 26 10:12:30 2021 +0300

    MF-693: Carbonize the immunizations widget (#338)
    
    * MF-693 Carbonize the immunizations widget
    
    * Added inner table Component
    
    * added utils component
    
    * added utils component
    
    * Added useState

[33mcommit 5e1a9c88fe12c5d51d0ba4042b9ffe73eaee4ba3[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Aug 25 15:11:10 2021 +0300

    MF-739: Test Results widget empty state has two titles (#343)
    
    Recent work on the empty state for the Test Results widget led to a situtation where the widget card has two header titles instead of just one title that reads:
    
    - `Recent Results` for the recent results overview.
    - `Test Results` for the test results overview.
    
    This PR implements those changes in addition to making some other small grammatical fixes.

[33mcommit 4fe85fbbb22d0baf5d61acc39e1302dd727c3d15[m
Author: Cynthia Chebet <40205991+KorirC@users.noreply.github.com>
Date:   Tue Aug 24 20:22:59 2021 +0300

    Display time on vitals and biometric table (#341)

[33mcommit e28579ebca82ab7fcc08a190c2ce18828e8a7c14[m
Author: Cynthia Chebet <40205991+KorirC@users.noreply.github.com>
Date:   Tue Aug 24 12:30:06 2021 +0300

    Interchanged table background color for rows to match designs (#340)

[33mcommit 5eb08d3f9d943cf4fa6f2b3051d0d5be604f00aa[m
Author: Herbert Bruno Oketayot <43681445+herbertUG@users.noreply.github.com>
Date:   Mon Aug 23 16:33:16 2021 +0300

    MF 735: Add support to open the workspace on full-screen mode (#336)
    
    * Add support to open the workspace on full-screen mode
    
    * lint files
    
    * add support for max screen on actionmenu
    
    * add support for max screen on actionmenu
    
    * fix lint
    
    * remove lock file

[33mcommit c9d10f7f028430c6136b52b55e5b4c316a23a37b[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Aug 20 16:12:36 2021 +0300

    MF-700: Empty state for test results widget (#335)

[33mcommit 67b1182ce777050c56ec718e5af8d84c255e3fc2[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Aug 20 04:24:43 2021 +0300

    Mf 684 : Fix long test results on patient summary (#320)
    
    * MF-684 : Fix Test results showing too much results and included pagination
    
    * MF-684 : Fix Test results showing too much results and included pagination

[33mcommit 6ba7a8db874f0e88b49ae30fb3ec7eb367ef70c0[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Aug 19 11:15:23 2021 +0300

    MF-729: Fix space gap between chart area and workspace (#333)

[33mcommit ed770c2b1198c9f3544cfa8459587875e4c121ff[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Aug 18 13:00:34 2021 +0300

    MF-576 : Reset button on the Add clinical views page (#332)

[33mcommit 8e60da5149aed119df264f30ef062f45bd2f7aae[m
Author: Nischith Shetty <drnjshetty@gmail.com>
Date:   Sat Aug 14 16:08:05 2021 +0530

    MF-522 (See all button under forms widget opens the clinical views page) (#321)
    
    * Ticket MF-522 new requirement
    
    * Ticket MF-522 new requirement commit2

[33mcommit 1f0f431d71f8a723fcffd504b6cdbcef8337655c[m
Author: Cynthia Chebet <40205991+KorirC@users.noreply.github.com>
Date:   Thu Aug 12 17:21:19 2021 +0300

    Mf 652 (#326)
    
    * widened vitals, immunization, allergies and biometric widgets
    
    * sorted vitals by date
    
    * corrected the error with the type any

[33mcommit 14590487b049428d4c6908c35ed1eb07638537f5[m
Author: Cynthia Chebet <40205991+KorirC@users.noreply.github.com>
Date:   Thu Aug 12 16:54:37 2021 +0300

    widened vitals, immunization, allergies and biometric widgets (#324)

[33mcommit 8b5ac3842f91447c75b89f97a003b4ea9dbfbe71[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Aug 12 16:33:04 2021 +0300

    Carbonised start visit components (#319)
    
    * Add file structure and past visit component
    
    * Add ability to end current visit
    
    * Start Visit form structure
    
    * Add ability to save new visit
    
    * Remove unused components
    
    * self review
    
    * Code Review changes

[33mcommit 435cd96401060e56341e10a2637487b84565d7fd[m
Author: Walter Kiprono <48877319+walteronoh@users.noreply.github.com>
Date:   Thu Aug 12 15:07:00 2021 +0300

    changed immunization success toast message to sentence case (#325)

[33mcommit 169fea0ab0bdd3846c3d05076f14f7d8781f8d4c[m
Author: Walter Kiprono <48877319+walteronoh@users.noreply.github.com>
Date:   Thu Aug 12 13:15:27 2021 +0300

    add showToast on submitting immunization form (#323)
    
    * add showToast on submitting immunization form
    
    * rm unused function

[33mcommit b50eb9b30550fc9343a401ba975d4cd638ffaa9a[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Sun Aug 8 15:32:49 2021 +0200

    Moved form entry

[33mcommit e6f15904db15aabd320efaee8f9a2f5a6be835f7[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Fri Aug 6 22:24:33 2021 +0200

    Cleanup cosmetics

[33mcommit 9d356f866c10276d5c90a898b86e7d78b695cc85[m
Author: Cynthia Chebet <40205991+KorirC@users.noreply.github.com>
Date:   Fri Aug 6 14:18:30 2021 +0300

    widened care programs and conditions widget (#317)

[33mcommit 7e4202665d0bbf0283aaa4db61e863f1429adf36[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Aug 5 17:15:58 2021 +0200

    Improved preview size

[33mcommit 04511f16d85e088b947d521ac480abda1b904f05[m
Author: Nischith Shetty <drnjshetty@gmail.com>
Date:   Thu Aug 5 17:32:09 2021 +0530

    MF-522: See all button under forms widget opens the clinical views page (#314)
    
    * Fix for ticket MF-522
    
    * Fix (two) for the ticket MF-522
    
    * Fix (three) for ticket MF-522
    
    * Fix (four) for ticket MF-522
    
    * Fix (Five) for ticket MF-522

[33mcommit 5ba6fab107f3883fde4e2999fcaa430c179fe9d5[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Aug 4 09:55:06 2021 +0300

    Add ability to reopen minimized workspace items (#315)

[33mcommit d3fc05c210771ab844a4086b64527ed595fef5e1[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Aug 3 16:47:15 2021 -0700

    Change 'start' script to start a single package, add start-all script (#316)
    
    * Change 'start' script to start a single package, add start-all script
    
    * Review feedback

[33mcommit 7478af24da75e90e541a255323d00a985a11481c[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Jul 30 10:18:20 2021 +0300

    Add ability to maximize and minimize workspace (#313)
    
    * Add ability to maximize and minimize workspace
    
    * Code review

[33mcommit f106fb9685dc77620e1c48d278a91f8cd8fa468e[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Wed Jul 28 10:15:15 2021 -0700

    Make errors in immmunizations features apparent (#312)
    
    * Make errors in immmunizations features apparent
    
    * Review feedback

[33mcommit 04e7221efb8880fdf968b78de37c522e3972aa1d[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Tue Jul 27 23:59:33 2021 -0700

    Rewrite the README, removing most of it (#311)

[33mcommit d8ad8871b0756c9c77bbbe2de24c0bf180b7b307[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Jul 26 10:24:20 2021 +0200

    Fixed non-updated navbar

[33mcommit 5b6f00f1107e74b2de21099baf25895b7b9f9889[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Jul 26 09:47:48 2021 +0200

    Streamlined code

[33mcommit 60131a909297c900c9abdff7c7161c78a020d5ad[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Sun Jul 25 10:52:54 2021 +0200

    Updated translation files

[33mcommit d79f56504bc0e45fbf4f205b1b3b79d437fcda87[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Sun Jul 25 10:51:20 2021 +0200

    Added husky prepare

[33mcommit 494ae78141c0a6b533b1834b11e30eb23c85c3ee[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Sun Jul 25 10:49:31 2021 +0200

    Improved attachments

[33mcommit 1d7c75a141fef4caeada7e732b5153cc592127cd[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Sat Jul 24 01:26:23 2021 +0200

    Lint fixes

[33mcommit d8fabdf3e1362702895cf7e27eff7ad2dadb1a3e[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Sat Jul 24 01:04:34 2021 +0200

    Improved attachments

[33mcommit 8ea78b9caec7c324254383185d4670c30164c1bf[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Jul 22 00:44:49 2021 +0300

    Collect test coverage from components (#310)

[33mcommit ec98a430095f6b22ca37da14bf509eb95abe3294[m
Author: Vineet Sharma <51502471+vasharma05@users.noreply.github.com>
Date:   Wed Jul 14 03:57:42 2021 +0530

    Extension slot created for patient tags in the banner (#309)
    
    * Extension slot created for patient tags in the banner
    
    * Removed unused imports

[33mcommit 6c26479d8a16ed3ae654d89b17651b5586da3e12[m
Merge: 83c00f93 55e5a0d3
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Fri Jul 9 09:27:13 2021 +0200

    Merged

[33mcommit 83c00f93f8281793aa0f48da49dc0c5ac8d498af[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Fri Jul 9 09:20:02 2021 +0200

    Small enhancements

[33mcommit 55e5a0d3c1e38a845f20ea3f1b024d787b7324f6[m
Author: Manuel Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Thu Jul 8 11:04:56 2021 +0200

    Added descriptor to offline visit queue. (#308)
    
    * Added descriptor to offline visit queue.
    
    * Line endings.

[33mcommit 6f9a98644a4faf5c6543e03e144d2497caa737a8[m
Author: Manuel Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Wed Jul 7 23:55:32 2021 +0200

    Use useVisit in more locations and transitively pass the current visit to esm-form-entry so that forms are associated with (offline) visits (#307)
    
    * Use useVisit hook whenever easily possible.
    
    * Pass current visit UUID to form.
    
    * Line endings.

[33mcommit fd60e8d15f185715114215868a6d05e113bb8d5a[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jul 6 14:44:22 2021 +0300

    Manage form view states with useReducer (#306)
    
    - Use `useReducer` hooks to manage view states in forms. I think these implementations are easier to reason about than
    their equivalent `useState` hook based implementations.

[33mcommit d4d8b4c2398dca4a01fbd594de4d0927fb31ef49[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Jul 5 00:52:46 2021 +0200

    Removed unnecessary be deps

[33mcommit b4e59ba85a4d1e91ea4f0a314305135b2161d71d[m
Author: Amos Laboso <amos.laboso@gmail.com>
Date:   Tue Jul 6 10:38:18 2021 +0300

    FIX: Found modules with unresolved backend dependencies. fhir module missing dependency where fhir2 module is in use (#305)
    
    Co-authored-by: amuj <alaboso@uonbi.ac.ke>

[33mcommit dc462a26d6fe3147a200b42bff8e79d0b25b5ae4[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Jul 1 23:07:21 2021 +0300

    MF-637: Fix design issues removed active visit underline (#304)

[33mcommit e29eb1972ce5d890a23eeb3400fbc141ac36c145[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Jul 1 17:45:42 2021 +0300

    Remove Medication Orders as a default clinical view (#303)

[33mcommit 1fe85819a789c32d7ff06b3ce9fed8f211cbb0f0[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Jun 30 13:00:38 2021 +0300

    Fix design issue 1: SideBar navitems height (#301)

[33mcommit 115a05f0da099c051a5803d0ab42f8fcbea81ce4[m
Author: Manuel Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Wed Jun 30 12:00:08 2021 +0200

    Use a real UUID for offline visits. (#302)
    
    * Use a real UUID for offline visits.
    
    * Move package to dev deps.

[33mcommit f33e6bcb1ecc10df02433fc5c2c045654759ccae[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon Jun 28 14:24:07 2021 +0300

    Add ability to specify other allergen (#300)

[33mcommit 964aeb84ba2bed45bdf0e6648cac9c2e824d8273[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Sun Jun 27 01:55:14 2021 +0300

    Update allergy form to the latest design (#298)
    
    * Update allergy form to match design
    
    * Add other reaction text box

[33mcommit 55dbf1b4200a2ffefcf63196dc2b03be9a231463[m
Author: Manuel Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Thu Jun 24 14:16:53 2021 +0200

    Offline Visits (#297)
    
    * Offline visit queueing without syncing mechanism.
    
    * Migrated visits to syncing mechanism. Prefer generateOfflineUuid from esm-core.
    
    * Upgrade to newest esm-core.
    
    * Cleanup.
    
    * Fixed line endings.
    
    * Removed openmrs from route template.
    
    * Use single-line classes.
    
    * Added temporary visit type (to be replaced with offline visit type) and fixed visit creation + its error handling.
    
    * Line endings.

[33mcommit 86a7133cd5feb1f428b819c04c4ee8f1eaa17317[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Jun 23 11:15:29 2021 +0200

    Included FE dependencies

[33mcommit b166b3bfd820b9458eae84e64e3fa6357a81055e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jun 21 22:56:36 2021 +0300

    Conditions widget mods (#296)
    
    - Carbonize detailed summary widgets.
    - Restore tests.

[33mcommit 50e8ffc8505b6f0c6d9438ed261130ab5f2f8767[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon Jun 21 15:15:27 2021 +0300

    MF-624: Improve Workspace visual formatting (tablet and desktop mode) (#294)
    
    * MF-624: Improve Workspace visual formatting (tablet and desktop mode)
    
    * Code review

[33mcommit 12cc453f3dbad1ec83c33ac86d438e0d0bca65a3[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Jun 18 18:46:58 2021 +0300

    MF-605 Rename results widget to vitals on the left nav (#295)

[33mcommit 0b96d8487bfe4953cfe6a59c4f36522b4265f6c7[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Jun 18 12:39:03 2021 +0300

    Fix vitals header record button toggling the header view (#293)

[33mcommit ec3f913dfd5e720a6c02f16579f44ea110c8f81d[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Jun 17 11:54:29 2021 +0300

    MF-620 : Add Active Medication Widget Extension to Patient Summary (#292)

[33mcommit dd79d473beb52a686333933460441a2b3bd362af[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jun 15 18:11:53 2021 +0300

    MF-448: Show success/error notifications for forms (#290)
    
    * MF-448: Show success/error notifications for forms
    
    We need a way to communicate to the user that submitting a form succeeded or failed.
    Now that we have a mechanism for displaying either toast notifications or inline notifications,
    we can leverage this to relay success or error information back to the user upon form submission.
    
    * Bump @openmrs/esm-framework to latest next version

[33mcommit 754724137159e131b2584eab83cc2bee5e4a6bb9[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Jun 15 16:05:08 2021 +0300

    MF-624: Improve Workspace visual formatting (#291)
    
    * MF-624: Improve Workspace visual formatting
    
    * MF-624: Code Review

[33mcommit 3c05d30773df58e70338df088ef185a45bcf9828[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Fri Jun 11 10:05:12 2021 +0200

    Fixed trailing comma in JSON

[33mcommit e04aeef202f2c2adbe06956ee27532dc46e265c2[m
Merge: 347af425 bdc01860
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Fri Jun 11 01:57:36 2021 +0200

    Merge branch 'master' of https://github.com/openmrs/openmrs-esm-patient-chart

[33mcommit 347af4252d2be5cbdf007cfbe8a99951c75152b8[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Fri Jun 11 01:55:35 2021 +0200

    Improved attachments

[33mcommit bdc01860c86fbd60918a6d573f07c509f0d5d697[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Thu Jun 10 09:27:54 2021 -0700

    Update common-medication.json

[33mcommit fc557e3eb7a5f54fc34f9a81c2fe84910b18e643[m
Author: Samuel Male <samuelsmalek@gmail.com>
Date:   Thu Jun 10 17:30:54 2021 +0300

    [MF-505] Carbonize Attachments Gallery (#255)
    
    * Carbonize Attachments Gallery
    
    * Apply lint
    
    * Fix lerna build
    
    * Removed unused fields
    
    * Update webpack config

[33mcommit 442d6164d7fe4229b87f4373b72ee8c92f6a97da[m
Author: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
Date:   Thu Jun 10 10:19:46 2021 +0200

    add testresults no-data case (#289)

[33mcommit 9970d8a5de8c2f6fc594f68806088df1680d867b[m
Author: Vineet Sharma <51502471+vasharma05@users.noreply.github.com>
Date:   Wed Jun 9 17:24:21 2021 +0530

    Base Structure for Past Visits Widget. (#276)
    
    * Base Structure for Past Visits Widget.
    
    * BMinor fixup
    
    * Added Observations for every Encounter in expanded form
    
    * Removed Console statements
    
    * Code Cleanup
    
    * Added SkeletonText in Loading Observations for an encounter
    
    * Added SkeletonText while loading Visits
    
    * Completed Encounter List and Basic structure of Visit Summary
    
    * Completed Medications in the Visit Summary
    
    * Split components into different files
    
    * Changed the order for fetching observations and completed Diagnoses as well.
    
    * Completed notes tab and added provider in the medications
    
    * Tried adding Interfaces for all the used Variables
    
    * Minor fixup
    
    * Single Column in Visits
    
    * Changes reviewed by Dennis
    
    * Intermidiate commit, might reverse it later
    
    * Final Design changes completed
    
    * CSS fixups
    
    * Minor fixups in expanded row
    
    * Changes required by Dennis
    
    * Minor final fixups and seprated visit detail component
    
    * Changes in translations
    
    * Final changes, visually reviewed by Ciaran.
    
    * Empty state for tests added.
    
    * Content switcher fixed
    
    * Minor Fixes
    
    * Changes in Order Interface, Observation Interface and corrected getDosage in visit.resource
    
    * extract visit test-results to extension slot
    
    * Changes required by Florian
    
    * finish moving test results extension prop types
    
    * Changes required completed.
    
    Co-authored-by: Nikita Malyschkin <nikita.malyschkin@googlemail.com>

[33mcommit 167e8ce15c69cd915249ed16129c6d724c6544d1[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Jun 9 11:30:20 2021 +0300

    Fix test, Reactivated vitals-biometrics form test (#288)

[33mcommit 5c0991a7476e688dd6b4455cf00ae35762895b2c[m
Author: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
Date:   Tue Jun 8 17:36:44 2021 +0200

    Testresults extension typing fex (#287)
    
    * add external fitlerable test results overview
    
    * improve testresults types
    
    * move test results types to common lib
    
    * fix review remarks
    
    * fix review remarks 2

[33mcommit acc1b39bda7c672bd57db5dd0991ab7d07062fc9[m
Author: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
Date:   Tue Jun 8 14:29:15 2021 +0200

    Test results extension (#286)
    
    * add external fitlerable test results overview
    
    * improve testresults types

[33mcommit 73c54344831aaf0aaa5de524e35a259942820819[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jun 7 18:28:41 2021 +0300

    Restore notes tests (#285)

[33mcommit 9174f7d5fe856601163b986a8e68264dc57b3d9f[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jun 7 16:17:08 2021 +0300

    Carbonized encounters detailed summary (#283)
    
    * Carbonized encounters detailed summary
    
    * Review feedback
    
    - Obtain the `patientUuid` from NotesContext.
    - Refactor `toggleShowAllNotes` to a memoized callback.

[33mcommit 977d381323e83258edbd613afd8b0379e34e2131[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jun 7 16:07:20 2021 +0300

    Set vertical overflow behaviour to auto. (#284)
    
    - Preferable to `overflow-y: scroll` as we don't want the scrollbars to be shown even when content is not
    being clipped.

[33mcommit 68bcfe388d3f9268b5bd72753c0056d31459f2cb[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jun 7 16:07:02 2021 +0300

    Conditions form enhancements (#282)
    
    * Conditions form enhancements
    
    This PR improves the conditions form as follows:
    
    - Set the padding of items in the search results panel to `0.875rem`.
    - Set the `max-height` of the search results panel to 14rem.
    - Set the background-color of a condition in the search results panel to $ui-03 on hover.
    
    These changes tie in the UI of this form together with that of the visit notes form for an overall consistent UX.
    
    * Review feedback - set overflow-y scroll behaviour to auto

[33mcommit 7f4a9043523ea366d184dae33ecd078ba2311260[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sun Jun 6 22:05:55 2021 +0300

    Visit notes form enhancements (#281)
    
    * Visit notes form enhancements
    
    - Verify that an active visit is ongoing before launching the form. If there's no active visit, prompt the user to start a visit.
    - Use a state machine to more reliably handle the various form states and transitions. This fixes an issue where the user could submit an empty form.
    - Show an error toast if there is a problem submitting the form.
    
    * Add translation for submission error
    
    * Respond to review feedback
    
    * Make diagnosis search results panel scrollable

[33mcommit 7ed4c46764fbfe44c2cfedaa7b461b794a16e866[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Sun Jun 6 22:05:38 2021 +0300

    Add ability to launch workspace in desktop and tablet modes (#278)
    
    * Add ability to launch workspace in desktop and tablet modes
    
    * code review
    
    Co-authored-by: Donald Kibet <chelashawddonald@yahoo.com>

[33mcommit deb149d5a75237e2fa25413af21ab9089072db62[m
Author: Manuel Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Mon May 31 21:27:28 2021 +0200

    Display dedicated forms page offline (#280)
    
    * Make forms workspace available offline.
    
    * Make forms dashboard render offline.

[33mcommit f56c388f788a0d2950ad08470558323ca8dbec23[m
Author: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
Date:   Mon May 31 16:29:57 2021 +0200

    fix lint warnings (#279)

[33mcommit e147394f1fcf58151ce165445ccc4e15830ec0fc[m
Author: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
Date:   Mon May 31 15:49:48 2021 +0200

    add new trendline stylings and date formats, add zebra styling (#277)
    
    * add new trendline stylings and date formats, add zebra styling
    
    * use useLayoutEffect for trendline svg reordering

[33mcommit 1bd9478782616d67d0915f8cfdfa4b50903e3dae[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu May 27 16:02:39 2021 +0300

    fix ui-action z-index (#275)
    
    Co-authored-by: Donald Kibet <chelashawddonald@yahoo.com>

[33mcommit a535a0484676293bf26cdaee934a5d02bf1cfc85[m
Author: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
Date:   Wed May 26 20:41:17 2021 +0200

    testresults range select (#270)
    
    * add range selector
    
    * use Tabs for trendline ranges, add stylings
    
    * add translations
    
    * refactor trendline range selector

[33mcommit acd8b098737818f486278127cc6413d2d5c2326e[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed May 26 15:16:48 2021 +0300

    MF-564 : Reactivated Patient Banner tests (#273)
    
    Co-authored-by: Donald Kibet <chelashawddonald@yahoo.com>

[33mcommit 6b56ac479e3e4e8fef3d37e604556227894316d9[m
Author: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
Date:   Wed May 26 14:09:33 2021 +0200

    add zebra styling to timeline and new border styles (#274)

[33mcommit 7bcb99277f479fddeeeccaede4ddf05453183e0e[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed May 26 11:52:24 2021 +0300

    MF-564 : Reactivated Program Overview test and Carbonised Detailed Program Overview (#271)
    
    Co-authored-by: Donald Kibet <chelashawddonald@yahoo.com>

[33mcommit 4ab2beea3e201c492a16c69d682ca7c267a6532c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed May 26 10:34:00 2021 +0300

    MF-564: Restore vitals widget tests (#272)
    
    - Fix outdated tests for the components that make up the vitals widget.
    - Also, fix an incorrect spec in the AllergiesOverview test suite.

[33mcommit b8aafa3241cab30f975a4efbd5078fb8a5833f5c[m
Author: Sean Kwon <seankwn@live.com>
Date:   Wed May 26 03:18:16 2021 -0400

    MF-518: Action Menu (with Extension slots) (#259)
    
    * MF-518: add extension stuff again
    
    * MF-518: address a comment
    
    * MF-518: more comments

[33mcommit 67cf902e7b6be451399264faba0fa3ad2f2c3292[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue May 25 17:25:15 2021 +0300

    MF-564: Restore tests for allergies widgets (#269)

[33mcommit 189c83a9b4fe172edc3ec6c2d480b954e4bc422c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue May 25 16:58:07 2021 +0300

    Fix failing SideMenu component tests (#268)

[33mcommit 2629523aaeb2fee0ff870f1b6bd7e3eb658bf8d4[m
Author: Manuel Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Tue May 25 12:20:06 2021 +0200

    Make forms workspace available offline. (#265)

[33mcommit 328ec86851e0b91f4a50e42cff906d1fb3c3e9b4[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue May 25 13:19:50 2021 +0300

    Carbonized allergies detailed summary (#267)

[33mcommit 7ecb692f05fc50712e62a3e938e13c8d46785093[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon May 24 14:53:08 2021 +0300

    Fix forms pagination arrow positioning (#266)
    
    Co-authored-by: Donald Kibet <chelashawddonald@yahoo.com>

[33mcommit 89a0a850ab503c7e4e9529f3ca4f3a4e6acd8ef6[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu May 20 14:11:38 2021 +0300

    use esm-framework usePagination hook (#264)
    
    Co-authored-by: Donald Kibet <chelashawddonald@yahoo.com>

[33mcommit 25f5a65607f517c3a2c7ab728d91e38c1df463f3[m
Author: Manuel Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Thu May 20 10:15:51 2021 +0200

    Cache visits of a patient. (#263)

[33mcommit 14d0dfc99a221ba0d383dbb0c146fd25f2d51db9[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed May 19 17:19:53 2021 +0300

    Render success toast upon successful form submission (#262)

[33mcommit cd7ad8b129340ef9972130c21cd16e3ce0d57745[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed May 19 17:19:33 2021 +0300

    More improvements to the programs form (#261)
    
    It takes a while to load a patient's eligible programs in the Programs field dropdown when you first launch
    the programs form. This PR adds a loading spinner which disappears once the programs have been loaded. It
    also renders a tile with an error message when the patient is already enrolled in all of the available
    programs.

[33mcommit dd01c49ec88afcc26da7114f94fd14fc8ef03a16[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed May 19 16:29:47 2021 +0300

    Improved type annotations (#260)
    
    Adds improved type annotations to the programs form source.

[33mcommit eba47f2829d590f43e667dc4471772c03cff664a[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue May 18 19:03:06 2021 +0300

    Exlude Sass files from formatting (#258)

[33mcommit c798c9a7985b22a1be88ca09be71c29ba01c7606[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon May 17 16:29:46 2021 +0300

    mf-564 : fix-biometrics test (#257)
    
    Co-authored-by: Donald Kibet <chelashawddonald@yahoo.com>

[33mcommit 692d0d330a3c7e236eb624c9bd5f8b546775b5fb[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Sun May 9 23:21:08 2021 +0200

    Prevent double scrolling and update tooling

[33mcommit 17c640325c14a3be962144507dc3d8c52f18ee8a[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Sun May 9 18:49:26 2021 +0200

    Updated tooling

[33mcommit 7bfebcdf77a1999a813767b22d10d740fda6a65e[m
Author: Vineet Sharma <51502471+vasharma05@users.noreply.github.com>
Date:   Wed May 12 12:41:33 2021 +0530

    Updated to webpack 5 (#254)
    
    * Updated to webpack 5
    
    * Minor prettier errors fixed
    
    * Added file-loader in the dependencies
    
    * Updated the webpack version and the serve command in the packages.
    
    * Removed the deprecated system prop from the rules' parser prop.
    
    * Cleared the parser rule in webpack

[33mcommit bc6c4492f2eadc7dd2d6ca2bccde3577a355e3c8[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue May 11 12:43:33 2021 +0300

    Add general Patient Note and mid Upper Circumference Concepts (#253)
    
    * Add MUAC and generalPatientNote Concepts
    
    * Prevent submitting of vitals form twice
    
    Co-authored-by: Donald Kibet <chelashawddonald@yahoo.com>

[33mcommit 06706e14eeac71f73ade7ecaf0b61c9c613bb3c8[m
Author: Vineet Sharma <51502471+vasharma05@users.noreply.github.com>
Date:   Mon May 10 19:05:10 2021 +0530

    Used useMemo to store the startDate to prevent allocation on every re-render (#250)

[33mcommit e08c2985dc02c182b30b45ceca79ee9a0065f600[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon May 10 10:54:52 2021 +0300

    Add ability to pass patient info as prop to form-entry (#252)
    
    * Add capability to launch form-entry forms
    
    * Add ability to open HTML Forms
    
    * Add Form-entry link and pass patient prop
    
    Co-authored-by: Donald Kibet <chelashawddonald@yahoo.com>

[33mcommit 436b7f1cec73e7b03e40cf0bd7e5aaff9752d021[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon May 10 10:24:05 2021 +0300

    Fix patient photo placeholder (#251)
    
    The svg patient avatar placeholder is not being rendered in the registration form as it should be. The corresponding placeholder svg
    in `esm-patient-attachments/assets/placeholder.svg` is showing up empty on my repo locally as well as on
    [GitHub](https://github.com/openmrs/openmrs-esm-patient-chart/edit/master/packages/esm-patient-attachments-app/src/assets/placeholder.svg).
    
    I've added the svg code back into the placeholder svg file and deleted the old png placeholder as it's no longer being used.

[33mcommit 00f8e97c0760a9183e74b3a22a41fc4198f807c6[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri May 7 17:10:08 2021 +0300

    Add top border to patient banner (#249)

[33mcommit 865c065ebb3fdeebf82244ff74e26b95fe442d5c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri May 7 14:25:34 2021 +0300

    Remove appui dependencies (#247)
    
    Previously, we made calls to an appui endpoint (`/ws/rest/v1/appui/session`) for fetching session data. Following @corneliouzbett's
    [work](https://github.com/openmrs/openmrs-module-webservices.rest/pull/418), we can now leverage the `useSessionUser` hook and
    reliably expect it to provide both the `currentProvider` and the `sessionLocation`.
    
    This PR removes all of the existing appui-based implementations and refactors the components that used them to the use the useSessionUser hook instead.

[33mcommit 26b71beca14140063f12e52e5bb44d177da6ed14[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri May 7 14:20:46 2021 +0300

    Add ability to launch form-entry forms (#248)
    
    * Add capability to launch form-entry forms
    
    * Add ability to open HTML Forms
    
    Co-authored-by: Donald Kibet <chelashawddonald@yahoo.com>

[33mcommit 13b665933b4c3a7adf65d83af1b2a6e9654a2f01[m[33m ([m[1;33mtag: v3.0.0[m[33m)[m
Author: Manuel Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Thu May 6 15:33:46 2021 +0200

    Offline Setup for a variety of patient chart widgets (#246)
    
    * Added .editorconfig and prettier config.
    
    * Ran prettier.
    
    * Offlineified patient-chart-app and patient-banner-app.
    
    * Render form widget when offline.
    
    * Format webpack configs.
    
    * Offlineified summary extensions of vitals.
    
    * Expose vitals overview in result dashboard when offline.
    
    * Offlineified biometrics.
    
    * formatting
    
    * Offlineified notes.
    
    * Added offline setup to clinical-view.
    
    * Offlineified test-results.
    
    * Added offline setup function to allergies widget.
    
    * Single dev dependency + offline webpack config for all MFs.
    
    * Stats plugin for common-lib.
    
    * Revert common lib changes. Fix medications webpack config.

[33mcommit 4c061ab057a9acba3b8adc9896debfd923aaed21[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu May 6 10:21:02 2021 +0300

    Enhancements to the Programs form (#245)
    
    This PR makes the following enhancements to the programs form:
    
    - Carbonize the UI in keeping with the designs.
    - Enable launching the form in the new workspace.
    - Disable the submit button while submitting.
    - Close the workspace and render a toast with a success message upon successfully saving a program enrollment.
    - Validate `Completion date` input so that it the allowed dates range between the `Enrollment date` and the current date.

[33mcommit 619952554c0c8aa9f3380bbf350ce2a1cd85f580[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed May 5 14:23:24 2021 +0300

    Migrate forms with latest designs (#243)
    
    * Migrate forms with latest designs
    
    * PR Feedback
    
    Co-authored-by: Donald Kibet <chelashawddonald@yahoo.com>

[33mcommit 14925c1ec10057ef762c6d0824b68eb2508d8fc3[m
Author: Manuel Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Wed May 5 12:29:44 2021 +0200

    Added .editorconfig/prettier.config and ran prettier. (#244)
    
    * Added .editorconfig and prettier config.
    
    * Ran prettier.

[33mcommit 95c950c604a5a8a8db73a24bf320fa49e4a4d52b[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed May 5 11:00:41 2021 +0300

    Enhancements to the Conditions form (#242)
    
    * Enhancements to the Conditions form
    
    - Carbonized form UI.
    - Improvements to the conditions search UI rendering.
    - Newly created conditions are now POSTed to the FHIR Conditions resource - this is the first widget with close to full CRUD operation support entirely using FHIR.
    - The form now launches in the new workspace.
    - Disable submit button while submitting.
    
    * Tweak payload to add the properties needed for a successful POST
    
    * Review feedback + state machines
    
    * Add ability to launch new form from conditions dashboard
    
    * Final fixes

[33mcommit 243e072ddc1d8bc9581bd8d998adf26f04b3a694[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon May 3 21:09:46 2021 +0300

    Automate extraction of translation strings (#241)
    
    * Install and configure i18next-parser
    
    * Tweak existing translation strings - keys should be camel-cased and strings sentence-cased
    
    * Add newly parsed translations
    
    * Install i18next-parser as devDependency + rerun extraction post-rebase
    
    * Add extract-translations command to pre-commit hook

[33mcommit d5aa3bf8ffc8508f1632e63e5a282e78c244a61d[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Sat May 1 06:20:30 2021 +0200

    Improved use workspace

[33mcommit 1eab6e453fc5684109a89f7ae78d2a2428777c36[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon May 3 11:04:58 2021 +0300

    Add esm-clinical-view-app to github actions (#237)
    
    * Add clinical-view-app to ci and included clinical-view dashboard link
    
    * Fix build error
    
    Co-authored-by: Donald Kibet <chelashawddonald@yahoo.com>

[33mcommit e6a0d19b4a2ec94873b2db836a2e787e91161e51[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon May 3 10:05:44 2021 +0300

    More overflow menu fixes (#239)
    
    - Adjust the font style of the `Actions` button to match the designs.
    - Tweak the top margin edge of the overflow menu so it sits flush below the `Actions` button.

[33mcommit 590367d5fc71b83faf44842046d427625c2948aa[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon May 3 10:05:34 2021 +0300

    Fix patient photo extension slot name (#240)
    
    Fixes an issue where the patient avatar was not being displayed on the patient banner.

[33mcommit 7f7b2ed6ec0f6ea007830d4be2e0444305b02388[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Sun May 2 23:10:13 2021 +0300

    Enhancements to the visit notes form (#238)
    
    - Use correct slot name in the attach function that launches the workspace.
    - Add transation keys and their corresponding strings.
    - Amend empty results pane to show the search query in addition to the error message.
    - Small changes to the rendering logic for the diagnosis search field.
    - Display a toast with a success message upon successfully saving a visit note.
    - Memoize debounced search function.
    - Improved type annotations.

[33mcommit 9ae58c9c8531defa3c7c22bf88acd3e291cca00b[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Apr 30 15:46:01 2021 +0300

    MF-524: Fix vitals signs display values when units are absent (#236)

[33mcommit 28dfbb1ccc8aa0ac2df7fcf90ef8dac82b47782c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Apr 30 10:48:34 2021 +0300

    MF-513: Patient banner UI enhancements (#233)
    
    A slew of enhancements to the patient banner UI including:
    
    - Adding an SVG as the patient avatar placeholder image (replaces the existing png).
    - Adding explicit sizing (`5 rem` height and width) to the placeholder SVG. This resolves an issue where the sizing of the image was being determined implicitly by the browser which led to it being rendered as a 72px x 72px image. This step ensures that the image takes up the expected amount of space in all the places where it is being used - the patient registration form, the patient search UI, and the patient banner.
    - Changing the alignment of various items in the patient banner. This is a consequence of the patient's avatar now being of the expected size. We can now tailor the size and alignment of surrounding items to better match what is outlined in the designs.
    - Changing the size of various icons from 20px to 16px per the designs.
    - Changing the text of the `Show/Hide Contact Details` button to `Show/Hide all details` per the designs. Changing the text case to sentence case was a suggestion by Ciaran (he intends to change the designs to reflect that Carbon convention).

[33mcommit 9fb65abcee6591f7ed880db1082705419f701cbe[m
Merge: dcdf73da 39679a1f
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Apr 29 06:48:29 2021 +0200

    Merge branch 'master' of https://github.com/openmrs/openmrs-esm-patient-chart

[33mcommit 39679a1fa247bbba715aa11d48af3228c6b5325c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Apr 29 23:06:20 2021 +0300

    Use an SVG placeholder as default patient photo (#235)

[33mcommit 85fe61fc0620e5c956017c1247c0e95a868d9965[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Apr 29 23:05:29 2021 +0300

    CustomOverflowMenu UI enhancements (#234)

[33mcommit b4eeee4f472f860369ca68d16b2ca097071affdc[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Apr 29 23:05:01 2021 +0300

    Remove errant colon from markup (#232)

[33mcommit 8e85f6a39affc2253b8decdae1fca1d900a93eac[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Apr 29 22:12:47 2021 +0300

    MF-388: Update the clinical views page with latest designs (#226)
    
    * minor build script and description fixes (#229)
    
    * minor build script and description fixes
    
    * clean up common lib package.json
    
    * delete common lib public path setup
    
    * MF-388: Update the clinical views page with latest designs
    
    * Add ability to add clinical view
    
    * Add ability to remove clinical view
    
    Co-authored-by: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
    Co-authored-by: Donald Kibet <chelashawddonald@yahoo.com>

[33mcommit 3aa9378c10a570e876b682c85156f38575174821[m
Author: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
Date:   Thu Apr 29 16:55:04 2021 +0200

    test-results (#231)
    
    * multiple CSS fixes in trendline and timeline
    
    * remove debug logs

[33mcommit dcdf73da2bc4fedbcab67a72b0374a192152746c[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Apr 29 06:17:44 2021 +0200

    Moved shared components to common lib

[33mcommit 166d197cb8a03363dc9d3bc4bc7c65a9a0fe9418[m
Merge: 8de20694 57911ea5
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Apr 28 17:03:32 2021 +0200

    Merged

[33mcommit 8de20694078664d581cfa30a2a0a55d5785dfef5[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Apr 28 16:54:38 2021 +0200

    Further enhancements wrt dashboard config

[33mcommit 57911ea5b71ad3620beacb921fbd772038bc1dd4[m
Author: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
Date:   Wed Apr 28 13:49:52 2021 +0200

    MF-563 + MF+474: reuse datatable from common view in trendview and add custom tooltip (#230)
    
    * MF-563: reuse datatable from common view in trendview
    
    * add custom tooltips to trendline chart (MF-474)

[33mcommit d5e5512bb6e6453539af3650ce6ac09a92abd028[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Apr 28 09:30:04 2021 +0200

    Updatd dependencies

[33mcommit 9737b18e96318ebffa7a360e9a5ffcb3222e0aed[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Apr 28 03:10:43 2021 +0200

    Introduce dashboard directly

[33mcommit 0b013865a721d14c7d57feec0af82a613379b6ca[m
Merge: d5e5512b 2d6d32d1
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Apr 28 02:53:28 2021 +0200

    Merge branch 'feature/monorepo' of https://github.com/openmrs/openmrs-esm-patient-chart

[33mcommit 2d6d32d1730b3ee3bfbd3d8486c0b9f9b91a423c[m
Author: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
Date:   Wed Apr 28 00:42:57 2021 +0200

    minor build script and description fixes (#229)
    
    * minor build script and description fixes
    
    * clean up common lib package.json
    
    * delete common lib public path setup

[33mcommit ddb858ef1b605930a5cab20316410aa596aac438[m
Author: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
Date:   Tue Apr 27 17:38:44 2021 +0200

    Common lib (#228)
    
    * add esm-patient-common-lib package
    
    * refactor test-results and attachments dashboards
    
    * refactor appointments and programs dashboards
    
    * refactor all dashboard instances from packages

[33mcommit 6815f4aafdfb3eb7c030f79fa882d8bc6bfe4583[m
Author: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
Date:   Tue Apr 27 15:08:53 2021 +0200

    fix test result imports (#227)

[33mcommit c0927418b6a54d74585aefde2d20b822b806a076[m
Author: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
Date:   Tue Apr 27 14:59:43 2021 +0200

    test results in monorepo (#224)
    
    * initialize test results package
    
    * move test results to monorepo
    
    * rebase on new linter, fix react warnings
    
    * remove debug changes
    
    * fix routing
    
    * replace withDashboardRouting with direct routing

[33mcommit 9449d549640e710288c6ff4739705830600567e8[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Sat Apr 24 01:19:17 2021 +0200

    Repaired workspace

[33mcommit b25f4108977bd76eea35ef44257f2e3bfd2312a9[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Fri Apr 23 15:12:22 2021 +0200

    Marked failing tests as outdated

[33mcommit 38d741dfd1650c795c82969473679d72b3524ea0[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Fri Apr 23 15:00:36 2021 +0200

    Centralized mocks

[33mcommit d0cc1528de6ea59f0ea1969bcd73a24278607013[m
Author: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
Date:   Thu Apr 22 11:26:03 2021 +0200

    use useExtensionSlotMeta to extend patient chart dashboard with exten… (#225)
    
    * use useExtensionSlotMeta to extend patient chart dashboard with extensions
    
    * make patient chart nav work with extensions
    
    * patient chart nav items dynamically attacked

[33mcommit 8115c9a43fc8b7e86384c4f1bcc18e9a4be48a2d[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Apr 22 00:38:11 2021 +0200

    Enhancements to the workspace handling

[33mcommit 99dd4e5382db973e8307d57a99879cafee5d3922[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Apr 21 17:15:19 2021 +0200

    Start to transform tests

[33mcommit df2a561cb0df507db9da01229f0e16c250481e20[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Apr 21 16:57:36 2021 +0200

    Unified package.json

[33mcommit 90f29f8757250565b7b98f20022eb173fe5798ea[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Apr 21 14:46:27 2021 +0200

    Corrected paths

[33mcommit 1d0d18b4c848a6c57e23dbea78031726e229d6d0[m
Merge: 5d1768f2 8bfb2224
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Apr 21 07:52:07 2021 +0200

    Merged with latest changes

[33mcommit 8bfb22243798d0ca754f2ccedad7d2c63a00802e[m
Author: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
Date:   Wed Apr 21 10:43:13 2021 +0200

    copy over test results from widgets (no changes) (#223)
    
    * copy over test results

[33mcommit e99e8eb9cfca46c389d7e974bea43cf2f63fb2a3[m
Author: Nikita Malyschkin <44928856+nmalyschkin@users.noreply.github.com>
Date:   Wed Apr 21 09:41:32 2021 +0200

    update linter (#222)
    
    * initialize test results package
    
    * update prettier to v2
    
    * fix auto fixable
    
    * fix lint warnings

[33mcommit 5d1768f2415d5cfa351c58ceb08caa2b06a12068[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Apr 21 07:41:58 2021 +0200

    Updated visit and workspace handling

[33mcommit defe93bdaf7a6e451d6f3482e7aac7de45f1b376[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Apr 12 22:20:08 2021 +0200

    Visit implementation

[33mcommit 147393d8ce6abeca759e2538ed12e1ed3842b8e2[m
Merge: 253c4aea d0e2c1ae
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Apr 12 16:48:27 2021 +0200

    Merge branch 'feature/monorepo' of https://github.com/openmrs/openmrs-esm-patient-chart into feature/monorepo

[33mcommit d0e2c1ae7f09cb4c5928e41a9b9752bc60b84888[m
Author: Vineet Sharma <51502471+vasharma05@users.noreply.github.com>
Date:   Fri Apr 16 21:53:00 2021 +0530

    New structure for the actions button on patient-banner, in extension to issue MF-500 (#220)

[33mcommit 253c4aeadb3c27eb471091eb465ce07f2431519a[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Apr 12 16:48:02 2021 +0200

    Refinement of workspace handling

[33mcommit c2dc6063ec05321d4b60c883e51dc0ebc4fb9c97[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Apr 12 07:07:28 2021 +0200

    Refinement and bug fixes

[33mcommit bcfacbeb04992b07f3a6614902dcf45a1ac5f993[m
Author: Herman Muhereza <hermanmuhereza22@gmail.com>
Date:   Tue Apr 13 18:05:44 2021 +0300

    disabling future dates on the onSetDate field on the conditions form (#219)
    
    Co-authored-by: mherman22 <47120265+mhermank@users.noreply.github.com>

[33mcommit 2b6b199f9c741501fdb779118d7e1993480f1b48[m
Author: Sean Kwon <sean.h.kwon@aexp.com>
Date:   Tue Apr 13 11:05:18 2021 -0400

    MF-517: desktop with sidebar (#217)
    
    * MF-517: desktop with sidebar
    
    * MF-517: fix a few errors
    
    * MF-517: use local styles instead
    
    * MF-517: updated
    
    * MF-517: use proper import

[33mcommit ceac7ba6595789e78c364937949cd88c7b4b32c1[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Sun Mar 28 06:48:35 2021 +0200

    Prettified

[33mcommit 27ede558e3aa1e687117d93d1f2dd24066ea1761[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Sun Mar 28 06:46:05 2021 +0200

    Added temp. impl. for openWorkspaceTab

[33mcommit 8fa73e18e51a2470e693a09a43f91318d7e6259c[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Sun Mar 28 00:15:59 2021 +0100

    Finished summary card in patient chart

[33mcommit 8ed101c82a97f199379f13533ba2befd17f4e230[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Sat Apr 3 13:57:54 2021 +0200

    Integrate in build process

[33mcommit cbb9f6cb216cc88c939822eb02002d779d1fbd60[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Sat Mar 27 01:03:59 2021 +0100

    BRinging over visit functionality

[33mcommit 57aa59976f37820c823f1325440e0b005cad9856[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Fri Apr 2 21:50:10 2021 +0200

    Removed unnecessary use of useCurrentPatient

[33mcommit 0cb2c7e26713a434f6e9f28b5b984c4a912cc149[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Apr 1 18:05:27 2021 +0200

    Added refinement

[33mcommit 6b31c9e370f7e08eb223729524be08eba68546d3[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Apr 1 16:58:27 2021 +0200

    Refactored first batch

[33mcommit 12d233e82efc1d1e4870cc94686071fb13d5197c[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Apr 1 14:09:29 2021 +0200

    Refinements

[33mcommit 897251b822edfc36a526068f3f399b2ff22706e8[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Apr 1 12:13:40 2021 +0200

    Added remaining widgets

[33mcommit 85bad1b80fb98670d4fdc62c8d66e5ad7af70477[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Apr 1 11:32:17 2021 +0200

    Added immunizations and medications

[33mcommit 415ffa9defc67e19165bf2168a13923dc70408ff[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Apr 1 10:09:20 2021 +0200

    Updated identifiers sep

[33mcommit 9760875a6364c100adf75f1e5527cde96ce23560[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Apr 1 01:54:18 2021 +0200

    Fixed smaller issues

[33mcommit f4219ebeda4c6d36005ac686e18bc26d09461de7[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Apr 1 01:32:29 2021 +0200

    Added conditions

[33mcommit 1b58dc60b29a25782a622c9b571279314d29dd5a[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Apr 1 00:20:39 2021 +0200

    Added notes and forms

[33mcommit 24823ae81e583da71346f3b3c059a72d2464ba81[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Mar 31 17:30:14 2021 +0200

    Refined for re-render optimization

[33mcommit 7af4aeb8089f39b339839afc73a1cc626b189d72[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Fri Mar 26 00:42:58 2021 +0100

    Usage of slots and menu

[33mcommit 7c2c65df3fd3161674a9fe8c9c8e25ffb658dd80[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Mar 25 14:39:50 2021 +0100

    Updated tabbed view

[33mcommit 15a3bb0cab6bc5bed73762d74ff17270459d8f77[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Mar 18 01:42:07 2021 +0100

    Fixed issue with workspace title

[33mcommit f7f5e5a47a0d9bc58e1e3d0d23ced3c23afadf4e[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Mar 11 14:44:47 2021 +0100

    Removed trailing space

[33mcommit b6ede920f929f6b308dc74a7b7c0f3f05a6ebfa6[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Mar 11 14:23:38 2021 +0100

    Added biometrics

[33mcommit 6dc2df3da9e673297e1f1768c99079bbe7585348[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Mar 11 11:11:29 2021 +0100

    Cleanup

[33mcommit ef045f9f3ded04cbd0b6cc62551f65337013bf77[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Mar 10 17:40:51 2021 +0100

    Switched to ext slots

[33mcommit dbb379385c62a1f64773148eabc9108785e381c1[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Mar 8 12:28:32 2021 +0100

    Removed hooks

[33mcommit 28f77b893c3473050e726a391f457b435edcf470[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Mar 4 17:38:09 2021 +0100

    Migrated to monorepo

[33mcommit 92214b30eb5736351c7f429bb0175f52f091e5b9[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Feb 26 16:30:18 2021 +0300

    Update biometrics path (#211)

[33mcommit d1da79e61b77c989566735cd1dd1f93cba215335[m
Merge: 662e6a03 2184c75a
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Feb 25 23:52:21 2021 +0100

    Merged

[33mcommit 662e6a036ec51fa0067f2ede6a229d2b8394458c[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Feb 25 23:46:00 2021 +0100

    Adjusted to latest shell

[33mcommit 2184c75aa9588d2496c69d3776dd8b0b76563c85[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Feb 25 21:03:44 2021 +0300

    Rename HeightAndWeight Overview to biometrics (#210)

[33mcommit a0be4e285e3e6c0a105b9b6b389fc29f986da990[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Feb 25 13:36:28 2021 +0100

    Added extension slot name

[33mcommit 85440ec0b35b811f29908ce9d868abc8eeb5d3ce[m
Author: Florian Rappl <rappl.florian@gmail.com>
Date:   Tue Feb 23 17:07:51 2021 +0100

    Alignment and Refactoring (#208)
    
    * Optimizations and adjustments
    
    * Optimizations and adjustments
    
    * Switched to use framework
    
    * Further enhancements
    
    * Improved tests
    
    * Updated dependencies
    
    * Improved build
    
    * Use navigation context

[33mcommit 4fca4f45bda94e3ae2adcd98588fbcde000d92b4[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Feb 19 17:28:54 2021 +0300

    Add forms extension to summary dashboard (#209)

[33mcommit 0ca2b0971da04bf9d4a9fe2dc765cc324a9c2626[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Feb 15 10:29:52 2021 +0100

    Publish next version on push

[33mcommit 05f899a7499ca4dd375f060f4ead3fbd1443acc5[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Feb 8 16:09:07 2021 +0100

    Updated app shell

[33mcommit cd1232aae72596bcecfb789373de6b7dce2902bb[m
Merge: 7264336f 4ad398c0
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Feb 4 21:02:02 2021 +0100

    Merge branch 'master' of https://github.com/openmrs/openmrs-esm-patient-chart

[33mcommit 7264336feeaab77d4e346242be11bb2c2260c44e[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Feb 4 21:01:37 2021 +0100

    Include breadcrumbs

[33mcommit 4ad398c0f68d8834f0d8eb1716eed3ece2cab4e4[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Feb 4 21:53:39 2021 +0300

    Add overview widget translation strings (#206)

[33mcommit 2804cc96ecfbaaf923c27c401cf832f8b549550e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Feb 3 19:22:55 2021 +0300

    Add vitals header translation strings (#205)

[33mcommit eaa2e3eade0dc34675fa751292b1e50b60fb863c[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Jan 28 16:56:53 2021 +0100

    Updated dependencies

[33mcommit e9811a8bdc2b90151308c404079af763917def49[m
Author: Samuel Male <samuelsmalek@gmail.com>
Date:   Thu Jan 28 09:20:10 2021 +0300

    [MF-401] Tab headers as menu items (#204)
    
    * Tab headers as menu items
    
    * Move link definitions(extensions) to patient-chart-widgets
    
    * Fix spaBasePath and simplify nav.component
    
    Co-authored-by: Brandon Istenes <bistenes@gmail.com>

[33mcommit 364dd8059b6fdd899de07511074cb081e6785080[m[33m ([m[1;33mtag: v0.2.0[m[33m)[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Sat Jan 23 02:20:00 2021 +0300

    MF-384 : Vitals Widget Header: Implement different visual states (#192)
    
    * Attached patient-vitals-header to patient-banner
    
    * Add patient-vitals-status slot

[33mcommit 61227d715b6fa12548255410b734d2c75d2e862f[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jan 4 09:05:38 2021 +0300

    Add visit note form translation strings (#203)

[33mcommit f05584f6760b30cd86709a44e61009e5fc3fab69[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jan 4 09:05:08 2021 +0300

    Amend i18n string for attachment upload (#202)

[33mcommit 9d4922cbba624f589a3cf215d4bac234e872d779[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Dec 30 20:50:55 2020 +0300

    Fix TabbedView component tests act warnings (#201)

[33mcommit 48f2583e8f1fcb20c0611ce269e86bab710d0a8d[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Tue Dec 22 11:03:21 2020 +0100

    Bump node-notifier from 8.0.0 to 8.0.1 (#200)
    
    Bumps [node-notifier](https://github.com/mikaelbr/node-notifier) from 8.0.0 to 8.0.1.
    - [Release notes](https://github.com/mikaelbr/node-notifier/releases)
    - [Changelog](https://github.com/mikaelbr/node-notifier/blob/v8.0.1/CHANGELOG.md)
    - [Commits](https://github.com/mikaelbr/node-notifier/compare/v8.0.0...v8.0.1)
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit 263f867af7689ab881b6e1dc040e3d79ed6cbf8a[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Dec 14 13:22:38 2020 +0100

    Improved test mock

[33mcommit 1bc3d63c534cc9dd5e0262fc508135a64a8df5cd[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Dec 14 01:27:16 2020 +0100

    Improved use route match with specific base route

[33mcommit 8c77ff9c7172aaf415313a687b904a52d8f0ca83[m
Merge: c94a31b3 3a2f4a96
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Dec 14 01:15:10 2020 +0100

    Merge branch 'master' of https://github.com/openmrs/openmrs-esm-patient-chart into feature/extension-props

[33mcommit c94a31b3199ccddc5daeb14758fd8dfee02a79d1[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Dec 14 01:15:04 2020 +0100

    Reworked calling extension slots

[33mcommit 3a2f4a960bb88532a7dc0904666231f853f69dde[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Sat Dec 12 01:25:59 2020 +0100

    Bump ini from 1.3.5 to 1.3.8 (#199)
    
    Bumps [ini](https://github.com/isaacs/ini) from 1.3.5 to 1.3.8.
    - [Release notes](https://github.com/isaacs/ini/releases)
    - [Commits](https://github.com/isaacs/ini/compare/v1.3.5...v1.3.8)
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit 89e71e17cbf61256e2b907adb3295a920fc3744c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Thu Dec 10 12:46:59 2020 +0300

    Adjust top margin on patient summary page (#198)

[33mcommit cf4ebb2541df0969fa63121cbc1441f1415c5917[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Dec 9 22:16:36 2020 +0300

    Add translation string for empty state (#197)

[33mcommit be5cb4f304b55b4e5c2127352975e22a84c10b28[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Dec 9 18:05:28 2020 +0100

    Updated README

[33mcommit d4b84051cdf61e6997c10ff8670dbc0d023f0986[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Dec 9 16:55:41 2020 +0100

    Migrated to GitHub actions

[33mcommit 8cf4cb3db8a31aa292aaa95ab62c08a8bfda4ec3[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Dec 9 14:57:09 2020 +0100

    Added workflow

[33mcommit d3bea1c2fd817980a6f06dd7a820e245998c9b2c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Dec 8 15:09:18 2020 +0300

    MF-387: Add translation strings for error tile (#196)

[33mcommit d2a07ad646ec80b93e3bbcfd35b00152394a7079[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Dec 8 11:54:23 2020 +0300

    Pluralize biometrics widget name (#195)

[33mcommit fdcf51a2227d6c7d5584538b643dd3eb60df7126[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Dec 3 18:47:05 2020 -0800

    Add -app suffix to JS bundle (#193)

[33mcommit bf1ebeb2f093ba9d3054fc12c724c9d48eda8197[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Thu Dec 3 18:46:15 2020 -0800

    Add slot to the top of every dashboard (#194)

[33mcommit 00cc5441096693f27ef8e3b5b0134102344c8388[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Dec 2 15:33:35 2020 +0100

    Updated nav component

[33mcommit 58e9337fb6a4e893357f50111d125f81c16c4195[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Wed Dec 2 13:59:41 2020 +0100

    Added new component

[33mcommit 3075f99e66031a66b0bda26ff224bd1050bb22df[m
Merge: 4577e769 1b109563
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Nov 30 12:02:30 2020 +0100

    Merge branch 'master' of https://github.com/openmrs/openmrs-esm-patient-chart

[33mcommit 4577e76955b4e444cfce4203ef7746a1300480f1[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Nov 30 11:56:43 2020 +0100

    Updated with config in root module

[33mcommit 1b109563bba4efb5b37407eb212533f65747e4ed[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Nov 27 15:44:30 2020 +0300

    Temporary styling fixes for the patient banner (#191)

[33mcommit 323f3b45880db7f56dc37eb5b0a92c4d29cd1417[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Fri Nov 27 00:31:41 2020 +0100

    Removed explicit parcel

[33mcommit dcac09f978ce0879b62c2c4a48be6a1eb161b1ba[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Thu Nov 26 17:11:41 2020 +0100

    Updated to latest app shell

[33mcommit a9191d18d561d9599afb7fbc2c9f6dc4ca3b6358[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Nov 25 16:48:04 2020 +0300

    MF-382 Update Vitals Widget to match latest designs (#189)

[33mcommit 24df7ce9336ab3ae34c507496a1a25e5143bc1af[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Wed Nov 18 12:29:09 2020 -0800

    Update to use esm-context's openmrsRootDecorator; add single-spa to peer deps (#188)

[33mcommit 1addc0e550e582f60341d3b3c29002881cf19653[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Sat Nov 14 17:44:32 2020 -0800

    Update to latest config spec (#187)
    
    * Update to latest config spec
    
    * Upgrade to esm-core 3.1.1

[33mcommit 3778be7c6c37fc9686603be51bce05a51c4dabc3[m
Author: Manuel Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Wed Nov 11 11:38:26 2020 +0100

    Added missing dependency to useEffect (#186)

[33mcommit 7fae1cb3c48386537612cb800e56290b4ccdf52c[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Nov 10 19:27:14 2020 +0300

    Reorganize core views (#185)

[33mcommit 5d238976b48c0b95440564e37cbb0fae094e18d2[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Nov 9 17:27:40 2020 +0100

    Updated commands

[33mcommit 571e3cb03e421eb0bd8ba90289a4b333e272aa7a[m
Author: Manuel Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Mon Nov 9 17:19:03 2020 +0100

    Adaptations to the context workspace (Enable closing from within / Enable scrolling) (#184)
    
    * Experimental first version of a workspace using the context API.
    
    * Remove the temporary button.
    
    * Title support.
    
    * Remove unused imports
    
    * Updated version.
    
    * Use useCallback.
    
    * Pass the current patientUuid to extensions.
    
    * Enable closing context workspace from inside.
    
    * Updated deps
    
    * Rebuild package-lock.json

[33mcommit 7e5eb2e7c75832c3b7aed1a5f5569b5f35b750bf[m
Author: Manuel Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Mon Nov 9 13:15:47 2020 +0100

    Context workspace integration (#182)
    
    * Experimental first version of a workspace using the context API.
    
    * Remove the temporary button.
    
    * Title support.
    
    * Remove unused imports
    
    * Updated version.
    
    * Use useCallback.
    
    * Pass the current patientUuid to extensions.

[33mcommit 318a9303b40444766ebc288d1c97b14fcae25bf5[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Nov 9 12:51:27 2020 +0300

    Update translations to use sentence-case (#183)

[33mcommit a924cccffb45f115438caf0957aeb5ab5fb04e5f[m
Author: Manuel Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Wed Oct 28 12:58:25 2020 +0100

    Removed tabs from the medications widget to match the current designs. (#181)

[33mcommit 1813f3ae56022da1f2c79e7ff03be70ef6432f12[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Fri Oct 16 13:31:35 2020 +0200

    Added hidden peer dependencies

[33mcommit bb46d54d0a9cf597287f9ba4f6914300880307b5[m
Merge: 1752ff6b 7d9579bb
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Fri Oct 16 13:28:39 2020 +0200

    Merge branch 'master' of github.com:openmrs/openmrs-esm-patient-chart

[33mcommit 7d9579bb21a39b5f25495ddb79e9c93c61fbd90f[m
Author: Florian Rappl <rappl.florian@gmail.com>
Date:   Tue Oct 13 10:30:30 2020 +0200

    New App Shell Tooling (#180)
    
    * Consolidated and aligned repo structure
    
    * Prettified
    
    * Updated TypeScript
    
    * Updated root decorator
    
    * Finished adoption

[33mcommit 1752ff6b138fafaf7e569f9e231832ee4d37eacc[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Tue Oct 13 00:08:32 2020 +0200

    Finished adoption

[33mcommit 863fb1fb443f1763407cfe7182e68be4280cd620[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Oct 12 23:05:13 2020 +0200

    Updated root decorator

[33mcommit 71f8d0403cb815c4ce52001e425a2ae616e05a5a[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Oct 12 21:36:02 2020 +0200

    Updated TypeScript

[33mcommit 991a28bc9b4401a9636c46f6074f9e224bee589d[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Oct 12 18:17:59 2020 +0200

    Prettified

[33mcommit 4b1d084901d082a42ab53d508b4ba04e950534b1[m
Author: Florian Rappl <florian.rappl@smapiot.com>
Date:   Mon Oct 12 17:38:57 2020 +0200

    Consolidated and aligned repo structure

[33mcommit f78f2b659ccedb8160534895522c30814cb15033[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Oct 2 09:01:15 2020 +0300

    MF-219: Add visits widget translations (#178)

[33mcommit 3787550d6258258b40ff9a985d7a95b677cfc926[m
Author: Manuel Römer <30902964+manuelroemer@users.noreply.github.com>
Date:   Thu Sep 24 10:25:17 2020 +0200

    Enable widgets as extensions and host the medications/drugorder widget via this mechanism (#179)
    
    * Enable widgets as extensions.
    
    * Updated README.

[33mcommit 5f2af6c54eb5c773d166609f9edf319f20a3448f[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Sep 22 14:47:52 2020 +0300

    MF-219: Add notes widget translations (#177)

[33mcommit eadbba66dc71d15390f51cafbbf461d68d241efe[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Sep 22 08:48:32 2020 +0300

    Bump dependencies (#176)

[33mcommit 80af811e5e4bfd028f6e4ea9a94d7afaaea6393e[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Sep 8 12:17:29 2020 +0300

    MF-219: Add chart summary translations (#172)
    
    * MF-219: Add chart summary translations
    
    * MF-219: Clean up translation strings
    
    * Review feedback: lose the upper/lower suffixes + better key names

[33mcommit 695faa8193aba88e0482b64a070207033fdb8cc4[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Sep 8 12:16:53 2020 +0300

    Fixed broken links on patient-summary page (#175)

[33mcommit b6f207ee5499e5bd4836a3a6f54d356c3d4be3e7[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Sat Aug 1 15:46:14 2020 +0300

    Bump elliptic from 6.5.2 to 6.5.3 (#174)
    
    Bumps [elliptic](https://github.com/indutny/elliptic) from 6.5.2 to 6.5.3.
    - [Release notes](https://github.com/indutny/elliptic/releases)
    - [Commits](https://github.com/indutny/elliptic/compare/v6.5.2...v6.5.3)
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit 736ac52089d0f563c3f894145f41beb91877bdd4[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Sat Jul 18 17:12:14 2020 +0200

    Bump lodash from 4.17.15 to 4.17.19 (#173)
    
    Bumps [lodash](https://github.com/lodash/lodash) from 4.17.15 to 4.17.19.
    - [Release notes](https://github.com/lodash/lodash/releases)
    - [Commits](https://github.com/lodash/lodash/compare/4.17.15...4.17.19)
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit 0d4d1ac2ed07f10661328f21024a14727e6b2fe0[m
Author: Ivange Larry <ivangelarry@gmail.com>
Date:   Mon Jul 13 20:15:32 2020 +0100

    Add attachments overview component to patient dashboard tab (#171)
    
    * Add attachments overview component to patient dashboard tab
    
    * Fix attachment configuration

[33mcommit 28b89a67507f9b2329f9e112ca95e31c6e1c0bbf[m
Author: Mritunjay Dubey <mddubey409@gmail.com>
Date:   Fri Jul 10 15:40:06 2020 +0530

    MF-247: Configuration and translations for the immunization widget.

[33mcommit 6497836694403e0118cabd7464fdbb88cd9de7f5[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Fri Jun 26 13:56:37 2020 -0700

    MF-222  Create configurations for vitals, height and weight widgets (#169)
    
    * Added ability to specify patient widgets configs
    
    * Upgrade module-config
    
    * Review feedback
    
    Co-authored-by: Nicky Kimaina <nkimaina@ampath.or.ke>

[33mcommit 81c2b27d82fc22d9148c006b66df9e69127d77b1[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Sun Jun 14 18:05:56 2020 +0300

    MF-148: Fixed tabbed view not selecting right tab (#166)
    
    * Fixed tabbed view not selecting right tab
    
    * Code review and added test for tabbed-view component

[33mcommit af293aebe4833af9bb76cec0ff2fec619a1e8b59[m
Author: Mritunjay Dubey <mddubey409@gmail.com>
Date:   Sun Jun 14 04:09:10 2020 +0530

    Fix the package name and version (#167)
    
    * Fix the package name and version
    
    * Change version to first minor release 0.1.0

[33mcommit af59b27e88be1a86494a72746c8b0e2c043a8272[m
Author: Florian Rappl <rappl.florian@gmail.com>
Date:   Mon Jun 8 10:58:49 2020 +0200

    Fixed Activation Function (#165)
    
    * Prepared for distributed activation
    
    * Refined approach for activation function
    
    * Updated travis definition
    
    * Update src/index.ts
    
    Co-authored-by: Brandon Istenes <bistenes@gmail.com>
    
    * Removed reference to esm-root-config
    
    * Updated module name
    
    * Updated config schema
    
    * Corrected activation function
    
    Co-authored-by: Brandon Istenes <bistenes@gmail.com>

[33mcommit 442f115f11b0993d90a058a8eddb24a518717486[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Mon Jun 8 10:39:22 2020 +0200

    Bump websocket-extensions from 0.1.3 to 0.1.4 (#163)
    
    Bumps [websocket-extensions](https://github.com/faye/websocket-extensions-node) from 0.1.3 to 0.1.4.
    - [Release notes](https://github.com/faye/websocket-extensions-node/releases)
    - [Changelog](https://github.com/faye/websocket-extensions-node/blob/master/CHANGELOG.md)
    - [Commits](https://github.com/faye/websocket-extensions-node/compare/0.1.3...0.1.4)
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit efde725a9c629d33326ee43d99ada7dbdedd4b9d[m
Author: Florian Rappl <rappl.florian@gmail.com>
Date:   Mon Jun 8 10:38:34 2020 +0200

    Updated Module Name (#164)
    
    * Prepared for distributed activation
    
    * Refined approach for activation function
    
    * Updated travis definition
    
    * Update src/index.ts
    
    Co-authored-by: Brandon Istenes <bistenes@gmail.com>
    
    * Removed reference to esm-root-config
    
    * Updated module name
    
    * Updated config schema
    
    Co-authored-by: Brandon Istenes <bistenes@gmail.com>

[33mcommit 2b746554540b4c2114138b67ba41877fd6a41a59[m
Author: Florian Rappl <rappl.florian@gmail.com>
Date:   Fri Jun 5 21:33:16 2020 +0200

    Decentralized Activation (#162)
    
    * Prepared for distributed activation
    
    * Refined approach for activation function
    
    * Updated travis definition
    
    * Update src/index.ts
    
    Co-authored-by: Brandon Istenes <bistenes@gmail.com>
    
    * Removed reference to esm-root-config
    
    Co-authored-by: Brandon Istenes <bistenes@gmail.com>

[33mcommit 1ce2bcd7b9cd93b71b97534c9fa759c330f42092[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri May 29 16:55:55 2020 +0300

    MF-212: Fixed Patient demographics banner overlaps patient chart pages (#161)

[33mcommit 82c1e07de835d7b1e1bff31d1e0ba3e13542d0ae[m
Author: Ramakrishnan Kandasamy <38713281+rmkanda@users.noreply.github.com>
Date:   Sun May 17 07:57:40 2020 +0530

    MF-220 upgrade vulnerable dependencies (#159)

[33mcommit 5fc353ca6bda3ed9c41268572334adb4ee8e8939[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Sat May 16 00:51:49 2020 +0300

    MF-156 Start of Visit Widget (#154)
    
    * MF-156 visit widget
    
    * visit dialog
    
    * upgrade @openmrs/openmrs-esm-patient-chart-widgets from 1.0.1 to 1.0.2

[33mcommit cc68a04bd0b0e7e523b3f14efde33a3053b668b8[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed May 13 23:15:12 2020 +0300

    MF-199 : Fixed See All Page Under Conditions is Blank (#158)

[33mcommit 371b89713d08576de77695f55058a1c0eb795618[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue May 12 18:07:47 2020 +0300

    Fixed links not working for vitals and height and weight (#157)

[33mcommit 86e8df98988f216e0c5589af93639f513c937aee[m
Author: Brandon Istenes <bistenes@gmail.com>
Date:   Fri May 8 00:03:24 2020 -0700

    Update README.md (#156)
    
    * Update README.md
    
    * Update README.md
    
    * Update README.md

[33mcommit 8fec9984a1aed1fc2439aacf80498586fc4be627[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed May 6 20:45:31 2020 +0300

    Fixing unresponsive patient chart on smaller screens (#155)

[33mcommit a46c5682ea9476e4f6709f43504e160ff6bd79f5[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed May 6 20:45:10 2020 +0300

    MF-159: Patient profile is displaying in background rather than foreground (#152)

[33mcommit 169d78f702d17959baaef9580a8565aeb7911141[m
Author: Nicky Kibor Kimaina <nkimaina@ampath.or.ke>
Date:   Mon Apr 27 10:00:44 2020 +0300

    Mf 172 (#153)
    
    * MF-172: Scrolling of nav bar header items
    
    * fixed styling for scrolling buttoms
    
    * Fixing broken build
    
    * fixing build
    
    * fixing build
    
    * fixed failing tests
    
    * responding to PR reviews

[33mcommit 4c6e8707fe0df6e14923072cbd9d7bc5a354a5e8[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Apr 2 19:50:59 2020 +0300

    Fixed allergy summary basePath (#151)

[33mcommit b03025439d51b8afeef9d69a254a1762ad379b95[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Thu Mar 26 21:39:08 2020 +0300

    Fix routes (#150)
    
    * changing name from config to schema
    
    * fixing routes

[33mcommit 00d83f6af5a34436c5f37d142fed0bf18e5c9a52[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Tue Mar 17 21:42:34 2020 +0300

    fixing config for medications overview (#147)

[33mcommit c8263b77c1dfc6ca0226e1d83be43d2dbda60675[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Tue Mar 17 21:14:55 2020 +0300

    Parcel config (#145)
    
    * initial commit: add skeleton for creating a parcel in widget
    
    * initial commit: add skeleton for creating a parcel in widget
    
    * initial commit: add skeleton for creating a parcel in widget
    
    * self-review
    
    * passing single spa context
    
    * self-review
    
    * self-review
    
    * self-review
    
    * making mountParcel available as a prop to widgets
    
    * self-review
    
    * responding to comments

[33mcommit a79a758da77cc49ec1b828a3d44a513cc61609ba[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Sat Mar 14 14:27:36 2020 -0600

    Bump acorn from 5.7.3 to 5.7.4 (#144)
    
    Bumps [acorn](https://github.com/acornjs/acorn) from 5.7.3 to 5.7.4.
    - [Release notes](https://github.com/acornjs/acorn/releases)
    - [Commits](https://github.com/acornjs/acorn/compare/5.7.3...5.7.4)
    
    Signed-off-by: dependabot[bot] <support@github.com>
    
    Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

[33mcommit 4f238df0f98f7c648c9c70761e58c853d84e1a74[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Mar 10 19:39:51 2020 +0300

    Making chart review and workspace swith views on tablet and Mobile devices (#142)

[33mcommit ea3f3ccd8a72bbde9721131843e7cfd720752ff7[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Tue Mar 10 19:39:13 2020 +0300

    fixing route for a view within a tabbedView to not be exact (#143)

[33mcommit f54edf7a7fbf72720474a1bbb2a493361ef25746[m
Author: Nicky Kibor Kimaina <nkimaina@ampath.or.ke>
Date:   Tue Mar 10 15:18:01 2020 +0300

    Added ability to close tab (#137)
    
    * Added ability to close tab
    
    * Added back removed app props

[33mcommit c50cc4a8fbf60f55030c124aee3952d4c2e8d142[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Mon Mar 9 19:19:55 2020 +0300

    Update core views (#141)
    
    * moving to config via esm-module-config
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * responding to review comments
    
    * responding to review comments
    
    * initial commit: removed overview component and replaced with reusable dashboard component. Also updated css on most widget overview components
    
    * self-review
    
    * changing layout of summaries
    
    * fixing routing
    
    * self-review
    
    * self-review
    
    * updated schema definition
    
    * self-review
    
    * self-review
    
    * self-review
    
    * added ui components for widget and dashboard. placeholder for multi-view dashboard. refactored chart-review to handl new widgets
    
    * responding to review comments
    
    * adding default route
    
    * resolving conflicts
    
    * responding to comments
    
    * responding to comments
    
    * initial commit: creating multi-dashboard view
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * initial commit: configuring to use esm-patient-chart-widgets. removing widgets from this repository
    
    * updating packages and fixing ts errors
    
    * adding widget test
    
    * adding widget test
    
    * improving tests
    
    * updating npm:test to npm-test
    
    * correcting ts config file
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * responding to PR comments

[33mcommit 858a39bb63a36f8e72f3ec54d04eb074b44d5bd5[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Fri Mar 6 19:52:45 2020 +0300

    Use widgets repo (#139)
    
    * moving to config via esm-module-config
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * responding to review comments
    
    * responding to review comments
    
    * initial commit: removed overview component and replaced with reusable dashboard component. Also updated css on most widget overview components
    
    * self-review
    
    * changing layout of summaries
    
    * fixing routing
    
    * self-review
    
    * self-review
    
    * updated schema definition
    
    * self-review
    
    * self-review
    
    * self-review
    
    * added ui components for widget and dashboard. placeholder for multi-view dashboard. refactored chart-review to handl new widgets
    
    * responding to review comments
    
    * adding default route
    
    * resolving conflicts
    
    * responding to comments
    
    * responding to comments
    
    * initial commit: creating multi-dashboard view
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * initial commit: configuring to use esm-patient-chart-widgets. removing widgets from this repository
    
    * updating packages and fixing ts errors
    
    * adding widget test
    
    * adding widget test
    
    * improving tests
    
    * updating npm:test to npm-test
    
    * correcting ts config file
    
    * responding to PR comments
    
    * self-review

[33mcommit 71dbb076915a0a4f99fb0a56090f8871cf37e14c[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Mar 5 12:06:02 2020 +0300

    Moved workspace resource to openmrs-esm-api (#138)
    
    * Moved workspace resource to openmrs-esm-api
    
    * renamed workspacetab to workspaceitem
    
    * Upgraded to esm-api 1.3.0

[33mcommit 57983b000992613318b716a720d69461a855de08[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Wed Mar 4 19:02:07 2020 +0300

    Tabbed view (#135)
    
    * moving to config via esm-module-config
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * responding to review comments
    
    * responding to review comments
    
    * initial commit: removed overview component and replaced with reusable dashboard component. Also updated css on most widget overview components
    
    * self-review
    
    * changing layout of summaries
    
    * fixing routing
    
    * self-review
    
    * self-review
    
    * updated schema definition
    
    * self-review
    
    * self-review
    
    * self-review
    
    * added ui components for widget and dashboard. placeholder for multi-view dashboard. refactored chart-review to handl new widgets
    
    * responding to review comments
    
    * adding default route
    
    * resolving conflicts
    
    * responding to comments
    
    * responding to comments
    
    * initial commit: creating multi-dashboard view
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review

[33mcommit b2eb426ece89e7ce14900134215720b88d138946[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Fri Feb 28 22:02:20 2020 +0300

    Dashboard import (#131)
    
    * moving to config via esm-module-config
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * responding to review comments
    
    * responding to review comments
    
    * initial commit: removed overview component and replaced with reusable dashboard component. Also updated css on most widget overview components
    
    * self-review
    
    * changing layout of summaries
    
    * fixing routing
    
    * self-review
    
    * self-review
    
    * updated schema definition
    
    * self-review
    
    * self-review
    
    * self-review
    
    * added ui components for widget and dashboard. placeholder for multi-view dashboard. refactored chart-review to handl new widgets
    
    * responding to review comments
    
    * adding default route
    
    * resolving conflicts
    
    * responding to comments
    
    * responding to comments

[33mcommit 8680f257d8924ad40808150ba9a72f1321d56655[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Feb 26 22:30:04 2020 +0300

    Notes Summary Component (#132)

[33mcommit 40b7959ffc8be731f8a07a331a57b58efad82f7c[m
Author: Drizzentic <derrickrono@gmail.com>
Date:   Tue Feb 25 19:58:03 2020 +0300

    Future appointments list ui. (#130)

[33mcommit 88fabf1bdae57fe06004aaa77ce99f99c877b723[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Sat Feb 22 23:34:34 2020 +0300

    Dynamic config (#126)
    
    * moving to config via esm-module-config
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * self-review
    
    * responding to review comments
    
    * responding to review comments

[33mcommit 6b87a400b1b276adde3d4031c0408df0a1661aa3[m
Author: Nicky Kibor Kimaina <nkimaina@ampath.or.ke>
Date:   Fri Feb 21 12:12:29 2020 +0300

    App props as context (#125)

[33mcommit 87a42dcd3cf8c31684d13a9c9fbefadccfbab277[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Feb 20 19:44:44 2020 +0300

    Medication order bug fix (#127)
    
    * Fixed bug with displaying discontinued orders
    
    * Fixed medication level three failing test

[33mcommit 707e913a9d2a9cded4457753233cfecfd5b671ea[m
Author: Mwangi <shaddy.mwangi@gmail.com>
Date:   Wed Feb 19 16:18:50 2020 +0300

    MF-135: Medication level three component (#117)
    
    * MF-135: Medication level three component
    
    * change layout to use grid for ease of positioning items

[33mcommit 5862654cd6ace17bf75019e7941cc23b5590b348[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Wed Feb 19 15:00:35 2020 +0300

    Add config (#124)
    
    * moving to config via esm-module-config
    
    * self-review
    
    * respnding to review

[33mcommit 7f0ab1b0d20cb4c13e7c9292c839f85b4233c1e1[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Feb 19 14:49:59 2020 +0300

    MF-136 : Create link to add vitals, H/W form from H/W level 2 component (#123)
    
    * MF-136 : Create link to add vitals, H/W form from H/W level 2 component
    
    * Refactor components to use useRouteMatch hook

[33mcommit 87026314ec9146e14d34b7b2443ffe9348266ee1[m
Author: Nicky Kibor Kimaina <nkimaina@ampath.or.ke>
Date:   Wed Feb 19 06:02:10 2020 +0300

    Fixed issue where parcels were not mounting (#103)

[33mcommit d532ce87e8c5a915a1d4f4d66265be19c57398ac[m
Author: Nicky Kibor Kimaina <nkimaina@ampath.or.ke>
Date:   Wed Feb 19 05:55:43 2020 +0300

    Fixed workspace width and height bugs when content overflows (#122)
    
    * Fixed workspace width when content is too wide
    
    * Fixed Workspace title height being smaller than left nav

[33mcommit 628504724e81d5779707ec8fb349172d267a20cc[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Feb 19 05:55:25 2020 +0300

    Programs summary and detail components (#120)
    
    * Programs summary and detail components
    
    * Suggested changes from review

[33mcommit 9f995ca12578f7c2cbe58a031816eff2c59386d3[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Feb 18 11:25:39 2020 +0300

    Silence react-i18next warnings when running tests (#121)
    
    * Silence react-i8next warning when running tests
    
    * Mock the i8next test dependency globally

[33mcommit 8654a98ab85ba52a6eed9068ec8b0df61d308a1e[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon Feb 17 19:10:02 2020 +0300

    Implemented Height and Weight Detailed Summary View Component (#118)

[33mcommit 51dd37d5f56ab10c5371cf262886ee1050d8b983[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Mon Feb 17 19:06:17 2020 +0300

    Adding programs, allergies and conditions to main nav. Removing clinical history (#119)

[33mcommit bce0e2bd6183bcaeff9bfa3814765293a53900dc[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Fri Feb 14 21:36:29 2020 +0300

    Nav hoc (#113)
    
    * Adding navigation to patient chart
    
    * self-review
    
    * fixing navigation
    
    * fixing navigation
    
    * create HOC for a patient chart widget with a nav bar
    
    * converted medications, summaries and vitals to use chart-widget HOC
    
    * reorganized navigation bar
    
    * self-review
    
    * updating jest config for lodash
    
    * adding reusable overview component
    
    * self-review
    
    * simplified widget config schema. switched to query params for tabs.
    
    * simplified chart-review schema
    
    * self-review
    
    * removing old files
    
    * responding to review comments

[33mcommit b312fa89cc8c1793504fce0469960f5f9a8ab5c4[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Feb 14 18:02:15 2020 +0300

    Discontinue medication order code review (#116)

[33mcommit 44fd6f14b744e0d9fc7bdf4fddfccf73b22d3b5a[m
Author: Mwangi <shaddy.mwangi@gmail.com>
Date:   Tue Feb 11 17:21:54 2020 +0300

    Mf 134 (#114)
    
    * Generic button for medication
    
    * Generic button for medication
    
    * Adding buttons to medication details component

[33mcommit 45269211436bae4ec2e441894ec6f7b6e4bf8962[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Feb 11 12:28:18 2020 +0300

    Implemented discontinue medication order functionality

[33mcommit 42cea316f287fbf23543095fe6f2cacafef2e27f[m
Author: Mwangi <shaddy.mwangi@gmail.com>
Date:   Tue Feb 11 17:21:54 2020 +0300

    Mf 134 (#114)
    
    * Generic button for medication
    
    * Generic button for medication
    
    * Adding buttons to medication details component

[33mcommit 0d5dcfa0b7ef6180098370b299c6526ead8fe281[m
Author: Mwangi <shaddy.mwangi@gmail.com>
Date:   Tue Feb 11 17:20:40 2020 +0300

    changing dosage text formatting, addition of duration, duration unuts… (#112)
    
    * changing dosage text formatting, addition of duration, duration unuts and number of refills
    
    * Removing hyphen between duration and duration units

[33mcommit 550ff1e708e6cd70c624283263ef93954c741d59[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Feb 7 15:59:57 2020 +0300

    Add functionality to edit or remove orders placed on orderBasket (#110)

[33mcommit 16c6bcfda4e5c1cfcfa6e0756ef902ddc186f6a5[m
Author: Drizzentic <derrickrono@gmail.com>
Date:   Fri Feb 7 15:57:24 2020 +0300

    Fix issue where multiple tabs open on the workspace for vitals and medication (#109)

[33mcommit dbaca4726dff1730f7929b8dc5327c0403d6cd32[m
Author: Mwangi <shaddy.mwangi@gmail.com>
Date:   Thu Feb 6 08:48:16 2020 +0300

    Past medication (#96)
    
    * Adding inactive medication.
    
    * fixed name not appearing on past medication name , removing white spaces

[33mcommit 75ea0ec98ee6b2f1b227f4b20f1184bf108a5901[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Thu Feb 6 01:44:50 2020 +0300

    Top nav - conflicts resolved (#107)
    
    * Adding navigation to patient chart
    
    * self-review
    
    * fixing navigation
    
    * fixing navigation

[33mcommit 9596968b38e37dee37d41106b21be5d088c02d81[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Feb 5 16:59:01 2020 +0300

    Remove redundant ConditionsBriefSummary component file (#108)

[33mcommit cdf3f08aa830ee27645f1d5075b801dfc5a44327[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Feb 5 15:38:01 2020 +0300

    Switched notes encounter fhir call to REST. (#106)
    
    * Switch notes encounter fhir api to REST webservices
    
    * Fixed duplicated Allergies url in level two routes
    
    * Switched notes encounter fhir to use REST API

[33mcommit e7f8b8c60a043e9941de3b9b0fdd601a24e26301[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Feb 5 02:31:27 2020 +0300

    Switch height and weights fhir api to use rest API (#104)

[33mcommit bb06de49b3b3d823e3e5998c798b22783d2c3a61[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Feb 4 17:58:10 2020 +0300

    Rename level 1 component to ConditionsSummaryComponent (#102)

[33mcommit af95a7b363bdf585d095d5e8c291c28d8c70f7d8[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon Feb 3 17:34:14 2020 +0300

    Updated vitals form to be responsive (#100)
    
    * Update vitals form to be responsive and fixed misspelled link on vitals detailed summary component
    
    * Update allergies navigate function to use useHistory hook
    
    * Changed incrementer buttons to match designs

[33mcommit 28792c51d78cfc315491621a37c6f0635ae63325[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Jan 31 18:12:32 2020 +0300

    Medication Order Basket UI Imporvement (#98)

[33mcommit 6a662dca30b1bda52e9f32acf7c86a65f2951762[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Jan 29 20:58:34 2020 +0300

    Implemented medication orders (#93)

[33mcommit 7645e4a228c6c4c2672a61eb9fc74f9d2c1bf48b[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 29 10:45:19 2020 +0300

    Fix typography for allergies and conditions widgets (#92)

[33mcommit c95d6aff6eba187213ac583366f9591ff47fcc15[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Wed Jan 29 09:14:58 2020 +0300

    Pluralize allergy to allergies (#91)

[33mcommit bbf368a52bfb12cb6df1f3a6e165d072a51f857b[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Tue Jan 28 10:15:17 2020 +0300

    MF-128: Conditions Level Three Widget (#89)
    
    * MF-128: Conditions Level Three Widget
    
    * Respond to review feedback

[33mcommit 6a16500382201b441d71ad1e29e7b3a669686053[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jan 27 16:00:06 2020 +0300

    Fix inexhaustive hook deps warning (#88)

[33mcommit 71ba5745aee10bbdfba6644e5485284d590c6a8f[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Mon Jan 27 15:52:20 2020 +0300

    workspace tabs fix (#87)

[33mcommit d20a03e8c76af05a10d22ec2be23356a669d9cb9[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Mon Jan 27 14:23:24 2020 +0300

    MF-129: Allergy Level Three Widget (#86)
    
    * MF-129: Allergy Level Three Widget
    
    * Respond to review feedback

[33mcommit 823a2e97f18032bae6b461b0cc8ab1007e7736fe[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Mon Jan 27 12:28:27 2020 +0300

    Responsive workspace (#85)

[33mcommit 045b1ac6676155f51d9c27b2c3545ce671df5633[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Mon Jan 27 10:08:52 2020 +0300

    Summaries refactor (#84)
    
    * Summaries refactor
    
    * translations fixes
    
    * rename overview widgets

[33mcommit 4a1f6ff20e48b863f249d8c11334b8c844ac2ec8[m
Author: Michael Seaton <mseaton@pih.org>
Date:   Thu Jan 23 22:48:59 2020 -0500

    Add intellij files to .gitignore (#83)

[33mcommit d9dc9ab2f99e1e6a2cf337452fda0f488289a010[m
Author: Mwangi <shaddy.mwangi@gmail.com>
Date:   Thu Jan 23 12:29:39 2020 +0300

    Adding medication level two widget (#78)
    
    * Adding medication level two widget
    
    * Updated rest api call to include strength. Added function to convert strength to dosage. (#80)
    
    * Fixing rest call for order to include strength and adding to widget
    
    * adding function to get dosage from strength for both fix quantities and concentrations
    
    * moved dosage function to utils file
    
    * Function to display data for current medication
    
    Co-authored-by: Jonathan Dick <jdick@ampath.or.ke>

[33mcommit 95f9dc1f3aefcee5133766796b81187709480089[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Wed Jan 22 15:08:47 2020 +0300

    Beginning of workspace (#81)
    
    * - Beginning of workspace
    - Add ability to close workspace tabs
    - Add ability to determine if a tab is active and to prevent closure
    
    * self review
    
    * jj's review

[33mcommit dc6c41c00436f7aa9b4c37be2065ef11db0dea1e[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Tue Jan 21 15:08:21 2020 +0300

    Updated rest api call to include strength. Added function to convert strength to dosage. (#80)
    
    * Fixing rest call for order to include strength and adding to widget
    
    * adding function to get dosage from strength for both fix quantities and concentrations
    
    * moved dosage function to utils file

[33mcommit 7ad9b504b663ebb0ed28eafb9fd16972e910af19[m
Author: Dennis Kigen <kigen.work@gmail.com>
Date:   Fri Jan 17 15:47:52 2020 +0300

    MF-99: Conditions Level 2 Widget (#76)

[33mcommit f8f23926cb421ba8fc33d7238c01d96a9e48db12[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Jan 17 12:12:00 2020 +0300

    Vitals, HeightAndWeight Refactor (#74)

[33mcommit 65aa072f9453a0d301e8f3baf48a19958f43d80f[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Jan 14 12:46:37 2020 +0300

    MF Implementing Vitals Form (#72)

[33mcommit fe1ec5e57681f22b40227616b8d26c94e79c3257[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Mon Jan 13 15:20:31 2020 +0300

    Chart refactor (#73)
    
    * refactored, re-arranged where widgets, summaries go
    
    * self-review

[33mcommit 30f42a5dd84605fe6b4232f88f103cb769aded03[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Jan 8 17:22:32 2020 +0300

    MF-120 : Implementing Allergy Add & Edit Form (#68)

[33mcommit 64bf1eb0ec74a3784d28f6e6d3b6a12ea550e01c[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Wed Jan 8 12:43:31 2020 +0300

    Fixing bugs with breadcrumbs (#70)

[33mcommit cc5b3aeaf18f4fae4d35c4c7254d308590786044[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Tue Jan 7 19:26:52 2020 +0300

    Breadcrumbs fix (#69)
    
    * fixed patient charts bugs
    
    * Fixing bugs with breadcrumbs

[33mcommit dfa3e3e74831b048bfb70e8b69672c417d48b171[m
Author: Joel Denning <joeldenning@gmail.com>
Date:   Sun Jan 5 23:37:08 2020 -0700

    Improving support for translations by using i18next babel extract icu option (#67)

[33mcommit 137035310164fce7c4742ef592c7ca633564febc[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Jan 2 16:50:59 2020 +0300

    Fixed Allergy Level Two UI & duplicated brackets (#66)

[33mcommit feedfe186f8d05854f9ab942b2aaa720c198b98d[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Thu Jan 2 16:50:24 2020 +0300

    Fix patient chart bugs and vulnerable deps (#62)
    
    * fixed patient charts bugs
    
    * fixed vulnerable deps

[33mcommit 80b9b79ecbe7451a6c4ba3b40b8c589dad482306[m
Author: Ray Ma <27805472+PermissionError@users.noreply.github.com>
Date:   Tue Dec 24 04:33:48 2019 +0800

    GCI-346 - Created wiki page for Patient Chart (#65)

[33mcommit 2b72d66b1c5279c3e54025afc8c7b2c70323d978[m
Author: Joel Denning <joeldenning@gmail.com>
Date:   Fri Dec 20 20:12:12 2019 -0700

    Removing duplicate test run in pre-commit (#64)

[33mcommit aa62effff45ad1f2d5901bae1100b6ac6ff58b83[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon Dec 16 20:07:05 2019 +0300

    MF-120: Starting of Allergy Level Three, Setting up Level Three Routes (#57)
    
    * MF-120: Starting of Allergy Level Three, Setting up Level Three Routes
    
    * MF-120 Implementing Allergy Level Three

[33mcommit 3d2c00dbd9ccb3ae92cf8145bd580e812264a682[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Sat Dec 14 19:36:41 2019 -0500

    Dynamic dashboards (#55)
    
    * made patient chart to dynamically load widgets from a test config
    
    * self-review
    
    * responding to code review
    
    * commented out failing test on notes.test, which will be corrected later by the dev who wrote the test

[33mcommit e966f3688c0ec034802e15f20720d93ab2a9a184[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Fri Dec 13 13:53:39 2019 -0500

    Medications (#46)
    
    * first commit for medications widget
    
    * first commit for medications widget
    
    * made patient chart to dynamically load widgets from a test config
    
    * self-review
    
    * self review
    
    * renamed cards, responded to PR review
    
    * self-review
    
    * adding translation for Active Medications
    
    * renamed cards based on new naming convention, responded to PR review comments
    
    * fixing error

[33mcommit d2f93a46250a9ad75dd2151480aed348c1af5b41[m
Author: Hrishikesh Patil <handsomehrishi@gmail.com>
Date:   Fri Dec 13 14:38:20 2019 +0530

    [GCI-riskycase]Update README (#59)

[33mcommit e1ef72f4bf4a1520a127a43472af8af28f318f2c[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Fri Dec 13 10:39:36 2019 +0300

    beginning of breadcrumbs (#53)

[33mcommit a91659a93c2ffaef546d36c0bd9f7f2849affb3f[m
Author: Eugene Kandie <eugenekandie@gmail.com>
Date:   Fri Dec 13 10:25:31 2019 +0300

    Notes-fixes: style, responsiveness and fixed resource (#43)

[33mcommit 60bb49c123516f8b33409a31f0b3754d0bc3743e[m
Author: Joel Denning <joeldenning@gmail.com>
Date:   Thu Dec 5 17:26:34 2019 +0200

    Adding webpack-bundle-analyzer and npm run analyze script (#56)

[33mcommit 4eaab94fb929ad9e504932bdbc9b48f0b6b5b535[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Thu Dec 5 03:31:56 2019 -0500

    Changed summary-card to use css grid and add level 2 for programs (#52)
    
    * Changed summary-card to use css grid and add level 2 for programs
    
    * self-review
    
    * responding to review

[33mcommit 5ad75909850a6b3ba592935ce91660c14198fc5c[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Wed Dec 4 10:25:54 2019 +0200

    reduced dimensions request to a single request and commented it out, fixed bug in programs (#51)

[33mcommit f1eeeacb720e4f22e235c7f1fef3fd8f4de4e5b4[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Tue Dec 3 11:18:15 2019 +0200

    removed vitals request (#50)

[33mcommit 3023da145b844f0daca7be0b974d3a6f008d88bf[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Tue Dec 3 02:52:37 2019 -0500

    Programs (#47)
    
    * first commit for programs widget
    
    * added initial tests for programs component
    
    * self-review
    
    * fix some tests for program
    
    * fixing program tests
    
    * fixing program tests
    
    * self-review
    
    * responding to review, adding type for resource
    
    * change name of fetch
    
    * change name of fetch

[33mcommit e4dbca9051522daea6af3f3bfb2be38e99e8dec2[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Mon Dec 2 12:31:57 2019 +0300

    MF-97 Implementing Vitals Card Leve Two (#28)
    
    MF-97 Implementing Vitals Card Level Two

[33mcommit 563a187660ce3131ba8dbe1fb42f3fe985d09ee1[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Mon Dec 2 03:07:41 2019 -0500

    changed styling to make Vitals and Height & Weight full width of containter (#48)

[33mcommit 89975e44bfdf7243dc48d7feb1e64864a9fd3e0d[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Nov 29 16:04:50 2019 +0300

    DE-20: Fixed shrinking height on hover on Conditions and Allergy card (#44)

[33mcommit 26075dc3331545f2305b6230f6250b57f716885c[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Nov 29 12:00:32 2019 +0300

    DE-17 Fixed expanded patient banner requiring white background and box-shadow (#35)

[33mcommit 6d63b3eb0b1daeede2221fe337a74bdfd019eac4[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Nov 29 11:56:21 2019 +0300

    DE-26: Fixed the card footer to match design on vitals,Conditions,Notes and W/H (#38)

[33mcommit 301989ae28c882d4d60da21694cdebfcab34fa61[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Thu Nov 28 21:54:34 2019 -0500

    fixed api call based on changes to openmrs fhir module and fixed vita… (#41)
    
    * fixed api call based on changes to openmrs fhir module and vixed vitals component test related to timezones
    
    * fixed api call based on changes to openmrs fhir module and vixed vitals/dimension component test related to timezones

[33mcommit 361edd86f28aca95c86612930b2b855ef0cfb980[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Nov 29 02:50:52 2019 +0300

    DE-31: Design Edit 31, Fixed font work-sans application to only dates (#33)

[33mcommit 1b13b53517d16329dae066fbe26b9948b5e67528[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Nov 28 23:08:24 2019 +0300

    DE-18: Making the entire patient banner clickable to expand the banner (#36)

[33mcommit 8edb03505176fad218b82589349d503c0f6afb3f[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Nov 28 22:43:52 2019 +0300

    DE-24 Adding box shadow to summary card (#39)

[33mcommit a3431adb5ad9f05c4986a2c72971f5c0e258ae2e[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Nov 28 22:09:34 2019 +0300

    DE-22: Add margin 20px to summary card (#40)

[33mcommit 357dde55d9d67b76cea0b04eb015db111511228b[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Nov 27 19:10:39 2019 +0300

    DE-32: Fixed display of "no allergy history" will still loading data (#34)

[33mcommit 45f6789a004453675d6f96cd937076913563cb7c[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Tue Nov 26 18:01:55 2019 +0300

    Fixed notes card failing test (#32)

[33mcommit d769b190127580b2c4dbb10cbebd51bb363c1d48[m
Author: Joel Denning <joeldenning@gmail.com>
Date:   Thu Nov 21 16:37:07 2019 -0700

    Switching to useCurrentPatient hook (#31)

[33mcommit 234fad2492fc027593668100f9fe2b98cf281700[m
Author: Joel Denning <joeldenning@gmail.com>
Date:   Thu Nov 21 13:00:57 2019 -0700

    Make patient banner white. UX bug row 15 (#30)

[33mcommit 215c766372ab1fd33299200f7bc0505f6ec88990[m
Author: Joel Denning <joeldenning@gmail.com>
Date:   Thu Nov 21 11:52:29 2019 -0700

    Adding backend dependencies (#29)
    
    * Adding backend dependencies
    
    * Brandon's feedback

[33mcommit 30628b1bfb06f39a7a79894afa29da7a7b13d781[m
Author: Joel Denning <joeldenning@gmail.com>
Date:   Thu Nov 21 11:19:23 2019 -0700

    Upgrading dependencies (#27)
    
    * Upgrading dependencies
    
    * Upgrading react-root-decorator

[33mcommit f9ae0a315377675ef629969ef8734d38e0a23517[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Nov 21 06:02:47 2019 +0300

    MF-92 Implementing Vitals Card Level 1 (#23)
    
    * MF-92 Implementing Vitals Card Level 1
    
    * MF-92 Code Review

[33mcommit 506c143107d476018da36e34da8f42faeb8509c5[m
Author: Jonathan Dick <jdick@ampath.or.ke>
Date:   Tue Nov 19 15:59:14 2019 -0500

    fixed patient banner to have space after name (#26)

[33mcommit 70f8d617e34469a13a07e09924a47ff5d9782d2f[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Fri Nov 15 13:04:58 2019 +0300

    Fixed code coverage (#25)

[33mcommit a9d4d731c6b1a3d91c7ccd44ea0f7c9eefc3b441[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Fri Nov 15 12:59:49 2019 +0300

    Added code coverage (#24)

[33mcommit 965cac5716c8cc0e32967398f8124fb8cd8f221a[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Fri Nov 15 12:53:45 2019 +0300

    Fixed notes card display and added tests (#21)
    
    * Fixed notes card display and added tests
    
    * Self review and fix failing tests

[33mcommit b5c6cc76da68d0608a94eecf382cf5bd9e556776[m
Author: Stanila Andrei <andrei133303@gmail.com>
Date:   Fri Nov 15 06:10:10 2019 +0200

    MF-91: Height and Weight Widget (#8)
    
    * Doc folder
    
    * Vitals widget
    
    * Fixed travis
    
    * fixed font
    
    * Update src/summary/documentation/show-more-card.component.tsx
    
    Co-Authored-By: Joel Denning <joeldenning@gmail.com>
    
    * Changes
    
    * clickhandler
    
    * remove inline
    
    * Add error handler
    
    * Added units and icon for more
    
    * some changes
    
    * deleted useless files

[33mcommit 75a0defb19477cda383011a32a64ac0e1a8e87ec[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Thu Nov 14 14:56:00 2019 +0300

    MF-94 Impementing Level Two Allergy UI and Test (#17)
    
    * MF-94: Implementing Allergy Level Two
    
    * MF-94 Implement Level Two Allergies UI Improvement & Tests

[33mcommit 7fd26cc1e74a53d731ca483df2e997bcbe8a9de6[m
Author: Joel Denning <joeldenning@gmail.com>
Date:   Thu Nov 14 01:33:35 2019 -0700

    License, jsonpFunction, and tests (#19)

[33mcommit 4a67bb89a183fbbcc0d993e89857b25d94007930[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Thu Nov 14 01:30:50 2019 +0300

    MF-91: Dimensions Level Two (#14)
    
    * MF-91: Dimensions Level 2
    
    * Joel's review
    
    * Joel's review

[33mcommit bfd061c7a7733ab39ae58d07669481b2775725f3[m
Author: Joel Denning <joeldenning@gmail.com>
Date:   Wed Nov 13 10:45:52 2019 -0700

    Fixing problems with level two routes. (#16)
    
    * Fixing problems with level two routes.
    
    * Self review

[33mcommit c9955e86f7e6c17351d4be6c5670144e4f201003[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Nov 13 20:34:54 2019 +0300

    MF-94: Implementing Allergy Level Two (#13)

[33mcommit a79b2b7cf730e21a02ab2fbb0615d11c7674bff8[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Wed Nov 13 20:26:29 2019 +0300

    Updated Summary card header to new designs (#15)

[33mcommit 378ae14f14a92aa199949ca870dcc0749f743f45[m
Author: Eugene Kandie <eugenekandie@gmail.com>
Date:   Tue Nov 12 09:19:54 2019 +0300

    MF-93: Encounters Notes Card (#9)

[33mcommit 3c001fa1f796c0262ccdcc30da64533871712e18[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Sat Nov 9 11:59:58 2019 +0300

    Relationships widget (#10)
    
    * Relationships widget
    
    * Joel's review

[33mcommit 1316b256957c42495228a7be357b75b7f3177717[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Fri Nov 8 23:52:33 2019 +0300

    Centered patient widgets (#11)

[33mcommit d9e45001d25493e422c27dbfdea7d2344ce36d80[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Nov 6 00:41:04 2019 +0300

    Switched Conditions and Allergy card to use Horizontal-label value (#7)

[33mcommit 6401c1985cd6336a8dc3d41956659acfa3f23182[m
Author: Joel Denning <joeldenning@gmail.com>
Date:   Mon Nov 4 11:33:55 2019 -0700

    Fixing color of summary card arrow (#5)

[33mcommit 65b793aa7b30ab0a7b4bff620c4d1ce58f38c9df[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Mon Nov 4 21:25:14 2019 +0300

    MF-84: Create Profile Widget for Patient Chart (#2)
    
    * MF-84: Added identifiers widget
    
    * MF-84: Added contacts widget and tests
    
    * MF-84: Modified card css to be responsive
    
    * JJ's feedback
    
    * Self review
    
    * Added relationships widget
    
    * New designs
    
    * Self review
    
    * Self review
    
    * Fix failing build
    
    * Joel's review
    
    * Joel's review

[33mcommit 1768423bfd5ffeab0950a52642a20c056d6e18ea[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Fri Nov 1 01:36:01 2019 +0300

    MF:85 Implementing Conditions Card (#6)
    
    * MF:85 Implementing Conditions Card
    
    * MF:85 Implement Conditions Card Review

[33mcommit c3aaf15e4facfc3ec0a77479c01e2c309dee8cdc[m
Author: Donald Kibet <chelashawdonald@yahoo.com>
Date:   Wed Oct 23 19:15:15 2019 +0300

    MF:85 Create History Widget for Patient Chart : Allergy Card implemen… (#4)
    
    * MF:85 Create History Widget for Patient Chart : Allergy Card implementation
    
    * MF-85 allergy-card code review

[33mcommit 622f5b34dc51217b3e95794c5bae8c0477f57d2c[m
Author: Joel Denning <joeldenning@gmail.com>
Date:   Tue Oct 15 14:41:43 2019 -0700

     MF-84: Beginnings of patient summary page and demographics card.  (#1)
    
    * MF-84: Beginnings of patient summary page and demographics card.
    
    * Self review
    
    * Upgrading esm-api
    
    * Brandon's feedback
    
    * Getting serious about displaying ages
    
    * Brandon's feedback
    
    * Brandon's feedback

[33mcommit 14775079b28d565167777dc3d75da3594e0fd4f6[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Tue Oct 8 09:57:15 2019 +0300

    Initial commit

[33mcommit 1bebbfd12709393d99d87ba2c2cf6a055af9dbe9[m
Author: Fatma Ali <alifatma2019@gmail.com>
Date:   Tue Oct 8 09:09:28 2019 +0300

    Initial commit
