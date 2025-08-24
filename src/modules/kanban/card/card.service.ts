import { NotFoundError } from '../../../core/errors/NotFoundError';
import { cardRequestStatic, cardUpdateRequestStatic } from './card.dto';
import { cardRepository } from './card.repository';

export const cardService = {
    async create(data: cardRequestStatic, columnId: string) {
        const columnCards = await cardRepository.findByColumnId(columnId);

        const [card] = await cardRepository.create({
            name: data.name,
            columnId,
            order: columnCards.length + 1,
        });

        if (!card) {
            throw new Error('Failed to create card');
        }

        return card;
    },

    async findByColumnId(columnId: string) {
        const cards = await cardRepository.findByColumnId(columnId);
        return cards;
    },

    async findById(id: string) {
        const [card] = await cardRepository.findById(id);
        if (!card) {
            throw new NotFoundError('Card not found');
        }
        return card;
    },

    async update(id: string, data: cardUpdateRequestStatic) {
        const [existingCard] = await cardRepository.findById(id);
        if (!existingCard) {
            throw new NotFoundError('Card not found');
        }

        const updateData: { name?: string; order?: number } = {};
        if (data.name !== undefined) {
            updateData.name = data.name;
        }

        const [card] = await cardRepository.update(id, updateData);
        return card;
    },

    async delete(id: string) {
        const [existingCard] = await cardRepository.findById(id);
        if (!existingCard) {
            throw new NotFoundError('Card not found');
        }

        await cardRepository.delete(id);
        return;
    },

    async updateOrder(id: string, newOrder: number) {
        const [existingCard] = await cardRepository.findById(id);
        if (!existingCard) {
            throw new NotFoundError('Card not found');
        }

        const [card] = await cardRepository.update(id, { order: newOrder });
        return card;
    },
};
