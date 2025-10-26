import { z } from "zod";
import { BoardVisibility } from "../../../../entities";

export const createBoardRequestDto = z.object({
    name: z.string(),
    description: z.string(),
    visibility: z.nativeEnum(BoardVisibility),
})

export type CreateBoardRequestDtoType = z.infer<typeof createBoardRequestDto>;

export const CreateBoardRequestSchema = createBoardRequestDto.openapi({
    example: {
        name: "Project Alpha Board",
        description: "Board for managing Project Alpha tasks",
        visibility: BoardVisibility.WORKSPACE,
    }
});