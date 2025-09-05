import * as z from "zod";
import { BaseSchema } from "./base.schema";

const FamilyTreeNodeSchema = z
  .object({
    familyTreeId: z.string().uuid(),
    fromUserId: z.string().uuid(),
    toUserId: z.string().uuid(),
  })
  .merge(BaseSchema);

type FamilyTreeNodeSchemaType = z.infer<typeof FamilyTreeNodeSchema>;

export { FamilyTreeNodeSchema, type FamilyTreeNodeSchemaType };
