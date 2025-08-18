import { columnRepository } from './column.repository';

export const columnService = {
    async create(name: string, projectId: string) {
        const [column] = await columnRepository.create({
            name,
            projectId,
            order: 3,
        });

        return column;
    },
};
