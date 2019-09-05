import { STATUS_TYPE } from "../interfaces";

export function logStatusFileMessage(status: STATUS_TYPE, file: string, functionName: string, message: any): void {
    console.log(`${status} : ${file} : ${message}`)
}