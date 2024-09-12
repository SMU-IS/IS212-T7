import UserDb from "@/database/UserDb";

class UserService {
  private userDb = new UserDb();

  public async getUser(email: string) {
    // Process business logic here
    // Retrieve from database layer
    const user = await this.userDb.getUser(email);

    return user;
  }
}

export default UserService;
