import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Types } from 'aws-sdk/clients/s3'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
const AWS_Xray = require('aws-xray-sdk')
const XrAWS = AWS_Xray.captureAWS(AWS)

export class ToDoAccess {
  constructor(
    private readonly docClient: DocumentClient = new XrAWS.DynamoDB.DocumentClient(),
    private readonly s3Client: Types = new XrAWS.S3({
      signatureVersion: 'v4'
    }),
    private readonly myTabel = process.env.TODOS_TABLE,
    private readonly myBucket = process.env.S3_BUCKET_NAME
  ) {}

  async getTodo(userId: string): Promise<TodoItem[]> {
    const params = {
      TableName: this.myTabel,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeNames: {
        userId: 'userId'
      },
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }

    const result = await this.docClient.query(params).promise()
    console.log(result)
    const items = result.Items

    return items as TodoItem[]
  }

  async createToDo(todoItem: TodoItem): Promise<TodoItem> {
    const params = {
      TableName: this.myTabel,
      Item: todoItem
    }
    const result = await this.docClient.put(params).promise()
    console.log(result)
    return todoItem as TodoItem
  }

  async updateToDo(
    todoUpdate: TodoUpdate,
    todoId: string,
    userId: string
  ): Promise<TodoUpdate> {
    const params = {
      TableName: this.myTabel,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: 'set name = :name, dueDate = :duedate, done = :done',
      ExpressionAttributeNames: {
        name: 'name',
        dueDate: 'dueDate',
        done: 'done'
      },
      ExpressionAttributeValues: {
        ':name': todoUpdate['name'],
        ':dueDate': todoUpdate['dueDate'],
        ':done': todoUpdate['done']
      },
      ReturnValues: 'NEW_ToDo'
    }

    const result = await this.docClient.update(params).promise()
    const updated = result.Attributes

    return updated as TodoUpdate
  }

  async deleteToDo(todoId: string, userId: string): Promise<string> {
    const params = {
      TableName: this.myTabel,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }
    const result = await this.docClient.delete(params).promise()
    console.log(result)

    return ''
  }

  async generateUploadUrl(todoId: string): Promise<string> {
    const url = this.s3Client.getSignedUrl('putObject', {
      Bucket: this.myBucket,
      Key: todoId,
      Expires: 2000
    })
    console.log(url)

    return url
  }
}
