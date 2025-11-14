import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import express from "express";
import { z } from "zod";
import { AppDataSource } from "../../config";
import { createApiResponse } from "../../swagger";
import { autoBindUtil, authenticate, checkListBoardPermission, checkCardBoardPermission, validateRequestMiddleware } from "../../common";
import { CardRepo } from "./repository/card.repository";
import { ListRepo } from "../lists/repository";
import { CardService } from "./card.service";
import { CardController } from "./card.controller";
import {
	getCardsPaginationRequestDto,
	getCardSchema,
	getCardsResponseSchema,
	createCardRequestDto,
	updateCardRequestDto,
	swapCardPositionRequestDto,
} from "./dtos";

extendZodWithOpenApi(z);

const GetCardsPaginationQuerySchema = getCardsPaginationRequestDto.extend({}).openapi({
	example: { page: "1", limit: "10", search: "task", listId: "uuid" },
});

const CreateCardRequestSchema = createCardRequestDto.openapi({
	example: { title: "New task", description: "Do something" },
});

const UpdateCardRequestSchema = updateCardRequestDto.openapi({
	example: { title: "Updated title", description: "Updated desc", isArchived: false },
});

const SwapCardPositionRequestSchema = swapCardPositionRequestDto.openapi({
	example: { firstCardId: "uuid-1", secondCardId: "uuid-2" },
});

export const cardRegistry = new OpenAPIRegistry();
cardRegistry.register("GetCardsPaginationQuery", GetCardsPaginationQuerySchema);
cardRegistry.register("CardResponse", getCardSchema);
cardRegistry.register("CardsResponse", getCardsResponseSchema);
cardRegistry.register("CreateCardRequest", CreateCardRequestSchema);
cardRegistry.register("UpdateCardRequest", UpdateCardRequestSchema);
cardRegistry.register("SwapCardPositionRequest", SwapCardPositionRequestSchema);

const cardRepo = new CardRepo(AppDataSource);
const listRepo = new ListRepo(AppDataSource);
const cardService = new CardService(cardRepo, listRepo);
const cardController = new CardController(cardService);
const router = express.Router({ mergeParams: true });
autoBindUtil(cardController);

cardRegistry.registerPath({
	method: "get",
	path: "/lists/{listId}/cards",
	tags: ["Cards"],
	security: [{ BearerAuth: [] }],
	request: {
		params: z.object({ listId: z.string().uuid() }),
		query: GetCardsPaginationQuerySchema,
	},
	responses: createApiResponse(getCardsResponseSchema, "Get Cards with pagination successfully"),
});
router.get(
	"/lists/:listId/cards",
	authenticate,
	checkListBoardPermission(),
	validateRequestMiddleware({ query: GetCardsPaginationQuerySchema }),
	cardController.getCards
);

cardRegistry.registerPath({
	method: "get",
	path: "/cards/{cardId}",
	tags: ["Cards"],
	security: [{ BearerAuth: [] }],
	request: { params: z.object({ cardId: z.string().uuid() }) },
	responses: createApiResponse(getCardSchema, "Get Card by ID successfully"),
});
router.get("/cards/:id", authenticate, checkCardBoardPermission(), cardController.getCardById);

cardRegistry.registerPath({
	method: "post",
	path: "/lists/{listId}/cards",
	tags: ["Cards"],
	security: [{ BearerAuth: [] }],
	request: {
		params: z.object({ listId: z.string().uuid() }),
		body: { content: { "application/json": { schema: CreateCardRequestSchema } } },
	},
	responses: createApiResponse(getCardSchema, "Card created successfully"),
});
router.post(
	"/lists/:listId/cards",
	authenticate,
	checkListBoardPermission(),
	validateRequestMiddleware({ body: CreateCardRequestSchema }),
	cardController.createCard
);

cardRegistry.registerPath({
	method: "put",
	path: "/cards/{cardId}",
	tags: ["Cards"],
	security: [{ BearerAuth: [] }],
	request: {
		params: z.object({ cardId: z.string().uuid() }),
		body: { content: { "application/json": { schema: UpdateCardRequestSchema } } },
	},
	responses: createApiResponse(getCardSchema, "Card updated successfully"),
});
router.put(
	"/cards/:id",
	authenticate,
	checkCardBoardPermission(),
	validateRequestMiddleware({ body: UpdateCardRequestSchema }),
	cardController.updateCard
);

cardRegistry.registerPath({
	method: "delete",
	path: "/cards/{cardId}",
	tags: ["Cards"],
	security: [{ BearerAuth: [] }],
	request: { params: z.object({ cardId: z.string().uuid() }) },
	responses: createApiResponse(z.object({ message: z.string() }), "Card deleted successfully"),
});
router.delete("/cards/:id", authenticate, checkCardBoardPermission(), cardController.deleteCard);

cardRegistry.registerPath({
	method: "delete",
	path: "/cards/{cardId}/hard",
	tags: ["Cards"],
	security: [{ BearerAuth: [] }],
	request: { params: z.object({ cardId: z.string().uuid() }) },
	responses: createApiResponse(z.object({ message: z.string() }), "Card permanently deleted successfully"),
});
router.delete("/cards/:id/hard", authenticate, checkCardBoardPermission(), cardController.hardDeleteCard);

cardRegistry.registerPath({
	method: "patch",
	path: "/cards/{cardId}/restore",
	tags: ["Cards"],
	security: [{ BearerAuth: [] }],
	request: { params: z.object({ cardId: z.string().uuid() }) },
	responses: createApiResponse(z.object({ message: z.string() }), "Card restored successfully"),
});
router.patch("/cards/:id/restore", authenticate, checkCardBoardPermission(), cardController.restoreCard);

cardRegistry.registerPath({
	method: "post",
	path: "/cards/swap-position",
	tags: ["Cards"],
	security: [{ BearerAuth: [] }],
	request: { body: { content: { "application/json": { schema: SwapCardPositionRequestSchema } } } },
	responses: createApiResponse(z.object({ message: z.string() }), "Card positions swapped successfully"),
});
router.post(
	"/cards/swap-position",
	authenticate,
	checkCardBoardPermission(),
	validateRequestMiddleware({ body: SwapCardPositionRequestSchema }),
	cardController.swapCardPosition
);

export const cardRouter = router;


