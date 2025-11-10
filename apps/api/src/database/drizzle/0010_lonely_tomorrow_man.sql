CREATE TYPE "public"."family_tree_member_connection" AS ENUM('SPOUSE', 'PARENT');--> statement-breakpoint
CREATE TYPE "public"."member_gender" AS ENUM('MALE', 'FEMALE');--> statement-breakpoint
CREATE TABLE "family_tree_member_connections" (
	"family_tree_id" uuid NOT NULL,
	"from_member_id" uuid NOT NULL,
	"to_member_id" uuid NOT NULL,
	"type" "family_tree_member_connection" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "family_tree_members" (
	"family_tree_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "members" (
	"name" text NOT NULL,
	"image" text,
	"gender" "member_gender" NOT NULL,
	"description" text,
	"dob" date,
	"dod" date,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "family_tree_relationships" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "family_tree_relationships" CASCADE;--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "birth_date" TO "dob";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "death_date" TO "dod";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "family_tree_member_connections" ADD CONSTRAINT "family_tree_member_connections_family_tree_id_family_trees_id_fk" FOREIGN KEY ("family_tree_id") REFERENCES "public"."family_trees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_tree_member_connections" ADD CONSTRAINT "family_tree_member_connections_from_member_id_members_id_fk" FOREIGN KEY ("from_member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_tree_member_connections" ADD CONSTRAINT "family_tree_member_connections_to_member_id_members_id_fk" FOREIGN KEY ("to_member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_tree_members" ADD CONSTRAINT "family_tree_members_family_tree_id_family_trees_id_fk" FOREIGN KEY ("family_tree_id") REFERENCES "public"."family_trees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_tree_members" ADD CONSTRAINT "family_tree_members_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;