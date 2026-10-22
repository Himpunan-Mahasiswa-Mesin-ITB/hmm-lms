"use client";

import type { Role } from "~/types/enums";
import { Bell, ChevronsUpDown, LogOut, User } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";

export default function ProfileMenu({
  user,
}: {
  user: {
    name?: string;
    image?: string;
    role?: Role;
  };
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/20 active:bg-sidebar-accent/20 flex items-center gap-2 truncate rounded-xl border border-transparent px-2 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
            >
              <Avatar className="h-8 w-8 rounded-lg group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7">
                <AvatarImage
                  src={user?.image ?? "/default-avatar.png"}
                  alt="avatar"
                />
                <AvatarFallback className="rounded-md">
                  {user?.name?.split(" ").map((t: string) => t[0])}
                </AvatarFallback>
              </Avatar>
              <div className="*:text-[0.625rem] group-data-[collapsible=icon]:hidden">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-abu-3">{user?.role}</p>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user?.image ?? "/default-avatar.png"}
                    alt="avatar"
                  />
                  <AvatarFallback className="rounded-md">
                    {user?.name?.split(" ").map((t: string) => t[0])}
                  </AvatarFallback>
                </Avatar>
                <div className="*:text-[0.625rem]">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-abu-3">{user?.role}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="/machining/profile"
                  className="flex"
                  onClick={() => {
                    if (isMobile) setOpenMobile(false);
                  }}
                >
                  <User className="mr-1 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-1 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/auth/sign-out"
                  className="flex"
                  onClick={() => {
                    if (isMobile) setOpenMobile(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
