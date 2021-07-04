import { MegalodonInterface } from "megalodon";
import { Connection, ConnectionNotFoundError } from 'typeorm'
import { createUser, getUser } from "./model/cruds/user";
import { createTODO, finishTODO, getTODO, getTODOByMastodonStatusID, setTODOStatusID } from "./model/cruds/todo";
import { User } from "./model/entity/User";
import { TODO } from "./model/entity/TODO";
import { escapeTagFromContent, generateTodoCard } from "./utils"
import { Readable } from 'stream'


async function createTodo(connection: Connection, client: MegalodonInterface, status: Entity.Status, user: User) {
	const content = escapeTagFromContent(status.content)
	const deadLineTime = Date.now() + new Date(0, 0 ,0, 1).getTime()
	const deadLine = new Date(deadLineTime)
	const todo = await createTODO(connection, content, deadLine, user)

	const imageFile = await generateTodoCard(todo.text, false)
	const stream = Readable.from(imageFile)
	const mediaRes = await client.uploadMedia(stream)
	const media = mediaRes.data
	const res = await client.postStatus(
		`【Todoを登録しました】\n${todo.text}\n by @${todo.user.userName} #${todo.user.userName}のtodon`,
		{
			in_reply_to_id: status.id,
			visibility: status.visibility,
			media_ids: [media.id]
		}
	)
	const postedTodoStatus = res.data
	return setTODOStatusID(connection, todo, postedTodoStatus.id)
}

async function finishTodo(connection: Connection, client: MegalodonInterface, status: Entity.Status, todo: TODO) {
	await finishTODO(connection, todo)
	const imageFile = await generateTodoCard(todo.text, true)
	const stream = Readable.from(imageFile)
	const mediaRes = await client.uploadMedia(stream)
	const media = mediaRes.data
	client.deleteStatus(status.id)
	const res = await client.postStatus(
		`【Todoが完了しました】\n${todo.text}\n by @${todo.user.userName}`,
		{
			in_reply_to_id: status.id,
			visibility: status.visibility,
			media_ids: [media.id]
		}
	)
	const postedTodoStatus = res.data
	return setTODOStatusID(connection, todo, postedTodoStatus.id)
}

export async function handleStatusUpdate(connection: Connection, client: MegalodonInterface , status: Entity.Status) {
	const res = await client.verifyAccountCredentials()
	const me = res.data
	console.debug('me', me.id)

	if(
		status.account.id !== me.id
		&& status.mentions.find((mention) => (mention.id === me.id))
	) {
		console.debug('replied to me', status.in_reply_to_account_id)
		// Replyed to me
		let user: User
		try {
			user = await getUser(connection, status.account.id)
		} catch(e) {
			user = await createUser(connection, status.account.id, status.account.username)
		}

		// create todo
		createTodo(connection, client, status, user)
	}
}


export async function handleFavouriteUpdate(connection: Connection, client: MegalodonInterface, notification: Entity.Notification) {
	const res = await client.verifyAccountCredentials()
	const me = res.data

	if( !notification.status ) return

	if ( notification.status.account.id === me.id ) {
		// favourited to my status
		const todo = await getTODOByMastodonStatusID(connection, notification.status.id)

		if(!todo || todo.finished) {
			// todo not found or todo has already finished
			return 
		}

		if(notification.account.id !== todo.user.mastodonID) {
			console.debug(notification.account.id, '===', todo.user.mastodonID)
			console.error('favourited user has not match todo owner')
			return
		}
		await finishTodo(connection, client, notification.status, todo)
	}
}