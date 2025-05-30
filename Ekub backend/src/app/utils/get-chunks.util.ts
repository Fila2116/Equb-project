export const getChunks = (array: any[], size: number) =>
    Array.from({ length: Math.ceil(array.length / size) }).map(() =>
      array.splice(0, size)
    );
  