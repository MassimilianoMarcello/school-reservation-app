// components/LogoutButton.tsx
// "use client";

// import { signOut } from "next-auth/react";
// import { Button } from "../ui/button";

// export default function LogoutButton() {
//   return (
//     <Button
// variant="outline"
//       onClick={() => signOut({ callbackUrl: "/login" })}

//     >
//       Logout
//     </Button>
//   );
// }

"use client";

import { signOut } from "next-auth/react";
import { Button } from "../ui/button";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Errore nel logout personalizzato:", error);
    } finally {
      await signOut({ callbackUrl: "/login" });
    }
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  );
}
