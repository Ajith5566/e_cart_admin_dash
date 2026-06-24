// context/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "./AuthContextDef";

export const useAuth = () => useContext(AuthContext);