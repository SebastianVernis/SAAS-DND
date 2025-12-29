CREATE INDEX "idx_invitations_org" ON "invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_invitations_org_status" ON "invitations" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_organizations_slug" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_projects_created_by" ON "projects" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_projects_org_updated" ON "projects" USING btree ("organization_id","updated_at");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_org" ON "subscriptions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_stripe_customer" ON "subscriptions" USING btree ("stripe_customer_id");