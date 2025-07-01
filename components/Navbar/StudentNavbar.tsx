"use client"

import * as React from "react"
import Link from "next/link"
// import { useSession } from "next-auth/react"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export function NavigationMenuDemo() {
//   const { data: session } = useSession()
//   const teacherId = session?.user?.id 
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/teacher/createPackageLessons">Create Lessons Packages</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>  */}

        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/teachers-list">Teachers List</Link>
          </NavigationMenuLink>
        </NavigationMenuItem> 

        {/* <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/docs">Reservations</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>  */}

        {/* {teacherId && (
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href={`/teacher/${teacherId}`}>Packages List</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )} */}
      </NavigationMenuList>
    </NavigationMenu>
  )
}