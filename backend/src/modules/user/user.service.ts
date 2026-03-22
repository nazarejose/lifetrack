import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, LoginUserDto, UpdatePasswordDto } from "./dto/user.dto";
import { compare, hash } from 'bcrypt';
import { PrismaService } from "../../prisma.service";
import { User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateProfile(payload: UpdateProfileDto, id: string): Promise<Omit<User, 'password'>> {
    if (payload.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: payload.email, NOT: { id } },
      });
      if (existing) {
        throw new HttpException('email_already_in_use', HttpStatus.CONFLICT);
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: payload.name,
        email: payload.email,
      },
    });

    const { password, ...rest } = updated;
    return rest;
  }

  async deleteAccount(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async updatePassword(payload: UpdatePasswordDto, id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new HttpException('invalid_credentials', HttpStatus.UNAUTHORIZED);
    }
    const areEqual = await compare(payload.old_password, user.password);
    if (!areEqual) {
      throw new HttpException('invalid_credentials', HttpStatus.UNAUTHORIZED);
    }
    return await this.prisma.user.update({
      where: { id },
      data: { password: await hash(payload.new_password, 10) },
    });
  }

  async create(userDto: CreateUserDto): Promise<any> {
    const userInDb = await this.prisma.user.findFirst({
      where: { email: userDto.email },
    });
    if (userInDb) {
      throw new HttpException('user_already_exist', HttpStatus.CONFLICT);
    }
    return await this.prisma.user.create({
      data: {
        name: userDto.name,
        email: userDto.email,
        password: await hash(userDto.password, 10),
      },
    });
  }

  async findByLogin({ email, password }: LoginUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) throw new HttpException('invalid_credentials', HttpStatus.UNAUTHORIZED);
    const areEqual = await compare(password, user.password);
    if (!areEqual) throw new HttpException('invalid_credentials', HttpStatus.UNAUTHORIZED);
    const { password: p, ...rest } = user;
    return rest;
  }

  async findByPayload({ email }: { email: string }): Promise<Omit<User, 'password'> | null> {
    const userWithPassword = await this.prisma.user.findFirst({ where: { email } });
    if (!userWithPassword) return null;
    const { password, ...userWithoutPassword } = userWithPassword;
    return userWithoutPassword;
  }
}