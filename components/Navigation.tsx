"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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

  return (
    <nav className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-base font-semibold text-gray-900">Enterprise Billing</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <Menu className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 px-2 py-3">
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    group flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium rounded-md transition-colors relative
                    ${isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon 
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                    }`} 
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                  {isCollapsed && isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
