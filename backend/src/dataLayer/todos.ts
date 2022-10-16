import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk'

import { TodoItem } from '../models/todos/TodoItem'
import { TodoUpdate } from '../models/todos/TodoUpdate'
import { createLogger } from '../utils/logger'

const logger = createLogger('todosAccess')

const XAWS = AWSXRay.captureAWS(AWS)

const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const todosByUserIndex = process.env.TODOS_BY_USER_INDEX

export async function getTodoItems(todoId: string): Promise<boolean> {
  const item = await this.getTodoItem(todoId)
  return !!item
}

export async function getTodosByUserId(userId: string): Promise<TodoItem[]> {
  logger.info(`Getting all todos for user ${userId} from ${this.todosTable}`)

  const result = await docClient
    .query({
      TableName: todosTable,
      IndexName: todosByUserIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()

  const items = result.Items

  logger.info(`All todos for user ${userId} were fetched`)

  return items as TodoItem[]
}

export async function getTodoItem(todoId: string): Promise<TodoItem> {
  const result = await this.docClient
    .get({
      TableName: todosTable,
      Key: {
        todoId
      }
    })
    .promise()

  const item = result.Item

 

  return item as TodoItem
}

export async function createTodoItem(todoItem: TodoItem): Promise<void> {
  logger.info(`Putting todo ${todoItem.todoId} into ${this.todosTable}`)
  await docClient
    .put({
      TableName: todosTable,
      Item: todoItem
    })
    .promise()

  logger.info(`Todo item ${todoItem.todoId} was created`)
}

export async function updateTodoItem(
  todoId: string,
  todoUpdate: TodoUpdate
): Promise<void> {
  logger.info(`Updating todo item ${todoId} in ${this.todosTable}`)

  await docClient
    .update({
      TableName: todosTable,
      Key: {
        todoId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': todoUpdate.name,
        ':dueDate': todoUpdate.dueDate,
        ':done': todoUpdate.done
      }
    })
    .promise()

  logger.info(`Todo item ${todoId} was updated`)
}

export async function deleteTodoItem(todoId: string): Promise<void> {
  logger.info(`Deleting todo item ${todoId} from ${this.todosTable}`)
  await docClient
    .delete({
      TableName: todosTable,
      Key: {
        todoId
      }
    })
    .promise()

  logger.info(`Todo item ${todoId} deleted!`)
}

export async function updateAttachmentUrl(
  todoId: string,
  attachmentUrl: string
): Promise<void> {
  logger.info(`Updating attachment URL for todo ${todoId} in ${this.todosTable}`)
  await docClient
    .update({
      TableName: todosTable,
      Key: {
        todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    })
    .promise()

  logger.info(`Attachment URL for todo ${todoId} was updated`)
}
