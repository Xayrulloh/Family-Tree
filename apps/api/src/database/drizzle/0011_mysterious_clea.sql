ALTER TABLE "fcm_tokens" DROP CONSTRAINT "fcm_tokens_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "family_tree_member_connections" DROP CONSTRAINT "family_tree_member_connections_from_member_id_members_id_fk";
--> statement-breakpoint
ALTER TABLE "family_tree_member_connections" DROP CONSTRAINT "family_tree_member_connections_to_member_id_members_id_fk";
--> statement-breakpoint
ALTER TABLE "family_tree_members" DROP CONSTRAINT "family_tree_members_member_id_members_id_fk";
--> statement-breakpoint
ALTER TABLE "family_trees" DROP CONSTRAINT "family_trees_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notification_reads" DROP CONSTRAINT "notification_reads_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_receiver_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_sender_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "fcm_tokens" ADD CONSTRAINT "fcm_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_tree_member_connections" ADD CONSTRAINT "family_tree_member_connections_from_member_id_members_id_fk" FOREIGN KEY ("from_member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_tree_member_connections" ADD CONSTRAINT "family_tree_member_connections_to_member_id_members_id_fk" FOREIGN KEY ("to_member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_tree_members" ADD CONSTRAINT "family_tree_members_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_trees" ADD CONSTRAINT "family_trees_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_receiver_user_id_users_id_fk" FOREIGN KEY ("receiver_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;