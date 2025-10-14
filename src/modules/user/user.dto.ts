import {IsNotEmpty} from '@nestjs/class-validator';

import {ApiProperty} from "@nestjs/swagger";
export class LoginUserDto {
    @ApiProperty()
    @IsNotEmpty() readonly email: string;

    @ApiProperty()
    @IsNotEmpty() readonly password: string;
}
export class CreateUserDto {
    @IsNotEmpty()
    @ApiProperty() name: string;
    @IsNotEmpty()
    @ApiProperty() email: string;

    @ApiProperty()
    @IsNotEmpty() password: string;

}
export class UpdatePasswordDto {

    @IsNotEmpty()
    @ApiProperty() new_password: string;

    @IsNotEmpty()
    @ApiProperty() old_password: string;

}

export class RenderUser {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    createdAt: Date;

    constructor(user: any) {
        this.id = user.id;
        this.name = user.name;
        this.email = user.email;
        this.createdAt = user.createdAt;
    }
}