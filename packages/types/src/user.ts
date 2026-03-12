export type UserEntity = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export type User = Omit<UserEntity, 'password'>;

export type UpdateUserData = Pick<User, 'firstName' | 'lastName'>;

export type CreateUser = Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt' | 'email'> & { username: string; };
