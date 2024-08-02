export function calculateSimilarity(song1: any, song2: any) {

    const features1 = Object.values(song1).map(Number);
    const features2 = Object.values(song2).map(Number);
    
    // Вычисление скалярного произведения
    const dotProduct = features1.reduce((sum, value, index) => sum + value * features2[index], 0);

    // Вычисление норм векторов
    const magnitude1 = Math.sqrt(features1.reduce((sum, value) => sum + value * value, 0));
    const magnitude2 = Math.sqrt(features2.reduce((sum, value) => sum + value * value, 0));

    // Вычисление косинусного сходства
    const similarity = dotProduct / (magnitude1 + magnitude2);

    return similarity;
}