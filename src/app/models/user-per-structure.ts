export interface UserPerStructure {
    userId: number,
    userName: string,
    average: number,
    compareToStructureAverage?: number; // Added for comparison
    compareToTotalAverage?: number;
}
