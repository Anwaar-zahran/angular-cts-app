export interface CurrentUserStructures {
    applicationRole: string;
    applicationRoleId: number;
    attributes: any[];
    defaultStructureId: number;
    email: string;
    firstName: string;
    fullName: string;
    groups: any[];
    id: number;
    lastName: string;
    managerId: number | null;
    middleName: null;
    role: {
      id: number;
      name: string;
      description: null;
          privileges: any[];
        };
        structureIds: number[];
        structures: Structure[];
        userTypeId: number;
        username: string;
    }
export interface Structure {
    userAttributes: any[];
    id: number;
    name: string;
    code: string | null;
    managerId: number;
}
