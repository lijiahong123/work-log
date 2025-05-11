import { Controller, Get, Post, Body, Delete, Query } from '@nestjs/common';
import { WorkService } from './work.service';
import { CreateWorkDto, FilterWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import {
  getFirstDayOfWeek,
  getFirstMonthDay,
  getFirstQuarterDay,
  getFirstYearDay,
} from 'src/utils';

@Controller('work')
export class WorkController {
  constructor(private readonly workService: WorkService) {}

  getDate(dateType: string) {
    const typeMap = {
      1: getFirstDayOfWeek(), // 本周第一天
      2: getFirstMonthDay(),
      3: getFirstQuarterDay(),
      4: getFirstYearDay(),
    };

    return typeMap[dateType];
  }

  @Post('create')
  create(@Body() createWorkDto: CreateWorkDto) {
    return this.workService.create(createWorkDto);
  }

  @Get('list')
  findAll(@Query('date') date?: string, @Query('status') status?: string) {
    const filterWorkDto: FilterWorkDto = {};
    if (date) {
      filterWorkDto.date = this.getDate(date);
    }
    if (status) {
      filterWorkDto.status = status;
    }
    return this.workService.findAll(filterWorkDto);
  }

  @Post('update')
  update(@Body() updateWorkDto: UpdateWorkDto) {
    return this.workService.update(updateWorkDto);
  }

  @Delete('delete')
  remove(@Body('_id') id: string) {
    return this.workService.remove(id);
  }
}
