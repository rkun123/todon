import generator, { Entity, Response } from 'megalodon'
import "reflect-metadata";
import {Connection, createConnection} from "typeorm";
import { handleFavouriteUpdate, handleStatusUpdate } from './handler';
import { config as dotenvConfig } from 'dotenv'

dotenvConfig()

const BASE_URL: string = process.env['BASE_URL'] || ''
const ACCESS_TOKEN: string = process.env['ACCESS_TOKEN'] || ''

const client = generator('mastodon', BASE_URL, ACCESS_TOKEN)
const stream = client.userSocket()

async function start(connection: Connection) {
	const res = await client.getInstance()
	
	stream.on('connect', () => {
		console.log('Connected WS')
	})

	stream.on('update', (status: Entity.Status) => {
		console.log(status)
		handleStatusUpdate(connection, client, status)
	})

	stream.on('notification', (notification: Entity.Notification) => {
		console.log(notification)
		if (notification.type === 'favourite') handleFavouriteUpdate(connection, client, notification)
	})
}


createConnection().then(async connection => {
	console.log(`Connected to ${connection.name}`)
	start(connection)
}).catch(error => console.log(error));