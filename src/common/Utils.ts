export const isProduction = (): boolean => {
    return process.env.NODE_ENV !== 'development';
};
