export class CreateWorkDto {
  date: string;
  status: string;
  progress: number;
  contentList: {
    id: number;
    content: string;
  }[];
}

export class FilterWorkDto {
  date?: string;
  status?: string;
}
