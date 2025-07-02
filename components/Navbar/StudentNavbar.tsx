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
  // const { data: session } = useSession()
  //   const teacherId = session?.user?.id 
  
  return (
    <NavigationMenu>
      <NavigationMenuList>
       

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/student/profile-form" className={navigationMenuTriggerStyle()}>
              Create Profile
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/student/calendar" className={navigationMenuTriggerStyle()}>
              Calendar
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/student/profile" className={navigationMenuTriggerStyle()}>
              Profile
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

           <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/teachers-list">Teachers List</Link>
          </NavigationMenuLink>
        </NavigationMenuItem> 

       
      </NavigationMenuList>
    </NavigationMenu>
  )
}

       
     