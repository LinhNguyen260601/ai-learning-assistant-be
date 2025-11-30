import { User } from "../models";
import type { UserDocument, UserEntity } from "../types";
import { excludePassword } from "../utils/excludePassword";

class UserRepository {
  public findUser = async (
    query: Partial<UserEntity>
  ): Promise<UserEntity | null> => await User.findOne(query);

  public findUserWithPassword = async (
    query: Partial<UserEntity>
  ): Promise<UserDocument | null> =>
    (await User.findOne(query).select("+password")) as UserDocument | null;

  public createUser = async (
    payload: Partial<UserEntity>
  ): Promise<Omit<UserEntity, "password">> => {
    const user = await User.create(payload);
    return excludePassword(user);
  };
}

export default new UserRepository();
