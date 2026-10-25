import { PageActions } from '@repo/lib'
import { NextRequest, NextResponse } from 'next/server'
import { UpdatePageData } from '@repo/types/page'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const page = await PageActions.getPage(slug)
    return NextResponse.json(page)
  } catch {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body: UpdatePageData = await request.json()

  try {
    const page = await PageActions.updatePage(slug, body)
    return NextResponse.json(page)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update page'
    const status = message === 'Page not found' ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  await PageActions.deletePage(slug)
  return NextResponse.json({ message: 'Page deleted successfully' })
}
