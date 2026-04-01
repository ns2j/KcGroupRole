"use client";

import { createContext, useContext } from 'react';

export type ManagerContextType = {
  contextData: any;
  userData: any;
  status: 'loading' | 'unauthenticated' | 'forbidden' | 'authorized';
};

export const ManagerContext = createContext<ManagerContextType>({
  contextData: null,
  userData: null,
  status: 'loading',
});

export function useManagerContext() {
  return useContext(ManagerContext);
}
