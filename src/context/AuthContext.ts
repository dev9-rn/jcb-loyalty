// src/context/AuthContext.ts
import { IAuthContext } from '@/types/context';
import { createContext } from 'react';

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export default AuthContext;
