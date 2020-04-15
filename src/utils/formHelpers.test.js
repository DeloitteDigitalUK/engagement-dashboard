import * as Yup from 'yup';
import { isListOfEmails } from './formHelpers';

describe('listOfEmails', () => {

  test('accepts empty string', () => {
    expect(Yup.string().test(isListOfEmails).isValidSync("")).toEqual(true);
  });
  
  test('accepts single email address', () => {
    expect(Yup.string().test(isListOfEmails).isValidSync("test@example.org")).toEqual(true);
  });
  
  test('accepts newline-separated', () => {
    expect(Yup.string().test(isListOfEmails).isValidSync("test@example.org\ntest2@example.org")).toEqual(true);
  });
  
  test('accepts newline-separated and trims', () => {
    expect(Yup.string().test(isListOfEmails).isValidSync("test@example.org\n  test2@example.org\ntest3@example.org   ")).toEqual(true);
  });
  
  test('accepts comma-separated', () => {
    expect(Yup.string().test(isListOfEmails).isValidSync("test@example.org, test2@example.org,test3@example.org ")).toEqual(true);
  });
  
  test('accepts semicolon-separated', () => {
    expect(Yup.string().test(isListOfEmails).isValidSync("test@example.org, test2@example.org;test3@example.org ")).toEqual(true);
  });
  
  test('rejects single non-email address', () => {
    expect(Yup.string().test(isListOfEmails).isValidSync("testexample.org")).toEqual(false);
  });
  
  test('rejects newline-separated with non-email address', () => {
    expect(Yup.string().test(isListOfEmails).isValidSync("test@example.org\ntest2@exampleorg")).toEqual(false);
  });
  
  test('rejects newline-separated with non-email address and trims', () => {
    expect(Yup.string().test(isListOfEmails).isValidSync("test@example.org\n  test2@example.org\ntest3@example.org   \nfoo")).toEqual(false);
  });
  
  test('rejects semicolon-separated with invalid email address', () => {
    expect(Yup.string().test(isListOfEmails).isValidSync("test@example.org, test2@example.org;test3@example.org ;foo")).toEqual(false);
  });
  

});