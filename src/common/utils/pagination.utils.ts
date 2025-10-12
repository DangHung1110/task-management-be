import { PaginationDto } from "../dtos";

export class paginationUtils {
    skip: number = 0;
    take: number = 0;

    extractTakeSkip(pagination: PaginationDto): this {
        this.skip = (pagination.page - 1) * pagination.limit;
        this.take = pagination.limit;
        return this;
    }

    convertToPaginationDto(total: number): PaginationDto {
        const paginationDto = new PaginationDto();
        paginationDto.page = Math.floor(this.skip / this.take) + 1;
        paginationDto.limit = this.take;
        paginationDto.total = total;
        return paginationDto;
    }
}