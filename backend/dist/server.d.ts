import { Pool } from 'pg';
declare global {
    namespace Express {
        interface Request {
            user?: {
                user_id: string;
                email: string;
                name: string;
                role: string;
                account_type: string;
                status: string;
            };
        }
    }
}
declare const pool: Pool;
declare const app: import("express-serve-static-core").Express;
export { app, pool };
//# sourceMappingURL=server.d.ts.map