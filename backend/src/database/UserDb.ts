import User from "@/entities/User";

class UserDb {
  public async getUser(email: string) {
    const user = await User.findOne({ email });
    return user;
  }
}

export default UserDb;
