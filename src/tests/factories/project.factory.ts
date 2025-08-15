export const projectData = (
    overrides: Partial<{ name: string; description: string }> = {}
) => {
    return {
        name: 'DevFlow Project',
        description: 'A project created to help other developers',
        ...overrides,
    };
};
