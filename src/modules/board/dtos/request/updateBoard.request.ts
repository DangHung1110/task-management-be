import { z } from "zod";
import { BoardVisibility } from "../../../../entities";

export const updateBoardRequestDto = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    visibility: z.nativeEnum(BoardVisibility).optional(),
})

export type UpdateBoardRequestDtoType = z.infer<typeof updateBoardRequestDto>;
export const UpdateBoardRequestSchema = updateBoardRequestDto.openapi({
    example: {
        name: "Updated Board Name",
        description: "Updated description",
        visibility: BoardVisibility.PUBLIC,
    }
});