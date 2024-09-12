import UserService from "@/services/UserService";

class UserController {
  private userService = new UserService();

  public async getUser(ctx: any) {
    const { email } = ctx.request.body;
    const result = await this.userService.getUser(email);
    ctx.body = result;
  }
}

export default new UserController();
