import { PageActions } from '@repo/lib'
import { NextRequest, NextResponse } from 'next/server'
import { CreatePageData } from '@repo/types/page'

export async function GET() {
  const pages = await PageActions.getAllPages()
  return NextResponse.json(pages)
}

export async function POST(request: NextRequest) {
  const body: CreatePageData = await request.json()

  try {
    const page = await PageActions.createPage(body)
    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create page'
    const status = message === 'A page with this slug already exists' ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
