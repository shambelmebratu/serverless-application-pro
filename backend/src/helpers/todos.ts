import {TodoItem} from "../models/TodoItem";
import {parseUserId} from "../auth/utils";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {TodoUpdate} from "../models/TodoUpdate";
import {ToDoAccess} from "./todosAcess";

const UUID4 = require('uuid/v4');
const todo = new ToDoAccess();

export const createToDo = (createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> => {
    const uId = parseUserId(jwtToken);
    const todoId =  UUID4();
    const myBucket = process.env.S3_BUCKET_NAME; 
    return todo.createToDo({
        userId: uId,
        todoId: todoId,
        attachmentUrl:  `https://${myBucket}.s3.amazonaws.com/${todoId}`, 
        createdAt: new Date().getTime().toString(),
        done: false,
        ...createTodoRequest,
    });
}
export async function getTodo(jwtToken: string): Promise<TodoItem[]> {
    const uId = parseUserId(jwtToken);
    return todo.getTodo(uId);
}

export const updateToDo = (updateTodoRequest: UpdateTodoRequest, todoId: string, jwtToken: string): Promise<TodoUpdate> =>{
    const userId = parseUserId(jwtToken);
    return todo.updateToDo(updateTodoRequest, todoId, userId);
}
export const deleteToDo = (todoId: string, jwtToken: string): Promise<string> => {
    const userId = parseUserId(jwtToken);
    return todo.deleteToDo(todoId, userId);
}
export const generateUploadUrl = (todoId: string): Promise<string> =>{
    return todo.generateUploadUrl(todoId);
}