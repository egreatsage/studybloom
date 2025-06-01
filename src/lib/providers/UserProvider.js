"use client";

import React from "react";
import useUserStore from "../stores/userStore";

const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
  const store = useUserStore();
  return (
    <UserContext.Provider value={store}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => React.useContext(UserContext);
