import { object, string } from 'yup';

export const signupFormValidate = object({
  username: string().required('Please enter your email address').email('Invalid email address'),
  password: string()
    .required('Please enter your password')
    .matches(/^(?=.*[a-z])(?=.*[0-9])(?=.{8,})/, 'Password must be at least 8 characters length with at least 1 number and lower case letter'),
  firstName: string().required('Please enter your first name'),
  lastName: string().required('Please enter your last name'),
});
