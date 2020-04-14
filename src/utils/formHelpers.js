/**
 * Helper to build an `onSubmit()` handler for a Formik form,
 * setting and clearing status/error messages, displaying an
 * optional success message, and calling an action handler.
 */
export function submitHandler({
  action,
  success=null,
  setStatusMessage=null,
  setErrorMessage=null,
  knownErrors={}
}) {
  return async (data, { setSubmitting }) => {
    setStatusMessage && setStatusMessage(null);
    setErrorMessage && setErrorMessage(null);
    try {
      await action(data);
      if(success && setStatusMessage) {
        setStatusMessage(success);
      }
    } catch(error) {
      if(error.code in knownErrors && setErrorMessage) {
        setErrorMessage(knownErrors[error.code]);
      } else {
        console.log(error);
        setErrorMessage && setErrorMessage(error.message);
      }
    }
    setSubmitting(false);
  };
}