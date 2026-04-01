"use client";

import { createContext, useContext } from 'react';

export const ProtectedContext = createContext<{ 
  user: string | null; 
  context: any | null;
}>({ 
  user: null, 
  context: null 
});

export function useProtectedContext() {
  return useContext(ProtectedContext);
}
