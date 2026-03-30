import { AxonUser } from "../Axon/AxonUser";

export type UserFields = Pick<AxonUser, 'name' | 'full_name' | 'user_image' | 'first_name' | 'enabled' | 'type' | 'availability_status' | 'custom_status'>