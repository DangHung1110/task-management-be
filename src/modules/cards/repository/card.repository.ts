import { DataSource, In, Repository } from "typeorm";
import { Card } from "../../../entities";
import { NotFoundException, PaginationDto, paginationUtils } from "../../../common";

export class CardRepo {
	private repo: Repository<Card>;
	private pagination: paginationUtils;

	constructor(ds: DataSource) {
		this.repo = ds.getRepository(Card);
		this.pagination = new paginationUtils();
	}

	async getCards(pagination: PaginationDto, listId: string, search?: string): Promise<{
		cards: Card[];
		pagination: PaginationDto;
	}> {
		const { skip, take } = this.pagination.extractTakeSkip(pagination);
		const query = this.repo
			.createQueryBuilder("card")
			.leftJoinAndSelect("card.list", "list")
			.skip(skip)
			.take(take)
			.where("card.isActive = :isActive", { isActive: true })
			.andWhere("card.listId = :listId", { listId });

		if (search) {
			query.andWhere("card.title ILIKE :search", { search: `%${search}%` });
		}

		query.orderBy("card.position", "ASC");

		const [cards, total] = await query.getManyAndCount();
		const paginationInfo = this.pagination.convertToPaginationDto(total);
		return { cards, pagination: paginationInfo };
	}

	async findById(id: string): Promise<Card | null> {
		return this.repo.findOne({
			where: { id, isActive: true },
			relations: ["list"],
		});
	}

	async create(data: Partial<Card>): Promise<Card> {
		const card = this.repo.create(data);
		return this.repo.save(card);
	}

	async update(id: string, data: Partial<Card>): Promise<Card | null> {
		const card = await this.repo.findOne({ where: { id, isActive: true } });
		if (!card) {
			throw new NotFoundException("Card not found");
		}
		Object.assign(card, data);
		return this.repo.save(card);
	}

	async softDelete(card: Card): Promise<Card> {
		card.isActive = false;
		return this.repo.save(card);
	}

	async hardDelete(card: Card): Promise<void> {
		await this.repo.remove(card);
	}

	async restore(card: Card): Promise<Card> {
		card.isActive = true;
		return this.repo.save(card);
	}

	async getMaxPosition(listId: string): Promise<number> {
		const result = await this.repo
			.createQueryBuilder("card")
			.select("MAX(card.position)", "max")
			.where("card.listId = :listId", { listId })
			.andWhere("card.isActive = :isActive", { isActive: true })
			.getRawOne();
		return result?.max ?? 0;
	}

	async findCardsByIds(firstId: string, secondId: string): Promise<{ first: Card | null; second: Card | null }> {
		const cards = await this.repo.find({
			where: { id: In([firstId, secondId]) },
			relations: ["list"],
		});
		const first = cards.find(c => c.id === firstId) || null;
		const second = cards.find(c => c.id === secondId) || null;
		return { first, second };
	}

	async swapPositions(firstCard: Card, secondCard: Card): Promise<void> {
		const temp = firstCard.position;
		firstCard.position = secondCard.position;
		secondCard.position = temp;
		await this.repo.save([firstCard, secondCard]);
	}
}


