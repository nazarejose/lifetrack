import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {UsersService} from "../user/user.service";
import {JwtService} from "@nestjs/jwt";
import {CreateUserDto, LoginUserDto} from "../user/dto/user.dto";
import {JwtPayload} from "./jwt.strategy";
import {PrismaService} from "../../prisma.service";
import {User} from '@prisma/client'
import {hash} from "bcrypt";
// import {User} from "../users/user.entity";

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
    ) {}

    async register(userDto: CreateUserDto): Promise<RegistrationStatus> {
        try {
            
            const user = await this.usersService.create(userDto);
            const token = this._createToken(user);

            return {
                success: true,
                message: "ACCOUNT_CREATE_SUCCESS",
                data: user,
                accessToken: token.accessToken,
                expiresIn: token.expiresIn
            };
        } catch (err) {
            return {
                success: false,
                message: err.message || "Erro ao criar conta",
            };
        }
    }

    async login(loginUserDto: LoginUserDto): Promise<any> {
        const user = await this.usersService.findByLogin(loginUserDto);
        const token = this._createToken(user);
        return {
            ...token,
            data: user
        };
    }

    private _createToken(user: Omit<User, 'password'>): any {
    
    const payload = { email: user.email }; 
    
    const token = this.jwtService.sign(payload);

    return {
        expiresIn: process.env.EXPIRESIN || '7d',
        accessToken: token, 
    };
}

    async validateUser(payload: JwtPayload): Promise<any> {
        const user = await this.usersService.findByPayload(payload);
        if (!user) {
            throw new HttpException("INVALID_TOKEN", 
               HttpStatus.UNAUTHORIZED);
        }
        return user;
    }
}

export interface RegistrationStatus{
    success: boolean;
    message: string;
    data?: User;
    accessToken?: string;
    expiresIn?: string;
}
export interface RegistrationSeederStatus {
    success: boolean;
    message: string;
    data?: User[];
    accessToken?: string;
    expiresIn?: string;
}