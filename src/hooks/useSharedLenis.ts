// hooks/useSharedLenis.ts

import { use } from "react";
import { LenisContext } from "../context/LenisContext";

export function useSharedLenis() {
  const context = use(LenisContext);
  if (context === null) {
    throw new Error("useSharedLenis must be used within a LenisProvider");
  }
  return context;
}
