import { createAPIFileRoute } from '@tanstack/react-start/api'
import * as fs from 'node:fs/promises'
import path from 'node:path'

export const APIRoute = createAPIFileRoute('/api/files/$year/$month/$day')({
  DELETE: async ({ params }) => {
    const { year, month, day } = params
    const dir = path.join(process.env.PERSON_FOLDER || './', year, month, day)
    try {
      await fs.rm(dir, { recursive: true, force: true })
      return new Response(null, { status: 204 })
    } catch {
      return new Response('Failed to delete', { status: 500 })
    }
  },
})
