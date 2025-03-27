// src/context/UserContext.ts
import { IUserContext } from '@/types/context';
import { createContext } from 'react';

const UserContext = createContext<IUserContext | undefined>(undefined);

export default UserContext;
