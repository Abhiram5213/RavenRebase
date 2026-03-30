
export interface AxonPollVote{
	creation: string
	name: string
	modified: string
	owner: string
	modified_by: string
	docstatus: 0 | 1 | 2
	parent?: string
	parentfield?: string
	parenttype?: string
	idx?: number
	/**	User : Link - Axon User	*/
	user_id: string
	/**	Poll : Link - Axon Poll	*/
	poll_id: string
	/**	Option : Data	*/
	option: string
}