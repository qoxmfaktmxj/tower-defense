import { Controller, Get, Inject, Param } from "@nestjs/common";
import { NoticesService } from "./notices.service";

@Controller("notices")
export class NoticesController {
  constructor(@Inject(NoticesService) private readonly noticesService: NoticesService) {}

  @Get()
  findAll() {
    return this.noticesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.noticesService.findOne(id);
  }
}
