import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Put,
    Request,
    UseGuards,
    UseInterceptors,
  } from '@nestjs/common';
  import { ApiSecurity, ApiTags } from '@nestjs/swagger';
  import { UsersService } from './user.service';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { UpdatePasswordDto, RenderUser } from './dto/user.dto';
  import { UpdateProfileDto } from './dto/update-profile.dto';
  import { I18nService } from 'nestjs-i18n';
  
  @ApiTags('user')
  @Controller('user')
  export class UsersController {
    constructor(
      private readonly i18n: I18nService,
      private readonly usersService: UsersService,
    ) {}
  
    @UseGuards(JwtAuthGuard)
    @ApiSecurity('access-key')
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('me')
    public async me(@Request() req) {
      return new RenderUser(req.user);
    }
  
    @UseGuards(JwtAuthGuard)
    @ApiSecurity('access-key')
    @Put('profile')
    public async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
      const updated = await this.usersService.updateProfile(dto, req.user.id);
      return updated;
    }
  
    @UseGuards(JwtAuthGuard)
    @ApiSecurity('access-key')
    @Delete('account')
    public async deleteAccount(@Request() req) {
      await this.usersService.deleteAccount(req.user.id);
      return { message: 'account_deleted' };
    }
  
    @UseGuards(JwtAuthGuard)
    @ApiSecurity('access-key')
    @UseInterceptors(ClassSerializerInterceptor)
    @Put('update/password')
    public async updatePassword(@Request() req, @Body() updatePasswordDto: UpdatePasswordDto) {
      await this.usersService.updatePassword(updatePasswordDto, req.user.id);
      return { message: 'password_update_success' };
    }
  }