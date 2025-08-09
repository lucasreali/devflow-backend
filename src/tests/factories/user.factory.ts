export const userData = (
    overrides: Partial<{ name: string; email: string; password: string }> = {}
) => {
    return {
        name: 'Jhon Doe',
        email: `u${Date.now()}@ex.com`,
        password: 'pass123',
        ...overrides,
    };
};
