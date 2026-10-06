import {
  BookOpen,
  BookOpenCheck,
  Bell,
  ClipboardCheck,
  FileText,
  Info,
  LayoutDashboard,
  Terminal,
  Trophy,
  Users,
  User,
  type LucideIcon,
} from "lucide-react";

export type SidebarNavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export type SidebarNavigationGroup = {
  name: string;
  items: SidebarNavigationItem[];
};

export const studentNavGroups: SidebarNavigationGroup[] = [
  {
    name: "Learning",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Modules", href: "/modules", icon: BookOpen },
      { name: "Playground", href: "/playground", icon: Terminal },
    ],
  },
  {
    name: "League",
    items: [
      { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
      { name: "Comms", href: "/comms", icon: Bell },
    ],
  },
  {
    name: "More",
    items: [
      { name: "Profile", href: "/profile", icon: User },
      { name: "About", href: "/about", icon: Info },
    ],
  },
];

export const adminNavGroups: SidebarNavigationGroup[] = [
  {
    name: "Teaching",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Modules", href: "/modules", icon: BookOpen },
      { name: "Playground", href: "/playground", icon: Terminal },
    ],
  },
  {
    name: "League",
    items: [
      { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
      { name: "Comms", href: "/comms", icon: Bell },
    ],
  },
  {
    name: "Manage",
    items: [
      { name: "Students", href: "/admin/users", icon: Users },
      { name: "Question bank", href: "/admin/questions", icon: FileText },
      { name: "Operations", href: "/admin/operations", icon: ClipboardCheck },
      { name: "Admin guide", href: "/admin/guide", icon: BookOpenCheck },
    ],
  },
  {
    name: "More",
    items: [{ name: "About", href: "/about", icon: Info }],
  },
];
