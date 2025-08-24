import { authHandler } from '../../../core/middleware/auth-handler';
import {
    errorResponseSchema,
    successResponseSchema,
} from '../../../core/schemas/response-schemas';
import { FastifyTypeInstance } from '../../../types';
import { columnParms } from '../column/column.dto';
import {
    cardArrayResponse,
    cardParams,
    cardRequest,
    cardResponse,
    cardUpdateRequest,
} from './card.dto';
import { cardService } from './card.service';

export const cardController = (app: FastifyTypeInstance) => {
    app.post(
        '/columns/:columnId/cards',
        {
            preHandler: authHandler,
            schema: {
                body: cardRequest,
                params: columnParms,
                response: {
                    201: cardResponse,
                    400: errorResponseSchema,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { name } = req.body;
            const { columnId } = req.params;

            const card = await cardService.create({ name }, columnId);
            return rep.status(201).send(card);
        }
    );

    app.get(
        '/columns/:columnId/cards',
        {
            schema: {
                params: columnParms,
                response: {
                    200: cardArrayResponse,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { columnId } = req.params;
            const cards = await cardService.findByColumnId(columnId);

            return rep.status(200).send(cards);
        }
    );

    app.get(
        '/cards/:cardId',
        {
            schema: {
                params: cardParams,
                response: {
                    200: cardResponse,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { cardId } = req.params;
            const card = await cardService.findById(cardId);

            return rep.status(200).send(card);
        }
    );

    app.patch(
        '/cards/:cardId',
        {
            preHandler: authHandler,
            schema: {
                body: cardUpdateRequest,
                params: cardParams,
                response: {
                    200: cardResponse,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { cardId } = req.params;
            const updateData = req.body;

            const card = await cardService.update(cardId, updateData);

            return rep.status(200).send(card);
        }
    );

    app.patch(
        '/cards/:cardId/order',
        {
            preHandler: authHandler,
            schema: {
                body: {
                    type: 'object',
                    properties: { order: { type: 'number' } },
                    required: ['order'],
                },
                params: cardParams,
                response: {
                    200: cardResponse,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { cardId } = req.params;
            const { order } = req.body as { order: number };

            const card = await cardService.updateOrder(cardId, order);

            return rep.status(200).send(card);
        }
    );

    app.delete(
        '/cards/:cardId',
        {
            preHandler: authHandler,
            schema: {
                params: cardParams,
                response: {
                    200: successResponseSchema,
                    404: errorResponseSchema,
                    422: errorResponseSchema,
                },
            },
        },
        async (req, rep) => {
            const { cardId } = req.params;

            await cardService.delete(cardId);

            return rep.status(200).send({
                message: 'Card deleted successfully',
            });
        }
    );
};
