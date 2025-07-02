"use client"

import * as React from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export function NavigationMenuDemo() {
  const { data: session } = useSession()
  const teacherId = session?.user?.id // assicurati che user.id sia quello corretto nel tuo JWT/callback

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/teacher/createPackageLessons" className={navigationMenuTriggerStyle()}>
              Create Lessons Packages
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/teacher/teacher-profile-form" className={navigationMenuTriggerStyle()}>
              Create Profile
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/teacher/calendar" className={navigationMenuTriggerStyle()}>
              Calendar
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/teacher/profile" className={navigationMenuTriggerStyle()}>
              Profile
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {teacherId && (
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href={`/teacher/${teacherId}`} className={navigationMenuTriggerStyle()}>
                Packages List
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}







