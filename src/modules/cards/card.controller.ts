import { Request, Response } from "express";
import { HttpResponseDto } from "../../common";
import { CardService } from "./card.service";
import {
	createCardRequestDto,
	updateCardRequestDto,
	getCardsPaginationRequestDto,
	swapCardPositionRequestDto,
	GetCardResponseType,
	GetCardsResponseType,
} from "./dtos";

export class CardController {
	constructor(private readonly cardService: CardService) {}

	async getCards(req: Request): Promise<Response> {
		const query = getCardsPaginationRequestDto.parse({ ...req.query, listId: req.params.listId });
		const result = await this.cardService.getCards(query);
		return new HttpResponseDto().success<GetCardsResponseType>({ data: result });
	}

	async getCardById(req: Request): Promise<Response> {
		const { id } = req.params;
		const card = await this.cardService.getCardById(id);
		return new HttpResponseDto().success<GetCardResponseType>({ data: card as any });
	}

	async createCard(req: Request): Promise<Response> {
		const { listId } = req.params as any;
		const data = createCardRequestDto.parse(req.body);
		const userId = (req as any).user?.id;
		const card = await this.cardService.createCard(listId, data, userId);
		return new HttpResponseDto().created<GetCardResponseType>({ data: card as any });
	}

	async updateCard(req: Request): Promise<Response> {
		const { id } = req.params;
		const data = updateCardRequestDto.parse(req.body);
		const card = await this.cardService.updateCard(id, data);
		return new HttpResponseDto().success<GetCardResponseType>({ data: card as any });
	}

	async deleteCard(req: Request): Promise<Response> {
		const { id } = req.params;
		await this.cardService.softDeleteCard(id);
		return new HttpResponseDto().success({ data: { message: "Card deleted successfully" } });
	}

	async hardDeleteCard(req: Request): Promise<Response> {
		const { id } = req.params;
		await this.cardService.hardDeleteCard(id);
		return new HttpResponseDto().success({ data: { message: "Card permanently deleted successfully" } });
	}

	async restoreCard(req: Request): Promise<Response> {
		const { id } = req.params;
		await this.cardService.restoreCard(id);
		return new HttpResponseDto().success({ data: { message: "Card restored successfully" } });
	}

	async swapCardPosition(req: Request): Promise<Response> {
		const data = swapCardPositionRequestDto.parse(req.body);
		await this.cardService.swapCardPosition(data.firstCardId, data.secondCardId);
		return new HttpResponseDto().success({ data: { message: "Card positions swapped successfully" } });
	}
}


