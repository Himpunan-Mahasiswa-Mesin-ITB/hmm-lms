import {
  Banknote,
  Calendar,
  GraduationCap,
  Home,
  Megaphone,
  Users,
  BarChart3,
  FileText,
  Database,
  BookOpen,
  Briefcase,
  TestTube,
  FormInput,
  Link2,
  Settings,
} from 'lucide-react';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

import {
  getAnnoucements,
  getCourses,
  getScholarships,
  getTryouts,
  getUserEvents,
} from '~/server/action';
import { auth } from '~/server/auth';

import SearchCMDK, { type TabsType } from '../main/cmdk-search';
// import HeaderTitle from '../main/header-title';
import ProfileMenu from '../main/profile-menu';
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

const adminSidebarTabs: {
  group: string;
  items: {
    label: string;
    href: string;
    icon: typeof Banknote;
    tooltip: string;
    dev?: boolean;
  }[];
}[] = [
    {
      group: 'General',
      items: [
        { label: 'Dashboard', href: '/admin', icon: Home, tooltip: 'Admin Dashboard' },
        {
          label: 'Analytics',
          href: '/admin/analytics',
          icon: BarChart3,
          tooltip: 'Analytics & Reports',
          dev: false,
        },
        {
          label: 'Forms',
          href: '/admin/forms',
          icon: FormInput,
          tooltip: 'Manage Forms',
          dev: false,
        },
        { label: 'Short Links', href: '/admin/shortlinks', icon: Link2, tooltip: 'Shorten Links' },
      ],
    },
    {
      group: 'Content Management',
      items: [
        { label: 'Courses', href: '/admin/courses', icon: GraduationCap, tooltip: 'Manage Courses' },
        {
          label: 'Scholarships',
          href: '/admin/scholarships',
          icon: Banknote,
          tooltip: 'Manage Scholarships',
        },
        { label: 'Tryouts', href: '/admin/tryouts', icon: TestTube, tooltip: 'Manage Tryouts' },
        {
          label: 'Announcements',
          href: '/admin/announcements',
          icon: Megaphone,
          tooltip: 'Manage Announcements',
        },
        { label: 'Events', href: '/admin/events', icon: Calendar, tooltip: 'Manage Events' },
        {
          label: 'M-Opportunity',
          href: '/admin/loker',
          icon: Briefcase,
          tooltip: 'Manage M-Opportunity',
        },
      ],
    },
    {
      group: 'User Management',
      items: [
        { label: 'Users', href: '/admin/users', icon: Users, tooltip: 'Manage Users', dev: false },
      ],
    },
    {
      group: 'Machining Management',
      items: [
        {
          label: 'Machining Batch',
          href: '/admin/machining-batch',
          icon: Settings,
          tooltip: 'Machining Batch',
          dev: false,
        },
      ],
    },
    {
      group: 'Payload CMS',
      items: [
        {
          label: 'Content Panel',
          href: '/admin-cms',
          icon: FileText,
          tooltip: 'Content Management System',
          dev: false,
        },
      ],
    },
    {
      group: 'System',
      items: [
        {
          label: 'Database',
          href: '/admin/database',
          icon: Database,
          tooltip: 'Database Management',
          dev: false,
        },
        // { label: 'Logs', href: '/admin/logs', icon: FileText, tooltip: 'System Logs', dev: false },
      ],
    },
    {
      group: 'Quick Access',
      items: [
        // {
        //   label: 'Admin Guidebook',
        //   href: '/docs/admin',
        //   icon: BookOpen,
        //   tooltip: 'Admin Guidebook',
        // },
        { label: 'Back to App', href: '/dashboard', icon: BookOpen, tooltip: 'Back to Main App' },
        {
          label: 'Back to Machining',
          href: '/machining',
          icon: BookOpen,
          tooltip: 'Back to Machining App',
        },
      ],
    },
  ];

export default async function AdminNavbar({ children }: Readonly<{ children: React.ReactNode }>) {
  const SIDEBAR_COOKIE_NAME = 'admin_sidebar_state';
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value === 'true';
  const session = await auth();

  // Admin-specific data fetching
  const courses = (await getCourses()).map((course) => ({
    id: course.id,
    title: course.title,
    classCode: course.classCode,
    totalLessons: course.totalLessons,
    totalVideos: course.totalVideos,
  }));

  const announcements = (await getAnnoucements()).map((announcement) => ({
    id: announcement.id,
    title: announcement.title,
    date: announcement.createdAt,
  }));

  const events = (await getUserEvents(session?.user.id ?? '')).map((event) => ({
    id: event.id,
    title: event.title,
    date: event.createdAt,
  }));

  const scholarships = (await getScholarships()).map((scholarship) => ({
    id: scholarship.id,
    title: scholarship.title,
    date: scholarship.createdAt,
  }));

  const tryouts = (await getTryouts()).map((tryout) => ({
    id: tryout.id,
    title: tryout.title,
    classCode: tryout.course.classCode ?? 'N/A',
  }));

  const tabs = {
    courses,
    announcements,
    events,
    scholarships,
    tryouts: tryouts,
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen} cookieName={SIDEBAR_COOKIE_NAME}>
      <AdminSidebar />
      <main className="w-full h-screen">
        <AdminSiteHeader data={tabs} />
        <div className="h-[calc(100%-16*var(--spacing)))] p-4 md:p-6 group-has-data-[collapsible=icon]/sidebar-wrapper:h-[calc(100%-12*var(--spacing))]">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}

async function AdminSidebar() {
  const session = await auth();
  const user = session?.user ?? {
    name: 'Guest',
    role: 'ADMIN',
    image: '',
  };

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r-2 border-r-orange-200 dark:border-r-orange-900"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-inherit"
            >
              <div className="flex aspect-square transition-all items-center justify-center rounded-lg h-full">
                <Image
                  src="/hmm-vstock/logo.png"
                  alt="Logo"
                  width={196}
                  height={196}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex-1 text-left text-sm leading-tight ml-2 group-data-[collapsible=icon]:hidden">
                <h1 className="text-xl font-semibold truncate">HMM ITB</h1>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {adminSidebarTabs.map((group) => (
          <SidebarGroup key={'admin-sidebar-group-' + group.group}>
            <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={'admin-sidebar-item-' + item.label}>
                  <SidebarMenuButton tooltip={item.tooltip} asChild>
                    <Link
                      href={item.href}
                      className="transition-all rounded-l-full pl-4 py-1.5 flex items-center hover:bg-orange-50 dark:hover:bg-orange-950/20"
                    >
                      <item.icon />
                      <span>{item.label}</span>
                      {item.dev && (
                        <Badge variant="secondary" className="ml-2">
                          dev
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <ProfileMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

function AdminSiteHeader({ data }: { data: TabsType }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 py-2 sticky top-0 z-50 border-b bg-background border-b-orange-200 dark:border-b-orange-900">
      <div className="flex items-center w-full gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <StudentBreadcrumb />
        <div className="ml-auto flex gap-4 items-center">
          <SearchCMDK data={data} />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  );
}
