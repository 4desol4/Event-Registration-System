import { useState } from "react";

// Placeholder identity until Phase 6 (real auth) lands. We still want lock/resolve
// actions attributed to *someone* so two staff don't collide on the same flagged row.
export function useStaffIdentity() {
  const [name, setName] = useState(() => localStorage.getItem("staffName") || "");

  function setStaffName(newName: string) {
    localStorage.setItem("staffName", newName);
    setName(newName);
  }

  return { staffName: name, setStaffName };
}
