
'use client'

import { useData } from '@/contexts/data-context'
import Link from 'next/link'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Search, Bell } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from './ui/button'
import { differenceInDays } from 'date-fns'
import { useState, useEffect } from 'react'

export function Header() {
  const { announcements } = useData()
  const [hasRecentAnnouncements, setHasRecentAnnouncements] = useState(false)

  useEffect(() => {
    const checkRecentAnnouncements = () => {
      const hasRecent = announcements.some(a => {
          const announcementDate = new Date(a.date + "T00:00:00Z");
          const today = new Date();
          // Consider announcements from the last 7 days as recent
          return differenceInDays(today, announcementDate) <= 7;
      });
      setHasRecentAnnouncements(hasRecent);
    }
    checkRecentAnnouncements();
  }, [announcements]);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card/80 px-4 backdrop-blur-sm sm:px-6 lg:p-8">
      <SidebarTrigger className="md:hidden" />

      <div className="flex-1">
        {/* Placeholder for breadcrumbs or page title */}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
          />
        </div>
        <Link href="/comunicados">
          <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              {hasRecentAnnouncements && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/90"></span>
                </span>
              )}
              <span className="sr-only">Comunicados Recentes</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}
