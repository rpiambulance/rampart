import { Model, RelationMappings, RelationMappingsThunk, QueryBuilderType, Modifiers } from "objection";
/**
 * @swagger
 *
 * definitions:
 *   liteUser:
 *      type: object
 *      properties:
 *           id:
 *             type: "integer"
 *           first_name:
 *             type: "string"
 *           last_name: 
 *             type: "string"
 *           nine_hundred:
 *             type: "integer"
 *             nullable: true
 *   User:
 *     type: object
 *     required:
  *       - "first_name"
  *       - "last_name"
  *       - "dob"
  *       - "email"
  *       - "phone"
  *       - "admin"
  *       - "active"
  *       - "access_revoked"
  *       - "created_by"
 *     properties:
 *           id:
 *             type: "integer"
 *           first_name:
 *             type: "string"
 *           last_name: 
 *             type: "string"
 *           nine_hundred:
 *             type: "integer"
 *             nullable: true
 *           dob:
 *             type: "string"
 *           email:
 *             type: "string"
 *           home_street:
 *             type: "string"
 *             nullable: true
 *           home_city:
 *             type: "string"
 *             nullable: true
 *           home_state:
 *             type: "string"
 *             nullable: true
 *           home_zip:
 *             type: "string"
 *             nullable: true
 *           local_street:
 *             type: "string"
 *             nullable: true
 *           local_city:
 *             type: "string"
 *             nullable: true
 *           local_state:
 *             type: "string"
 *             nullable: true
 *           local_zip:
 *             type: "string"
 *             nullable: true
 *           phone:
 *             type: "string"
 *           rcs_id:
 *             type: "string"
 *             nullable: true
 *           rin:
 *             type: "integer"
 *             nullable: true
 *           admin:
 *              type: "boolean" 
 *           last_login:
 *              type: "string"
 *              nullable: true
 *           active:
 *              type: "boolean"
 *           access_revoked:
 *              type: "boolean"
 *           g_id:
 *              type: "string"
 *              nullable: true
 *           slack_id:
 *              type: "string"
 *              nullable: true
 *           created_by:
 *              type: "integer"
 *           created:
 *              type: "string"
 *           updated_by:
 *              type: "integer"
 *              nullable: true
 *           updated:
 *              type: "string"
 *              nullable: true
 */
export class User extends Model {
    private id!: number;
    private first_name!: string;
    private last_name!: string;
    private nine_hundred?: number;
    private dob!: string;
    private email!: string;
    private home_street?: string;
    private home_city?: string;
    private home_state?: string;
    private home_zip?: string;
    private local_street?: string;
    private local_city?: string;
    private local_state?: string;
    private local_zip?: string;
    private phone!: string;
    private rcs_id?: string;
    private rin?: number;
    private admin!: boolean;
    private last_login?: string;
    private active!: boolean;
    private access_revoked!: boolean;
    private g_id?: string;
    private slack_id?: string;
    private creator!: User;
    private created!: string;
    private updator?: User;
    private updated?: string;

    static tableName = "users";

    // Used for validation, whenever a model is created it checks this
    static jsonSchema = {
        type: "object",
        required: ["first_name", "last_name", "dob", "email", "phone", "admin", "active", "access_revoked", "created_by"],

        properties: {
            id: { type: "integer" },
            first_name: { type: "string" },
            last_name: { type: "string" },
            nine_hundred: { type: ["integer", "null"] },
            dob: { type: "string" },
            email: { type: "string" },
            home_street: { type: ["string", "null"] },
            home_city: { type: ["string", "null"] },
            home_state: { type: ["string", "null"] },
            home_zip: { type: ["string", "null"] },
            local_street: { type: ["string", "null"] },
            local_city: { type: ["string", "null"] },
            local_state: { type: ["string", "null"] },
            local_zip: { type: ["string", "null"] },
            phone: { type: "string" },
            rcs_id: { type: ["string", "null"] },
            rin: { type: ["integer", "null"] },
            admin: { type: "boolean" },
            last_login: { type: ["string", "null"] },
            active: { type: "boolean" },
            access_revoked: { type: "boolean" },
            g_id: { type: ["string", "null"] },
            slack_id: { type: ["string", "null"] },
            created_by: { type: "integer" },
            created: { type: "string" },
            updated_by: { type: ["integer", "null"] },
            updated: { type: ["string", "null"] } 
        }
    }

    // This object defines the relations to other models. The relationMappings
    // property can be a thunk to prevent circular dependencies.
    static relationMappings: RelationMappingsThunk = (): RelationMappings => ({
        creator: {
            relation: Model.BelongsToOneRelation,
            modelClass: User,
            join: {
                from: `${User.tableName}.created_by`,
                to: `${User.tableName}.id`
            }
        },
        updator: {
            relation: Model.BelongsToOneRelation,
            modelClass: User,
            join: {
                from: `${User.tableName}.updated_by`,
                to: `${User.tableName}.id`
            }
        }
    });

    static modifiers: Modifiers = {
        // This is normally the info we want so we can pass this modifer in to modify the query
        liteUser(query: QueryBuilderType<User>): void {
            query.select("id", "first_name", "last_name", "nine_hundred");
        }
    }
}