import { Injectable } from '@nestjs/common';
import { CreateWorkDto, FilterWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Work } from './entities/work.entity';
import { Model } from 'mongoose';
import { BaseService } from 'src/BaseClass/BaseService';

@Injectable()
export class WorkService extends BaseService {
  @InjectModel(Work.name)
  private workModel: Model<Work>;

  async create(createWorkDto: CreateWorkDto) {
    const { date } = createWorkDto;
    const filter = { date, deleteFlag: false };
    const existingWork = await this.workModel.findOne(filter);
    if (existingWork) {
      throw new Error('已存在相同日期的工作记录');
    }

    const createWorkItem = new this.workModel({
      ...createWorkDto,
      deleteFlag: false,
    });
    await createWorkItem.save();
    return this.resData('ok');
  }

  async findAll(filterWorkDto: FilterWorkDto) {
    const { date, status } = filterWorkDto;
    const filter: any = { deleteFlag: false };
    if (status) {
      if (status === '1' || status === '2') {
        filter.$or = [{ status }, { status: '999', progress: { $lt: 100 } }];
      } else if (status === '3') {
        filter.$or = [{ status }, { status: '999', progress: 100 }];
      } else {
        filter.status = status;
      }
    }

    if (date) {
      filter.date = { $gte: date };
    }

    const res = await this.workModel.find(filter).sort({ date: -1 });
    return this.resData(res);
  }

  async update(updateWorkDto: UpdateWorkDto) {
    const { _id, ...updateData } = updateWorkDto;
    if (updateData.status === '3') {
      updateData.progress = 100;
    }
    await this.workModel.updateOne({ _id }, updateData);
    return this.resData('ok');
  }

  async remove(_id: string) {
    await this.workModel.updateOne({ _id }, { deleteFlag: true });
    return this.resData('ok');
  }
}
