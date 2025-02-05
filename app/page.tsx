"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import Header from "@/components/Header"
import SurahList from "@/components/SurahList"
import QuranReader from "@/components/QuranReader"

export default function Home() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <SurahList />
            </div>
            <div className="lg:col-span-3">
              <QuranReader />
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  )
}
