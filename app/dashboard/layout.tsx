"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen bg-bg-base overflow-hidden">
      {/* Ambient glass background */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>
      <div className="absolute inset-0 ambient-grid opacity-[0.15]" />

      <Sidebar />
      {/* Main area container wraps the sub-page */}
      <div className="relative z-10 flex flex-1 flex-col overflow-auto px-6 py-8 md:px-10">
        {children}
      </div>
    </div>
  );
}
