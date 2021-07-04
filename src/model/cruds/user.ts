import { Connection, getRepository } from 'typeorm'
import { User } from '../entity/User'

export async function createUser(connection: Connection, mastodonID: string, userName: string) {
	const userRepository = getRepository(User)
	const user = new User()
	user.mastodonID = mastodonID
	user.userName = userName

	return await userRepository.save(user)
}

export async function getUser(connection: Connection, mastodonID: string) {
	const userRepository = getRepository(User)
	const user = await userRepository.findOne({ 'mastodonID': mastodonID })
	if(!user) {
		throw Error('That user not found')
	}
	return user
}