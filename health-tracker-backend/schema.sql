-- Sequence Definitions
CREATE SEQUENCE diet_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE diet_food_items_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE goals_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE mood_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE sleep_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE users_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE workouts_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- Table Definitions
CREATE TABLE public.users (
    id INTEGER NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    username CHARACTER VARYING(50) NOT NULL,
    password CHARACTER VARYING(100) NOT NULL,
    email CHARACTER VARYING(100) NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
);

CREATE TABLE public.diet (
    id INTEGER NOT NULL DEFAULT nextval('diet_id_seq'::regclass),
    user_id INTEGER,
    date DATE,
    CONSTRAINT diet_pkey PRIMARY KEY (id),
    CONSTRAINT diet_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.diet_food_items (
    id INTEGER NOT NULL DEFAULT nextval('diet_food_items_id_seq'::regclass),
    diet_id INTEGER,
    food_item CHARACTER VARYING(255) NOT NULL,
    calories INTEGER NOT NULL,
    meal_type CHARACTER VARYING(50),
    CONSTRAINT diet_food_items_pkey PRIMARY KEY (id),
    CONSTRAINT diet_food_items_diet_id_fkey FOREIGN KEY (diet_id) REFERENCES public.diet(id) ON DELETE CASCADE
);

CREATE TABLE public.goals (
    id INTEGER NOT NULL DEFAULT nextval('goals_id_seq'::regclass),
    user_id INTEGER NOT NULL,
    type CHARACTER VARYING(255) NOT NULL,
    target_value NUMERIC NOT NULL,
    current_value NUMERIC NOT NULL,
    start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT goals_pkey PRIMARY KEY (id),
    CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.mood (
    id INTEGER NOT NULL DEFAULT nextval('mood_id_seq'::regclass),
    user_id INTEGER,
    mood CHARACTER VARYING(50),
    date DATE,
    notes TEXT,
    sentiment_score INTEGER,
    mood_score INTEGER,
    CONSTRAINT mood_pkey PRIMARY KEY (id),
    CONSTRAINT mood_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.sleep (
    id INTEGER NOT NULL DEFAULT nextval('sleep_id_seq'::regclass),
    user_id INTEGER,
    hours NUMERIC,
    date DATE,
    start_time TIME WITHOUT TIME ZONE,
    end_time TIME WITHOUT TIME ZONE,
    CONSTRAINT sleep_pkey PRIMARY KEY (id),
    CONSTRAINT sleep_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.workouts (
    id INTEGER NOT NULL DEFAULT nextval('workouts_id_seq'::regclass),
    user_id INTEGER,
    type CHARACTER VARYING(50),
    duration INTEGER,
    date DATE,
    start_time TIMESTAMP WITHOUT TIME ZONE,
    end_time TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT workouts_pkey PRIMARY KEY (id),
    CONSTRAINT workouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
