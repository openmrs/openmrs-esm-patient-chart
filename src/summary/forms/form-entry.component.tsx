import React from "react";
import * as singleSpa from "single-spa";
import { Parcel } from "single-spa-react";

export default function FormEntry(props) {
  //     console.log('form entry props', props);
  //   React.useEffect(() => {
  //     console.log('Component mounting again');
  //     const formEntryModule = System.import("@ampath/esm-angular-form-entry");
  //     formEntryModule.then((mod) => {
  //       console.info('Imported module:', mod);
  //       // setFormEntryconfig(mod.helloWorld);
  //       const config = mod;
  //       const domElement = document.getElementById('form-entry-holder')
  //       const parcelProps = { domElement, patient: "some-patient"}
  //       const parcel = props.mountParcel(config, parcelProps)
  //       // The parcel is being mounted. We can wait for it to finish with the mountPromise.
  //       parcel.mountPromise.then(() => {
  //         console.info('Finished mounting form-entry parcel.')
  //       });

  //     });
  //   }, []);

  return (
    // <div id="form-entry-holder">Loading form widget..</div>
    <Parcel config={System.import("@ampath/esm-angular-form-entry")} />
  );
}
