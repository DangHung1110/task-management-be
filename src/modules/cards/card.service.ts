import { Card, List } from "../../entities";
import { CardRepo } from "./repository/card.repository";
import { ListRepo } from "../lists/repository";
import { BadRequestException, InternalServerException, NotFoundException } from "../../common";
import { cacheService } from "../../common/cache/cache.service";
import { CACHE_CONFIG } from "../../config/cache.config";
import {
	CreateCardRequestDtoType,
	GetCardsPaginationRequestDtoType,
	getCardsResponseSchema,
	GetCardsResponseType,
	UpdateCardRequestDtoType,
} from "./dtos";

export class CardService {
	constructor(private readonly cardRepo: CardRepo, private readonly listRepo: ListRepo) {}

	async getCards(query: GetCardsPaginationRequestDtoType): Promise<GetCardsResponseType> {
		const paginationInput = {
			page: query.page ? Number(query.page) : 1,
			limit: query.limit ? Number(query.limit) : 10,
			search: query.search,
			total: undefined,
		};

		if (!query.listId) {
			throw new BadRequestException("listId is required");
		}

		const { cards, pagination } = await this.cardRepo.getCards(paginationInput as any, query.listId, query.search);
		return getCardsResponseSchema.parse({
			data: cards,
			pagination,
		});
	}

	async getCardById(id: string): Promise<Card> {
		const cacheKey = CACHE_CONFIG.keys.card(id);
		
		const cached = await cacheService.get<Card>(cacheKey);
		if (cached) {
			return cached;
		}
		
		const card = await this.cardRepo.findById(id);
		if (!card) {
			throw new NotFoundException("Card not found");
		}
		
		await cacheService.set(cacheKey, card, {
			ttl: CACHE_CONFIG.ttl.cardData
		});
		
		return card;
	}

	async createCard(listId: string, dto: CreateCardRequestDtoType, creatorId?: string): Promise<Card> {
		const list = await this.listRepo.findById(listId);
		if (!list) {
			throw new NotFoundException("List not found");
		}

		const maxPosition = await this.cardRepo.getMaxPosition(listId);
		const newPosition = maxPosition + 1;

		const card = new Card();
		card.listId = listId;
		card.title = dto.title;
		card.description = dto.description ?? null;
		card.position = newPosition;
		card.creatorId = creatorId ?? null;

		const created = await this.cardRepo.create(card);
		if (!created) {
			throw new InternalServerException("Failed to create card");
		}
		
		await cacheService.deletePattern(`card:*`);
		await cacheService.deletePattern(`list:${listId}:*`);
		
		return created;
	}

	async updateCard(id: string, data: UpdateCardRequestDtoType): Promise<Card> {
		const card = await this.cardRepo.findById(id);
		if (!card) {
			throw new NotFoundException("Card not found");
		}

		if (data.isArchived !== undefined) {
			if (data.isArchived && !card.isArchived) {
				card.isArchived = true;
				card.archivedAt = new Date();
			} else if (!data.isArchived && card.isArchived) {
				card.isArchived = false;
				card.archivedAt = null;
			}
		}

		await this.cardRepo.update(id, data as any);
		const updated = await this.cardRepo.findById(id);
		if (!updated) {
			throw new InternalServerException("Failed to update card");
		}
		
		await cacheService.delete(CACHE_CONFIG.keys.card(id));
		await cacheService.deletePattern(`card:*`);
		await cacheService.deletePattern(`list:${card.listId}:*`);
		
		return updated;
	}

	async softDeleteCard(id: string): Promise<void> {
		const card = await this.cardRepo.findById(id);
		if (!card) {
			throw new NotFoundException("Card not found");
		}
		await this.cardRepo.softDelete(card);
		
		await cacheService.delete(CACHE_CONFIG.keys.card(id));
		await cacheService.deletePattern(`card:*`);
		await cacheService.deletePattern(`list:${card.listId}:*`);
	}

	async hardDeleteCard(id: string): Promise<void> {
		const card = await this.cardRepo.findById(id);
		if (!card) {
			throw new NotFoundException("Card not found");
		}
		await this.cardRepo.hardDelete(card);
		
		await cacheService.delete(CACHE_CONFIG.keys.card(id));
		await cacheService.deletePattern(`card:*`);
		await cacheService.deletePattern(`list:${card.listId}:*`);
	}

	async restoreCard(id: string): Promise<void> {
		const card = await this.cardRepo.findById(id);
		if (!card) {
			throw new NotFoundException("Card not found");
		}
		await this.cardRepo.restore(card);
		
		await cacheService.delete(CACHE_CONFIG.keys.card(id));
		await cacheService.deletePattern(`card:*`);
		await cacheService.deletePattern(`list:${card.listId}:*`);
	}

	async swapCardPosition(firstCardId: string, secondCardId: string): Promise<void> {
		if (firstCardId === secondCardId) {
			throw new BadRequestException("Cannot swap a card with itself");
		}
		const { first, second } = await this.cardRepo.findCardsByIds(firstCardId, secondCardId);
		if (!first || !second) {
			throw new NotFoundException("One or both cards not found");
		}
		if (first.listId !== second.listId) {
			throw new BadRequestException("Cannot swap cards from different lists");
		}
		if (!first.isActive || !second.isActive) {
			throw new BadRequestException("Cannot swap inactive cards");
		}
		await this.cardRepo.swapPositions(first, second);
		
		await cacheService.delete(CACHE_CONFIG.keys.card(firstCardId));
		await cacheService.delete(CACHE_CONFIG.keys.card(secondCardId));
		await cacheService.deletePattern(`card:*`);
		await cacheService.deletePattern(`list:${first.listId}:*`);
	}
}


