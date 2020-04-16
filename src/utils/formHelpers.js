import { useState } from 'react';
import * as Yup from 'yup';

/**
 * Hook to manage status message state
 * 
 *  const [ messages, setMessages ] = useStatusMessages();
 *  setMessages({ error: "An error message", status: "A status message"})
 * 
 * Either can be omitted (or set to null) to clear the message. To render:
 * 
 *  <StatusMessages messages={messages} />
 */
export function useStatusMessages() {
  const [ state, setState ] = useState({status: null, error: null});
  return [ state, ({ status=null, error=null }={}) => { setState({ status, error })} ];
}

/**
 * Helper to build an `onSubmit()` handler for a Formik form,
 * setting and clearing status/error messages, displaying an
 * optional success message, and calling an action handler.
 */
export function submitHandler({
  action,
  success=null,
  setMessages=null,
  knownErrors={}
}) {
  return async (data) => {
    setMessages && setMessages();
    try {
      await action(data);
      if(success && setMessages) {
        setMessages({ status: success });
      }
    } catch(error) {
      if(error.code in knownErrors && setMessages) {
        setMessages({ error: knownErrors[error.code] });
      } else {
        console.log(error);
        setMessages && setMessages({ error: error.message });
      }
    }
  };
}

export const splitLines = /[\r\n,;]/;
const validateEmail = Yup.string().email().required();

/**
 * Use in a Yup `test()` to validate a list of email addresses in a text box.
 */
export const isListOfEmails = {
  name: 'is-list-of-email-addresses',
  message: 'Please enter a list of email addresses, one per line',
  test: value => !value || value.split(splitLines).every(v => !v || validateEmail.isValidSync(v.trim()))
};
