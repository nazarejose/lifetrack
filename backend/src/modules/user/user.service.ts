import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {CreateUserDto, LoginUserDto, UpdatePasswordDto} from "./user.dto";
import {compare, hash} from 'bcrypt'
import {PrismaService} from "../../prisma.service";
import {User} from '@prisma/client'

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
    ) {
    }

    async updatePassword(payload: UpdatePasswordDto, id: string): 
      Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: {id}
        });
        if (!user) {
            throw new HttpException("invalid_credentials",  
                HttpStatus.UNAUTHORIZED);
        }
        const areEqual = await compare(payload.old_password,
                                  user.password);
        if (!areEqual) {
            throw new HttpException("invalid_credentials", 
               HttpStatus.UNAUTHORIZED);
        }
        return await this.prisma.user.update({
            where: {id},
            data: {password:  await hash(payload.new_password, 10)}
        });
    }
    async create(userDto: CreateUserDto): Promise<any> {

        const userInDb = await this.prisma.user.findFirst({
            where: {email: userDto.email}
        });
        if (userInDb) {
            throw new HttpException("user_already_exist", 
               HttpStatus.CONFLICT);
        }
        return await this.prisma.user.create({
        data: {
            name: userDto.name,
            email: userDto.email,
            password: await hash(userDto.password, 10)
        }
    });
    }
    
    async findByLogin({ email, password }: LoginUserDto): Promise<Omit<User, 'password'>> {
        const user = await this.prisma.user.findFirst({
            where: { email }
        });

        if (!user) {
            throw new HttpException("invalid_credentials", HttpStatus.UNAUTHORIZED)
        }

        const areEqual = await compare(password, user.password)

        if (!areEqual) {
            throw new HttpException("invalid_credentials", HttpStatus.UNAUTHORIZED)
        }

        const { password: p, ...rest } = user
        return rest
    }

    async findByPayload({ email }: { email: string }): Promise<Omit<User, 'password'> | null> {
    const userWithPassword = await this.prisma.user.findFirst({
        where: { email }
    });

    if (!userWithPassword) {
        return null;
    }

    const { password, ...userWithoutPassword } = userWithPassword;
    
    return userWithoutPassword;
}

}