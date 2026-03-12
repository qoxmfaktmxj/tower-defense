import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ShopService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findAll() {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return products.map((product) => ({
      id: product.id,
      code: product.code,
      name: product.name,
      description: product.description,
      price: product.price,
      currencyType: product.currencyType,
      badge: product.badge ?? undefined
    }));
  }
}
