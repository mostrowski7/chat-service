import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginationDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  page = 1;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  itemsPerPage = 10;

  @IsString()
  @IsOptional()
  search?: string;
}
