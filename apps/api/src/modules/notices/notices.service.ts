import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

const noticeCategoryLabel = {
  UPDATE: "업데이트",
  MAINTENANCE: "점검",
  EVENT: "이벤트"
} as const;

@Injectable()
export class NoticesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findAll() {
    const notices = await this.prisma.notice.findMany({
      where: {
        isPublished: true
      },
      orderBy: {
        publishedAt: "desc"
      }
    });

    return notices.map((notice) => ({
      id: notice.id,
      title: notice.title,
      summary: notice.summary,
      body: notice.body,
      category: noticeCategoryLabel[notice.category],
      publishedAt: notice.publishedAt?.toISOString() ?? notice.createdAt.toISOString()
    }));
  }

  async findOne(id: string) {
    const notice = await this.prisma.notice.findUnique({
      where: {
        id
      }
    });
    if (!notice) {
      throw new NotFoundException("공지 정보를 찾을 수 없습니다.");
    }

    return {
      id: notice.id,
      title: notice.title,
      summary: notice.summary,
      body: notice.body,
      category: noticeCategoryLabel[notice.category],
      publishedAt: notice.publishedAt?.toISOString() ?? notice.createdAt.toISOString()
    };
  }
}
