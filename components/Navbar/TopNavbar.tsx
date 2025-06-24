"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "../ui/button";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { useSession } from "next-auth/react";

const TopNavbar = () => {
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";
  const isAdmin = session?.user.role === "ADMIN";
  const googleUser = session?.user.isOAuthUser;
  return (
    <div className="bg-amber-300 p-4 flex justify-between items-center">
      {/* Menu a sinistra */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Link</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Bottoni a destra */}
      <div className="flex gap-2">
        {isAdmin && (
          <>
            <Button asChild variant="outline">
              <Link href="/admin/ad-dashboard">Admin Panel</Link>
            </Button>
          </>
         )} 
        {!isLoggedIn && (
          <>
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/register">Register</Link>
            </Button>
          </>
         )}

        {isLoggedIn && (
          <>
            {!googleUser && (
              <Button asChild variant="outline">
                <Link href="/change-password">Change Password</Link>
              </Button>
             )} 
            <Button asChild variant="outline">
              <Link href="/user/dashboard">Dashboard</Link>
            </Button>
            <LogoutButton />
          </>
         )} 
      </div>
    </div>
  );
};

export default TopNavbar;
