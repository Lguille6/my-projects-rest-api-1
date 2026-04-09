import { Hono } from 'hono'
import { listProjects, getProjectById } from '../data/store.js'
import { ApiError } from '../utils/errors.js'
import { sendCollection, sendResource } from '../utils/response.js'
import { parseIdParam } from '../utils/validations.js'

const projects = new Hono()

projects.get('/', (c) => {
  const data = listProjects()
  return sendCollection(c, data)
})

projects.get('/:id', (c) => {
  const projectId = parseIdParam(c.req.param('id'))
  const project = getProjectById(projectId)

  if (!project) {
    throw new ApiError(404, 'NOT_FOUND', 'Project not found.')
  }

  return sendResource(c, project)
})

export default projects
