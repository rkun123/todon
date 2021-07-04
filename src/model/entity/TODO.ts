import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { User } from './User'

@Entity()
export class TODO {
	@PrimaryGeneratedColumn()
	id!: number

	@Column()
	text!: string

	@Column()
	deadLine!: Date

	@Column()
	finished: boolean = false

	@Column({nullable: true})
	mastodonStatusID!: string

	@ManyToOne(() => User, (user: User) => user.todos)
	user!: User
}