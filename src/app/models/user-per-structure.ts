export interface UserPerStructure {
    userName: string,
    average: number,
    compareToStructureAverage?: number; // Added for comparison
    compareToTotalAverage?: number;
}
