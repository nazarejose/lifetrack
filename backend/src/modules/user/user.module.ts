import { Module } from '@nestjs/common';
import {UsersService} from "./user.service";
import {UsersController} from "./user.controller";
import {PrismaService} from "../../prisma.service";

@Module({
    imports: [
      
    ],
    exports: [UsersService, PrismaService],
    controllers: [UsersController],
    providers: [UsersService, PrismaService]
})
export class UsersModule {}