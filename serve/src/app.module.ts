import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { WorkModule } from './work/work.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CatchEverythingFilter } from './http-filter/http-filter.filter';

@Module({
  imports: [
    WorkModule,
    MongooseModule.forRoot('mongodb://localhost:27017/work-db'),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
  ],
})
export class AppModule {}
