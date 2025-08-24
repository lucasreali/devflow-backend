import { NotFoundError } from '../../../core/errors/NotFoundError';
import { columnRepository } from './column.repository';

export const columnService = {
    async create(name: string, projectId: string) {
        const projectColumns = await columnRepository.findByProjectId(
            projectId
        );

        const [column] = await columnRepository.create({
            name,
            projectId,
            order: projectColumns.length + 1,
        });

        if (!column) {
            throw new Error('Failed to create column');
        }

        return column;
    },

    async findByProjectId(projectId: string) {
        const columns = await columnRepository.findByProjectId(projectId);
        return columns;
    },

    async update(id: string, title: string) {
        const [existingColumn] = await columnRepository.findById(id);
        if (!existingColumn) {
            throw new NotFoundError('Column not found');
        }

        const [column] = await columnRepository.update(id, title);
        return column;
    },

    async delete(id: string) {
        const [existingColumn] = await columnRepository.findById(id);
        if (!existingColumn) {
            throw new NotFoundError('Column not found');
        }

        await columnRepository.delete(id);
        return;
    },
};
