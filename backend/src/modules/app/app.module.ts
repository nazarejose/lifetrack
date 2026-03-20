import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { I18nJsonLoader, I18nModule, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';
import { HabitsModule } from '../habits/habits.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { GoalsModule } from '../goals/goals.module';


@Module({
  imports: [
    AuthModule,
    UsersModule,
    HabitsModule,
    TransactionsModule,
    GoalsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'pt',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: join(process.cwd(), 'i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
      ],
    }),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
