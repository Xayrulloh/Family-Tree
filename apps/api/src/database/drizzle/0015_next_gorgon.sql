CREATE TABLE "shared_family_trees" (
	"family_tree_id" uuid NOT NULL,
	"shared_with_user_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "shared_family_trees" ADD CONSTRAINT "shared_family_trees_family_tree_id_family_trees_id_fk" FOREIGN KEY ("family_tree_id") REFERENCES "public"."family_trees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_family_trees" ADD CONSTRAINT "shared_family_trees_shared_with_user_id_users_id_fk" FOREIGN KEY ("shared_with_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;