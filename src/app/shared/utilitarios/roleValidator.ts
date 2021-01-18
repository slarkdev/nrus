import { User } from "../../shared/models/user.interface";
export class RoleValidator{
    isUser(user: User): boolean{
        return user.role === 'USUARIO';
    }
    isAdmin(user: User): boolean{
        return user.role === 'ADMIN';
    }
}