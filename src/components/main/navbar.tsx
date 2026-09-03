import {
  Banknote,
  Briefcase,
  Calendar,
  Footprints,
  GraduationCap,
  Home,
  Megaphone,
  Settings,
  Tally5,
  Phone,
  Trophy,
  BookOpen,
  Target,
} from 'lucide-react';
import { cookies } from 'next/headers';
import Image from 'next/image';

import {
  getAnnoucements,
  getCourses,
  getScholarships,
  getTryouts,
  getUserEvents,
} from '~/server/action';
import { auth } from '~/server/auth';

import StudentBreadcrumb from '../student-breadcrumb';
import ThemeSwitch from '../theme-switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../ui/sidebar';
import SearchCMDK, { type TabsType } from './cmdk-search';
import ProfileMenu from './profile-menu';
import { SidebarNavLink } from './sidebar-nav-link';

const sidebarTabs: {
  group: string;
  items: {
    label: string;
    href: string;
    icon: typeof Banknote;
    tooltip: string;
    dev?: boolean;
    tag?: string;
  }[];
}[] = [
    {
      group: 'General',
      items: [
        {
          label: 'Dashboard',
          href: '/dashboard',
          icon: Home,
          tooltip: 'Dashboard',
        },
        {
          label: 'Hall of Fame',
          href: '/hall-of-fame',
          icon: Trophy,
          tooltip: 'Hall of Fame',
          tag: 'new',
        },
        {
          label: 'Schedule',
          href: '/schedule',
          icon: Calendar,
          tooltip: 'Schedule',
          dev: false,
        },
      ],
    },
    {
      group: 'Academics',
      items: [
        {
          label: 'Courses',
          href: '/courses',
          icon: GraduationCap,
          tooltip: 'Courses',
        },
        { label: 'Tryouts', href: '/tryouts', icon: Tally5, tooltip: 'Tryouts' },
        {
          label: 'Scholarships',
          href: '/scholarships',
          icon: Banknote,
          tooltip: 'Scholarships',
        },
      ],
    },
    {
      group: 'Himpunan',
      items: [
        {
          label: 'Events',
          href: '/events',
          icon: Footprints,
          tooltip: 'Events',
          dev: false,
        },
        {
          label: 'Announcements',
          href: '/announcements',
          icon: Megaphone,
          tooltip: 'Announcements',
          dev: false,
        },
        {
          label: 'M-Opportunity',
          href: '/loker',
          icon: Briefcase,
          tooltip: 'M-Opportunity',
          dev: false,
        },
        {
          label: 'Hotline',
          href: '/hotline',
          icon: Phone,
          tooltip: 'Hotline',
          dev: false,
        },
        {
          label: 'Competition',
          href: '/competition',
          icon: Target,
          tooltip: 'Competition',
          dev: false,
        },
      ],
    },
    // {
    //   group: 'Quick Access',
    //   items: [
    //     {
    //       label: 'Guidebook',
    //       href: '/docs/user',
    //       icon: BookOpen,
    //       tooltip: 'Guidebook',
    //     },
    //   ],
    // },
    {
      group: 'Preferences',
      items: [
        {
          label: 'Settings',
          href: '/settings',
          icon: Settings,
          tooltip: 'Settings',
          dev: false,
        },
      ],
    },
    {
      group: 'Admin',
      items: [
        {
          label: 'Admin Panel',
          href: '/admin',
          icon: Home,
          tooltip: 'Admin Panel',
        },
        {
          label: 'Machining',
          href: '/machining',
          icon: BookOpen,
          tooltip: 'Machining',
        },
      ],
    },
  ];

