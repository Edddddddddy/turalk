/* global console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const forums = [
  {
    description: '日常闲聊、版本体验、活动吐槽和社区公告相关讨论。',
    name: '综合讨论',
    position: 10,
    slug: 'general',
  },
  {
    description: '配队、养成、关卡、活动机制与效率研究。',
    name: '攻略研究',
    position: 20,
    slug: 'guides',
  },
  {
    description: '角色塑造、剧情文本、世界观和考据向长帖。',
    name: '剧情与角色',
    position: 30,
    slug: 'story-characters',
  },
  {
    description: '同人图文、二创灵感、周边和创作交流。',
    name: '同人创作',
    position: 40,
    slug: 'fanworks',
  },
];

for (const forum of forums) {
  await prisma.forum.upsert({
    create: forum,
    update: {
      description: forum.description,
      isActive: true,
      name: forum.name,
      position: forum.position,
    },
    where: { slug: forum.slug },
  });
}

console.log(`Seeded ${forums.length} default forums.`);
await prisma.$disconnect();
