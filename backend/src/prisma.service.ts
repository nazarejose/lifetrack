import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Configuramos o Pool de conexão do driver 'pg'
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    
    // Criamos o adaptador do Prisma para usar esse pool
    const adapter = new PrismaPg(pool);

    // Passamos o adaptador para o PrismaClient
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}