// import { z } from 'zod';
// import { FamilyTreeNodeSchema } from '../schema/family-tree-node.schema';
// import { FamilyTreeSchema } from '../schema';

// const FamilyTreeCreateRequestSchema = FamilyTreeSchema.pick({
//   image: true,
//   name: true,
//   public: true,
// });

// const FamilyTreeUpdateRequestSchema = FamilyTreeCreateRequestSchema.partial();

// const FamilyTreeNameParamSchema = z.object({
//   name: z.string().min(3),
// });

// type FamilyTreeCreateRequestType = z.infer<
//   typeof FamilyTreeCreateRequestSchema
// >;

// type FamilyTreeUpdateRequestType = z.infer<
//   typeof FamilyTreeUpdateRequestSchema
// >;

// type FamilyTreeUsernameParamType = z.infer<typeof FamilyTreeNameParamSchema>;

// export {
//   FamilyTreeCreateRequestSchema,
//   type FamilyTreeCreateRequestType,
//   FamilyTreeUpdateRequestSchema,
//   type FamilyTreeUpdateRequestType,
//   FamilyTreeNameParamSchema,
//   type FamilyTreeUsernameParamType,
// };
