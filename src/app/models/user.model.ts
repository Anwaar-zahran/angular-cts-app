export interface UserAttribute {
    text: string;
    value: string | null;
    type: string | null;
}

export interface User {
    id: number;
    firstName: string;
    middleName: string | null;
    lastName: string;
    fullName: string;
    text: string;
    value: string;
    username: string;
    email: string;
    applicationRole: string;
    applicationRoleId: number;
    userTypeId: number | null;
    defaultStructureId: number;
    managerId: number | null;
    groups: any[];
    structureIds: number[];
    attributes: UserAttribute[];
} 