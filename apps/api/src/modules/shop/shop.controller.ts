import { Controller, Get, Inject } from "@nestjs/common";
import { ShopService } from "./shop.service";

@Controller("shop")
export class ShopController {
  constructor(@Inject(ShopService) private readonly shopService: ShopService) {}

  @Get("products")
  findAll() {
    return this.shopService.findAll();
  }
}
