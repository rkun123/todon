import { Connection, getRepository } from 'typeorm'
import { TODO } from '../entity/TODO'
import { User } from '../entity/User'


export async function createTODO(connection: Connection, text: string, deadLine: Date, user: User) {
	const todoRepository = getRepository(TODO)
	const todo = new TODO()
	todo.text = text
	todo.deadLine = deadLine
	todo.user = user

	return await todoRepository.save(todo)
}

export async function getTODO(connection: Connection, id: number) {
	const todoRepository = getRepository(TODO)
	const todo = await todoRepository.findOne({ 'id': id }, { 'relations': ['user']})
	if(!todo) {
		throw Error('That todo not found')
	}
	return todo
}

export async function getTODOByMastodonStatusID(connection: Connection, mastodonStatusID: string) {
	const todoRepository = getRepository(TODO)
	const todo = await todoRepository.findOne({ mastodonStatusID: mastodonStatusID}, { relations: ['user']})
	console.debug('todo', todo)
	if(!todo) {
		throw Error('That todo not found')
	}
	return todo
}

export async function setTODOStatusID(connection: Connection, todo: TODO, mastodonStatusID: string) {
	const todoRepository = getRepository(TODO)
	todo.mastodonStatusID = mastodonStatusID
	return todoRepository.save(todo)
}

export async function finishTODO(connection: Connection, todo: TODO) {
	const todoRepository = getRepository(TODO)
	todo.finished = true
	return todoRepository.save(todo)
}