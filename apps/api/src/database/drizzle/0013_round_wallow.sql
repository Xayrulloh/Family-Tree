ALTER TABLE "members" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "members" CASCADE;--> statement-breakpoint
ALTER TABLE "family_tree_member_connections" DROP CONSTRAINT "family_tree_member_connections_from_member_id_members_id_fk";
--> statement-breakpoint
ALTER TABLE "family_tree_member_connections" DROP CONSTRAINT "family_tree_member_connections_to_member_id_members_id_fk";
--> statement-breakpoint
ALTER TABLE "family_tree_members" DROP CONSTRAINT "family_tree_members_member_id_members_id_fk";
--> statement-breakpoint
ALTER TABLE "family_tree_members" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "family_tree_members" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "family_tree_members" ADD COLUMN "gender" "member_gender" NOT NULL;--> statement-breakpoint
ALTER TABLE "family_tree_members" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "family_tree_members" ADD COLUMN "dob" date;--> statement-breakpoint
ALTER TABLE "family_tree_members" ADD COLUMN "dod" date;--> statement-breakpoint
ALTER TABLE "family_tree_member_connections" ADD CONSTRAINT "family_tree_member_connections_from_member_id_family_tree_members_id_fk" FOREIGN KEY ("from_member_id") REFERENCES "public"."family_tree_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_tree_member_connections" ADD CONSTRAINT "family_tree_member_connections_to_member_id_family_tree_members_id_fk" FOREIGN KEY ("to_member_id") REFERENCES "public"."family_tree_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_tree_members" DROP COLUMN "member_id";