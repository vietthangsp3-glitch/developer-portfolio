CREATE TYPE "public"."email_delivery_status" AS ENUM('not_requested', 'pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('received', 'contacted', 'archived');--> statement-breakpoint
CREATE TYPE "public"."project_media_role" AS ENUM('cover', 'hero', 'gallery', 'case_study');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(160) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"summary" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"seo_title" varchar(160),
	"seo_description" varchar(320),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_sort_order_non_negative" CHECK ("services"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"settings_key" varchar(32) DEFAULT 'default' NOT NULL,
	"site_name" varchar(120) NOT NULL,
	"site_title" varchar(180) NOT NULL,
	"site_description" varchar(500) NOT NULL,
	"availability" varchar(240) NOT NULL,
	"contact_email" varchar(320) NOT NULL,
	"social_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"seo_title" varchar(160) NOT NULL,
	"seo_description" varchar(320) NOT NULL,
	"updated_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_singleton_key" CHECK ("site_settings"."settings_key" = 'default')
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_name" varchar(160) NOT NULL,
	"role" varchar(160) NOT NULL,
	"company" varchar(160) NOT NULL,
	"quote" text NOT NULL,
	"avatar_media_id" uuid,
	"published" boolean DEFAULT false NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "testimonials_sort_order_non_negative" CHECK ("testimonials"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(40) NOT NULL,
	"provider_key" varchar(500) NOT NULL,
	"url" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"format" varchar(32) NOT NULL,
	"bytes" integer,
	"alt_text" varchar(300) NOT NULL,
	"folder" varchar(300),
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_width_positive" CHECK ("media_assets"."width" > 0),
	CONSTRAINT "media_assets_height_positive" CHECK ("media_assets"."height" > 0),
	CONSTRAINT "media_assets_bytes_non_negative" CHECK ("media_assets"."bytes" is null or "media_assets"."bytes" >= 0)
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"action" varchar(120) NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"email" varchar(320) NOT NULL,
	"company" varchar(160),
	"project_type" varchar(120) NOT NULL,
	"budget" varchar(120),
	"message" text NOT NULL,
	"status" "inquiry_status" DEFAULT 'received' NOT NULL,
	"email_delivery_status" "email_delivery_status" DEFAULT 'not_requested' NOT NULL,
	"email_provider_message_id" varchar(255),
	"source" varchar(80) DEFAULT 'website' NOT NULL,
	"network_identifier_hash" varchar(64),
	"user_agent_excerpt" varchar(256),
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inquiries_network_hash_length" CHECK ("inquiries"."network_identifier_hash" is null or length("inquiries"."network_identifier_hash") = 64)
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"scope" varchar(80) NOT NULL,
	"identifier_hash" varchar(64) NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "rate_limits_scope_identifier_hash_window_start_pk" PRIMARY KEY("scope","identifier_hash","window_start"),
	CONSTRAINT "rate_limits_request_count_positive" CHECK ("rate_limits"."request_count" > 0),
	CONSTRAINT "rate_limits_identifier_hash_length" CHECK (length("rate_limits"."identifier_hash") = 64),
	CONSTRAINT "rate_limits_expiry_after_window" CHECK ("rate_limits"."expires_at" > "rate_limits"."window_start")
);
--> statement-breakpoint
CREATE TABLE "project_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"role" "project_media_role" NOT NULL,
	"alt_text_override" varchar(300),
	"caption" varchar(500),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_media_sort_order_non_negative" CHECK ("project_media"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "project_technologies" (
	"project_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "project_technologies_project_id_technology_id_pk" PRIMARY KEY("project_id","technology_id"),
	CONSTRAINT "project_technologies_sort_order_non_negative" CHECK ("project_technologies"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(160) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"subtitle" varchar(240),
	"summary" varchar(500) NOT NULL,
	"description" text,
	"category" varchar(120) NOT NULL,
	"role" varchar(240) NOT NULL,
	"year" smallint NOT NULL,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"featured_rank" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"thumbnail_media_id" uuid,
	"hero_media_id" uuid,
	"live_url" text,
	"repository_url" text,
	"case_study_content" jsonb DEFAULT '{"version":1,"blocks":[]}'::jsonb NOT NULL,
	"seo_title" varchar(160),
	"seo_description" varchar(320),
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_year_range" CHECK ("projects"."year" between 1900 and 2200),
	CONSTRAINT "projects_sort_order_non_negative" CHECK ("projects"."sort_order" >= 0),
	CONSTRAINT "projects_featured_rank_non_negative" CHECK ("projects"."featured_rank" is null or "projects"."featured_rank" >= 0),
	CONSTRAINT "projects_published_at_required" CHECK ("projects"."status" <> 'published' or "projects"."published_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "technologies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"category" varchar(80),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_avatar_media_id_media_assets_id_fk" FOREIGN KEY ("avatar_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_thumbnail_media_id_media_assets_id_fk" FOREIGN KEY ("thumbnail_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_hero_media_id_media_assets_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "services_slug_unique" ON "services" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "services_published_order_idx" ON "services" USING btree ("published","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "site_settings_key_unique" ON "site_settings" USING btree ("settings_key");--> statement-breakpoint
CREATE INDEX "testimonials_published_order_idx" ON "testimonials" USING btree ("published","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_provider_key_unique" ON "media_assets" USING btree ("provider","provider_key");--> statement-breakpoint
CREATE INDEX "media_assets_created_at_idx" ON "media_assets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_created_at_idx" ON "audit_logs" USING btree ("actor_user_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_created_at_idx" ON "audit_logs" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "inquiries_status_created_at_idx" ON "inquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "rate_limits_expires_at_idx" ON "rate_limits" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "project_media_project_media_role_unique" ON "project_media" USING btree ("project_id","media_id","role");--> statement-breakpoint
CREATE INDEX "project_media_project_order_idx" ON "project_media" USING btree ("project_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "project_technologies_project_order_unique" ON "project_technologies" USING btree ("project_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_slug_unique" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "projects_status_published_at_idx" ON "projects" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "projects_featured_order_idx" ON "projects" USING btree ("featured_rank","sort_order");--> statement-breakpoint
CREATE INDEX "projects_category_idx" ON "projects" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "technologies_name_unique" ON "technologies" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "technologies_slug_unique" ON "technologies" USING btree ("slug");--> statement-breakpoint
CREATE FUNCTION "set_updated_at"() RETURNS trigger AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "services_set_updated_at" BEFORE UPDATE ON "services" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "site_settings_set_updated_at" BEFORE UPDATE ON "site_settings" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "testimonials_set_updated_at" BEFORE UPDATE ON "testimonials" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "media_assets_set_updated_at" BEFORE UPDATE ON "media_assets" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "inquiries_set_updated_at" BEFORE UPDATE ON "inquiries" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "project_media_set_updated_at" BEFORE UPDATE ON "project_media" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "projects_set_updated_at" BEFORE UPDATE ON "projects" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "technologies_set_updated_at" BEFORE UPDATE ON "technologies" FOR EACH ROW EXECUTE FUNCTION "set_updated_at"();
