import { Request, Response, NextFunction } from "express";
import { ForbiddenException, UnauthorizedException } from "../exceptions";
import { AppDataSource } from "../../config";
import { BoardMember, List, Card } from "../../entities";

export const checkListBoardPermission = () => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = req?.user;
			const listId = (req.params as any).id || (req.params as any).listId || (req.body as any).firstListId || (req.body as any).secondListId;

			if (!user) {
				throw new UnauthorizedException("User not authenticated");
			}

			if (!listId) {
				throw new ForbiddenException("List ID is required");
			}

			const isSystemAdmin = (user as any).roles?.includes("admin");
			if (isSystemAdmin) {
				return next();
			}

			const listRepo = AppDataSource.getRepository(List);
			const list = await listRepo.findOne({ where: { id: listId, isActive: true } });
			if (!list) {
				throw new ForbiddenException("List not found or inactive");
			}

			const boardMemberRepo = AppDataSource.getRepository(BoardMember);
			const membership = await boardMemberRepo.findOne({
				where: {
					boardId: list.boardId,
					userId: (user as any).id,
					isActive: true
				}
			});

			if (!membership) {
				throw new ForbiddenException("You are not a member of this board");
			}

			next();
		} catch (error) {
			next(error);
		}
	};
};

export const checkCardBoardPermission = () => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = req?.user;
			const cardId = (req.params as any).id || (req.params as any).cardId;

			if (!user) {
				throw new UnauthorizedException("User not authenticated");
			}

			if (!cardId) {
				throw new ForbiddenException("Card ID is required");
			}

			const isSystemAdmin = (user as any).roles?.includes("admin");
			if (isSystemAdmin) {
				return next();
			}

			const cardRepo = AppDataSource.getRepository(Card);
			const card = await cardRepo.findOne({ where: { id: cardId, isActive: true }, relations: ["list"] });
			if (!card) {
				throw new ForbiddenException("Card not found or inactive");
			}

			const boardMemberRepo = AppDataSource.getRepository(BoardMember);
			const membership = await boardMemberRepo.findOne({
				where: {
					boardId: (card.list as any).boardId,
					userId: (user as any).id,
					isActive: true
				}
			});

			if (!membership) {
				throw new ForbiddenException("You are not a member of this board");
			}

			next();
		} catch (error) {
			next(error);
		}
	};
};


