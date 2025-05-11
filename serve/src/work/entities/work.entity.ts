import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WorkDocument = HydratedDocument<Work>;
export type contentItem = {
  id: number;
  content: string;
};

@Schema()
export class Work {
  @Prop()
  id: number;

  @Prop()
  date: string;

  @Prop()
  status: string;

  @Prop()
  progress: number;

  @Prop()
  contentList: contentItem[];

  @Prop({ default: false })
  deleteFlag: boolean;
}

export const WorkSchema = SchemaFactory.createForClass(Work);
