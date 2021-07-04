import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { TODO } from './TODO'

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id!: number

	@Column()
	mastodonID!: string

	@Column()
	userName!: string

	@OneToMany(() => TODO, (todo: TODO) => todo.user)
	todos!: TODO[]

}
