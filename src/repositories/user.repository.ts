import { User } from "../models";
import type { UserEntity } from "../types";

class UserRepository {
  public findUser = async (
    query: Partial<UserEntity>
  ): Promise<UserEntity | null> => await User.findOne(query);

  public createUser = async (
    payload: Partial<UserEntity>
  ): Promise<UserEntity> => await User.create(payload);
}

export default new UserRepository();
