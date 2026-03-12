import { NextResponse } from "next/server"

import type { HomeStatusResponse } from "@/features/home/types/home.types"

export async function GET() {
  const payload: HomeStatusResponse = {
    success: true,
    data: {
      message: "Infrastructure layer ready.",
      updatedAt: new Date().toISOString(),
    },
  }

  return NextResponse.json(payload)
}
