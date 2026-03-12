import { Inject, Injectable } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class UsersService {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  async getMe() {
    return this.authService.getSession();
  }
}
