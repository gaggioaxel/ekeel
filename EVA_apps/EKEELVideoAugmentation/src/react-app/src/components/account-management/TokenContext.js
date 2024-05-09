import React from "react";


/**
 * React context used to share some global properties to all component, specially if the user is logged in (if the token is different than '')
 */
export const TokenContext = React.createContext({
    token: '',
    setToken: () => {},
    nameSurname: '',
    setNameSurname: () => {},
    email: '',
    setContextEmail: () => {}
  });