export default async function MainNavbar({ children }: Readonly<{ children: React.ReactNode }>) {
  const SIDEBAR_COOKIE_NAME = 'sidebar_state';
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value === 'true';
  const session = await auth();

  const courses = (await getCourses())
    .filter((course) => course.scope !== 'MACHINING')
    .map((course) => ({
      id: course.id,
      title: course.title,
      classCode: course.classCode,
      totalLessons: course.totalLessons,
      totalVideos: course.totalVideos,
    }));
  const announcements = (await getAnnoucements())
    .filter((announcement) => announcement.scope !== 'MACHINING')
    .map((announcement) => ({
      id: announcement.id,
      title: announcement.title,
      date: announcement.createdAt,
    }));
  const events = (await getUserEvents(session?.user.id ?? ''))
    .filter((event) => event.scope !== 'MACHINING')
    .map((event) => ({
      id: event.id,
      title: event.title,
      date: event.createdAt,
    }));
  const scholarships = (await getScholarships()).map((scholarship) => ({
    id: scholarship.id,
    title: scholarship.title,
    date: scholarship.createdAt,
  }));
  const tryout = (await getTryouts()).map((tryout) => ({
    id: tryout.id,
    title: tryout.title,
    classCode: tryout.course.classCode ?? 'N/A',
  }));

  const tabs = {
    courses,
    announcements,
    events,
    scholarships,
    tryouts: tryout,
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen} cookieName={SIDEBAR_COOKIE_NAME}>
      <AppSidebar />
      <main className="bg-background h-screen w-full">
        <SiteHeader data={tabs} />
        <div className="h-[calc(100%-16*var(--spacing)))] p-4 group-has-data-[collapsible=icon]/sidebar-wrapper:h-[calc(100%-12*var(--spacing))] md:p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}

async function AppSidebar() {
  const session = await auth();
  const user = session?.user ?? {
    name: 'Guest',
    role: 'STUDENT',
    image: '',
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-sidebar-border/60 border-r">
      <SidebarHeader className="px-3 pt-3 group-data-[collapsible=icon]:px-1.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:border-sidebar-border/70 data-[state=open]:bg-sidebar-accent/30 data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/20 rounded-xl border border-transparent px-2 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
            >
              <div className="flex aspect-square h-full items-center justify-center rounded-lg transition-all">
                <Image
                  src="/hmm-vstock/logo.png"
                  alt="Logo"
                  width={196}
                  height={196}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="ml-2 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <h1 className="truncate text-base font-semibold tracking-tight">HMM ITB</h1>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 pb-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-1.5">
        {sidebarTabs.map((group) => {
          if (group.group === 'Admin' && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            return null;
          }
          const isSpaciousNav = group.group === 'Academics' || group.group === 'Himpunan';
          return (
            <SidebarGroup
              key={'sidebar-group-' + group.group}
              className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:p-1"
            >
              <SidebarGroupLabel className="text-sidebar-foreground/45 px-3 text-[10px] font-medium tracking-[0.1em] uppercase">
                {group.group}
              </SidebarGroupLabel>
              <SidebarMenu
                className={[
                  'group-data-[collapsible=icon]:items-center',
                  isSpaciousNav ? 'gap-2' : 'gap-1',
                ].join(' ')}
              >
                {group.items.map((item) => (
                  <SidebarMenuItem key={'sidebar-item-' + item.label}>
                    <SidebarMenuButton
                      tooltip={item.tooltip}
                      asChild
                      className={[
                        'text-sidebar-foreground/80 hover:bg-sidebar-accent/25 hover:text-sidebar-foreground [&[aria-current=page]]:bg-sidebar-primary [&[aria-current=page]]:text-sidebar-primary-foreground rounded-xl px-3 text-[13px] font-medium group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 [&[aria-current=page]]:font-semibold [&[aria-current=page]]:shadow-sm',
                        isSpaciousNav ? 'h-11 min-h-11 py-2.5' : 'h-10',
                      ].join(' ')}
                    >
                      <SidebarNavLink
                        href={item.href}
                        className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center"
                      >
                        <item.icon className="size-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.dev && (
                          <Badge
                            variant="secondary"
                            className="ml-2 group-data-[collapsible=icon]:hidden"
                          >
                            dev
                          </Badge>
                        )}
                        {item.tag && (
                          <Badge className="ml-auto h-5 rounded-md px-1.5 text-[10px] group-data-[collapsible=icon]:hidden">
                            {item.tag}
                          </Badge>
                        )}
                      </SidebarNavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="px-3 pb-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-1.5">
        <ProfileMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

function SiteHeader({ data }: { data: TabsType }) {
  return (
    <header className="bg-background/90 sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b py-2 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <StudentBreadcrumb />
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <SearchCMDK data={data} />
          <Separator orientation="vertical" className="h-5 data-[orientation=vertical]:h-4" />
          <div className="flex items-center pl-0.5">
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </header>
  );
}
