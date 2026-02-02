ALTER TABLE "shared_family_trees" ADD COLUMN "is_blocked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "shared_family_trees" ADD COLUMN "can_edit_members" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "shared_family_trees" ADD COLUMN "can_delete_members" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "shared_family_trees" ADD COLUMN "can_add_members" boolean DEFAULT false NOT NULL;