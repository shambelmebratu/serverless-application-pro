import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

const logger = createLogger('todos-BusinessLogic')
const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function createTodo(
  CreateTodoRequest: CreateTodoRequest,
  userId: string
) {
  logger.info('Creat an item')
  const itemId = uuid.v4()
  const todoItem: TodoItem = {
    userId,
    createdAt: new Date().toISOString(),
    todoId: itemId,
    done: false,
    attachmentUrl: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${itemId}`,
    ...CreateTodoRequest
  }

  await todosAccess.createTodo(todoItem, userId)
  return todoItem
}

export async function deleteTodo(todoId: string, userId: string) {
  const todoExists = await todosAccess.getTodo(todoId, userId)
  if (!todoExists) {
    logger.warn('Failed to delete')
    throw createError(404, "item doesn't exist!")
  }
  return await todosAccess.deleteTodo(todoId, userId)
}

export async function updateTodo(
  UpdateTodoRequest: UpdateTodoRequest,
  todoId: string,
  userId: string
) {
  const todoExists = await todosAccess.getTodo(todoId, userId)
  if (!todoExists) {
    logger.warn('Failed to update')
    throw createError(404, "item doesn't exist")
  }
  return await todosAccess.updateTodo(todoId, userId, UpdateTodoRequest)
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  const todos = await todosAccess.getAllTodos(userId)
  return todos
}

export async function createAttachmentPresignedUrl(todoId: string, userId: string) {
  logger.info(`Get presigned url ${todoId} for user ${userId}`)
  return attachmentUtils.getPresignedUploadURL(todoId)
}