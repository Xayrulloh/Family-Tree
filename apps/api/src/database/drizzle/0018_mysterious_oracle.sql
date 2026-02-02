ALTER TABLE "shared_family_trees" RENAME COLUMN "shared_with_user_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "shared_family_trees" DROP CONSTRAINT "family_tree_and_user_idx";--> statement-breakpoint
ALTER TABLE "shared_family_trees" DROP CONSTRAINT "shared_family_trees_shared_with_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "shared_family_trees" ADD CONSTRAINT "shared_family_trees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_family_trees" ADD CONSTRAINT "family_tree_and_user_idx" UNIQUE("family_tree_id","user_id");