"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { 
  Calculator, 
  Users, 
  Package, 
  FileText, 
  CreditCard,
  Menu,
  ChevronLeft
} from "lucide-react";

const navigation = [
  { name: "Billing", href: "/", icon: Calculator },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Products", href: "/products", icon: Package },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavItem = ({ item }: { item: { name: string; href: string; icon: React.ComponentType<{ className?: string }> } }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    
    return (
      <div className="relative group">
        <Link
          href={item.href}
          className={`
            flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors
            ${isActive
              ? "bg-[var(--secondary)] text-[var(--secondary-foreground)]"
              : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)]"
            }
            ${isCollapsed && "justify-center px-2"}
          `}
        >
          <Icon className={`h-4 w-4 ${!isCollapsed && "mr-3"}`} />
          {!isCollapsed && <span>{item.name}</span>}
        </Link>
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--foreground)] text-[var(--background)] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {item.name}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--background)] rounded-md shadow-md border border-[var(--border)]"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div
        className={`
          fixed inset-y-0 z-20 flex flex-col bg-[var(--background)] transition-all duration-300 ease-in-out lg:static border-r border-[var(--border)]
          ${isCollapsed ? "w-[72px]" : "w-72"}
          ${isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="border-b border-[var(--border)]">
          <div
            className={`
              flex h-16 items-center gap-2 px-4
              ${isCollapsed && "justify-center px-2"}
            `}
          >
            {!isCollapsed && (
              <Link href="/" className="flex items-center font-semibold">
                <span className="text-lg">AquaZone Billing</span>
              </Link>
            )}
            <button
              className={`ml-auto h-8 w-8 p-1 rounded-md hover:bg-[var(--muted)] transition-colors ${isCollapsed && "ml-0"}`}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft
                className={`h-4 w-4 transition-transform ${
                  isCollapsed && "rotate-180"
                }`}
              />
              <span className="sr-only">
                {isCollapsed ? "Expand" : "Collapse"} Sidebar
              </span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
