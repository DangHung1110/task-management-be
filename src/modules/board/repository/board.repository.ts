import { Repository, DataSource, SelectQueryBuilder } from "typeorm";
import { Board, BoardMember, BoardMemberRole } from "../../../entities";
import { PaginationDto, paginationUtils } from "../../../common";

export class BoardRepo {
    private repo: Repository<Board>;
    private boardMemberRepo: Repository<BoardMember>;
    private pagination: paginationUtils;

    constructor(ds: DataSource) {
        this.repo = ds.getRepository(Board);
        this.boardMemberRepo = ds.getRepository(BoardMember);
        this.pagination = new paginationUtils();
    }

    async getBoards(pagination: PaginationDto, userId?: string, workspaceId?: string, search?: string): Promise<{
        boards: Board[];
        pagination: PaginationDto;
    }> {
        const { skip, take } = this.pagination.extractTakeSkip(pagination);
        const query = this.repo.createQueryBuilder("board")
            .leftJoinAndSelect("board.workspace", "workspace")
            .leftJoinAndSelect("board.owner", "owner")
            .leftJoinAndSelect("board.members", "members")
            .leftJoinAndSelect("members.user", "memberUser")
            .skip(skip)
            .take(take)
            .where("board.isActive = :isActive", { isActive: true });

        if (workspaceId) {
            query.andWhere("board.workspaceId = :workspaceId", { workspaceId });
        }

        if (userId) {
            query.andWhere(`
        (board.visibility = 'public')
            OR (
      board.visibility = 'workspace'
      AND EXISTS (
        SELECT 1
        FROM workspace_members wm
        WHERE wm."workspaceId" = board."workspaceId"
          AND wm."userId" = :userId
          AND wm."isActive" = true
      )
    )
    OR (
      board.visibility = 'private'
      AND EXISTS (
        SELECT 1
        FROM board_members bm
        WHERE bm."boardId" = board."id"
          AND bm."userId" = :userId
          AND bm."isActive" = true
      )
    )
  `, { userId });
        } else {
            query.andWhere("board.visibility = 'public'");
        }


        if (search) {
            query.andWhere(
                "board.name ILIKE :search OR board.description ILIKE :search",
                { search: `%${search}%` }
            );
        }

        const [boards, total] = await query.getManyAndCount();
        const paginationInfo = this.pagination.convertToPaginationDto(total);
        return {
            boards,
            pagination: paginationInfo,
        };
    }

    async findBoardById(id: string): Promise<Board | null> {
        return this.repo.findOne({
            where: { id, isActive: true },
            relations: ["workspace", "owner", "members", "members.user", "lists"],
        });
    }

    async createBoard(data: Partial<Board>, ownerId: string): Promise<Board> {
        const board = this.repo.create({
            ...data,
            ownerId,
        });
        const savedBoard = await this.repo.save(board);

        const boardMember = this.boardMemberRepo.create({
            boardId: savedBoard.id,
            userId: ownerId,
            role: BoardMemberRole.OWNER,
        });
        await this.boardMemberRepo.save(boardMember);

        return this.findBoardById(savedBoard.id) as Promise<Board>;
    }

    async updateBoard(id: string, data: Partial<Board>): Promise<void> {
        await this.repo.update(id, data);
    }

    async softDeleteBoard(id: string): Promise<void> {
        await this.repo.update(id, { isActive: false, isClosed: true, closedAt: new Date() });
    }

    async hardDeleteBoard(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    async restoreBoard(id: string): Promise<void> {
        await this.repo.update(id, { isActive: true, isClosed: false, closedAt: null });
    }
}