"use client"

import { ConfigProvider } from "antd"

/** Tema antd mengikuti warna brand (hijau), bukan biru bawaan antd. */
export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#16a34a",
          colorLink: "#15803d",
          fontFamily: "inherit",
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}
