"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const pathname = usePathname();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle dark mode
  useEffect(() => {
    const isDark =
      localStorage.getItem("darkMode") === "true" ||
      (!localStorage.getItem("darkMode") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        } else {
          console.error("Failed to fetch current user");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const isActivePage = (path) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const dashboardItems = [
    {
      title: "Vue d'ensemble",
      href: "/dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      title: "Rapports",
      href: "/dashboard/reports",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];

  // Filter sites items based on user role
  const getSitesItems = () => {
    const allSitesItems = [
      {
        title: "Tous les sites",
        href: "/sites",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        ),
      },
      {
        title: "Ajouter un site",
        href: "/sites/add",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        ),
        adminOnly: true, // Restricted to admin and superadmin
      },
      {
        title: "Attribution aux conseillers",
        href: "/sites/assignments",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
        adminOnly: true, // Restricted to admin and superadmin
      },
      {
        title: "Cartographie",
        href: "/sites/map",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        ),
        adminOnly: true, // Restricted to admin and superadmin
      },
    ];

    // Filter items based on user role
    if (!currentUser) return allSitesItems;

    if (currentUser.role === "conseiller") {
      // Conseillers can only see the sites list
      return allSitesItems.filter((item) => !item.adminOnly);
    }

    // Admin and superadmin can see all items
    return allSitesItems;
  };

  const sitesItems = getSitesItems();

  const activitesItems = [
    {
      title: "Toutes les activités",
      href: "/activites",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      title: "Ajouter une activité",
      href: "/activites/add",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
    },
  ];

  const utilisateursItems = [
    {
      title: "Tous les utilisateurs",
      href: "/utilisateurs",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      title: "Ajouter un utilisateur",
      href: "/utilisateurs/add",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <svg
          className="w-6 h-6 text-gray-600 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 overflow-auto h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg
          transition-all duration-300 ease-in-out
          ${
            isMobile
              ? `${isOpen ? "translate-x-0" : "-translate-x-full"} w-80`
              : `${isCollapsed ? "w-16" : "w-80"} translate-x-0`
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div
            className={`flex items-center space-x-3 ${
              isCollapsed && !isMobile ? "justify-center" : ""
            }`}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            {(!isCollapsed || isMobile) && (
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                SuiviCluster
              </span>
            )}
          </div>

          {/* Desktop Collapse Button */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg
                className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                  isCollapsed ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 sidebar-scroll">
          <div className="space-y-6">
            {/* Dashboard Section */}
            <div>
              <h3
                className={`text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ${
                  isCollapsed && !isMobile ? "text-center" : ""
                }`}
              >
                {!isCollapsed || isMobile ? "Dashboard" : "D"}
              </h3>
              <div className="space-y-1">
                {dashboardItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={closeMobileSidebar}
                    className={`
                      flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${
                        isActivePage(item.href)
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
                      }
                      ${isCollapsed && !isMobile ? "justify-center px-2" : ""}
                    `}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    {(!isCollapsed || isMobile) && (
                      <span className="truncate">{item.title}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sites Section */}
            <div>
              <h3
                className={`text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ${
                  isCollapsed && !isMobile ? "text-center" : ""
                }`}
              >
                {!isCollapsed || isMobile ? "Sites" : "S"}
              </h3>
              <div className="space-y-1">
                {sitesItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={closeMobileSidebar}
                    className={`
                      flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${
                        isActivePage(item.href)
                          ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-r-2 border-green-600 dark:border-green-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-green-600 dark:hover:text-green-400"
                      }
                      ${isCollapsed && !isMobile ? "justify-center px-2" : ""}
                    `}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    {(!isCollapsed || isMobile) && (
                      <span className="truncate">{item.title}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Activités Section */}
            <div>
              <h3
                className={`text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ${
                  isCollapsed && !isMobile ? "text-center" : ""
                }`}
              >
                {!isCollapsed || isMobile ? "Activités" : "A"}
              </h3>
              <div className="space-y-1">
                {activitesItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={closeMobileSidebar}
                    className={`
                      flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${
                        isActivePage(item.href)
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
                      }
                      ${isCollapsed && !isMobile ? "justify-center px-2" : ""}
                    `}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    {(!isCollapsed || isMobile) && (
                      <span className="truncate">{item.title}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Utilisateurs Section - Visible seulement pour admin et superadmin */}
            {currentUser &&
              ["admin", "superadmin"].includes(currentUser.role) && (
                <div>
                  <h3
                    className={`text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ${
                      isCollapsed && !isMobile ? "text-center" : ""
                    }`}
                  >
                    {!isCollapsed || isMobile ? "Utilisateurs" : "U"}
                  </h3>
                  <div className="space-y-1">
                    {utilisateursItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        onClick={closeMobileSidebar}
                        className={`
                        flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                          isActivePage(item.href)
                            ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-r-2 border-purple-600 dark:border-purple-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400"
                        }
                        ${isCollapsed && !isMobile ? "justify-center px-2" : ""}
                      `}
                      >
                        <div className="flex-shrink-0">{item.icon}</div>
                        {(!isCollapsed || isMobile) && (
                          <span className="truncate">{item.title}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`
              w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
              ${isCollapsed && !isMobile ? "justify-center px-2" : ""}
            `}
          >
            <div className="w-5 h-5 flex-shrink-0">
              {isDarkMode ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </div>
            {(!isCollapsed || isMobile) && (
              <span>{isDarkMode ? "Mode clair" : "Mode sombre"}</span>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={async () => {
              try {
                const response = await fetch("/api/auth/logout", {
                  method: "POST",
                  credentials: "include",
                });

                if (response.ok) {
                  closeMobileSidebar();
                  // Force page reload to clear any cached state
                  window.location.href = "/login";
                } else {
                  console.error("Échec de la déconnexion");
                }
              } catch (error) {
                console.error("Erreur lors de la déconnexion:", error);
              }
            }}
            className={`
              w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors
              ${isCollapsed && !isMobile ? "justify-center px-2" : ""}
            `}
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {(!isCollapsed || isMobile) && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
