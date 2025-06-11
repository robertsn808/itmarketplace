CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"email" varchar(100),
	"phone" varchar(20),
	"address" text,
	"notes" text,
	"password" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "clients_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer,
	"title" varchar(200),
	"description" text,
	"call_stage" boolean DEFAULT false,
	"receive_stage" boolean DEFAULT false,
	"repair_stage" boolean DEFAULT false,
	"pickup_stage" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_name" varchar(100),
	"quantity" integer,
	"notes" text,
	"last_used" timestamp
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer,
	"amount" numeric(10, 2),
	"status" varchar(50) DEFAULT 'unpaid',
	"invoice_date" date,
	"pdf_url" text
);
--> statement-breakpoint
CREATE TABLE "service_completions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tech_profile_id" integer NOT NULL,
	"service_request_id" integer,
	"client_id" integer,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"hours_worked" numeric(5, 2),
	"client_satisfaction_rating" integer,
	"client_testimonial" text,
	"completed_at" timestamp DEFAULT now(),
	"skills_used" text[],
	"challenges_solved" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer,
	"service_type" varchar(100),
	"description" text,
	"status" varchar(50) DEFAULT 'pending',
	"assigned_to" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tech_certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"tech_profile_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"issuing_organization" varchar(255) NOT NULL,
	"credential_id" varchar(255),
	"credential_url" varchar(255),
	"issue_date" timestamp,
	"expiration_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tech_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"name" varchar(100),
	"personal_email" varchar(100),
	"email_signature" text,
	"notification_preferences" jsonb,
	"is_available" boolean DEFAULT false,
	"availability_mode" varchar(20) DEFAULT 'none',
	"allowed_client_ids" jsonb,
	"specialties" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"address" text,
	"phone" varchar(20),
	"profile_image_url" varchar(255),
	"bio" text,
	"hourly_rate" numeric(8, 2),
	"years_experience" integer,
	"education" text,
	"resume_url" varchar(255),
	"portfolio_url" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tech_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "tech_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"tech_profile_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100),
	"proficiency_level" varchar(50),
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer,
	"sender_type" varchar(20),
	"sender_name" varchar(100),
	"sender_email" varchar(100),
	"message" text,
	"message_type" varchar(20) DEFAULT 'chat',
	"is_internal" boolean DEFAULT false,
	"email_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_request_id" integer,
	"client_id" integer,
	"title" varchar(200),
	"description" text,
	"priority" varchar(20) DEFAULT 'medium',
	"status" varchar(20) DEFAULT 'open',
	"assigned_to" varchar(100),
	"tech_email" varchar(100),
	"client_notifications" boolean DEFAULT true,
	"email_notifications" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "web_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"email" varchar(100),
	"message" text,
	"source" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_completions" ADD CONSTRAINT "service_completions_tech_profile_id_tech_profiles_id_fk" FOREIGN KEY ("tech_profile_id") REFERENCES "public"."tech_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_completions" ADD CONSTRAINT "service_completions_service_request_id_service_requests_id_fk" FOREIGN KEY ("service_request_id") REFERENCES "public"."service_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_completions" ADD CONSTRAINT "service_completions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tech_certifications" ADD CONSTRAINT "tech_certifications_tech_profile_id_tech_profiles_id_fk" FOREIGN KEY ("tech_profile_id") REFERENCES "public"."tech_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tech_profiles" ADD CONSTRAINT "tech_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tech_skills" ADD CONSTRAINT "tech_skills_tech_profile_id_tech_profiles_id_fk" FOREIGN KEY ("tech_profile_id") REFERENCES "public"."tech_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_service_request_id_service_requests_id_fk" FOREIGN KEY ("service_request_id") REFERENCES "public"."service_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");