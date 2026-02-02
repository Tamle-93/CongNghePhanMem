--
-- PostgreSQL database dump
--

\restrict xqOUdpcfH2fU3ro5foKFG5H8CGP9jfAWn31RywkoKapKrQRgTEgcsezsBqdAxUa

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: paperstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.paperstatus AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'REVIEWED',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN',
    'revision_required',
    'camera_ready'
);


ALTER TYPE public.paperstatus OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignments (
    id integer NOT NULL,
    conference_id integer NOT NULL,
    paper_id integer NOT NULL,
    reviewer_id integer NOT NULL,
    is_auto_assigned boolean,
    status character varying(30),
    score integer,
    confidential_comment text,
    assigned_at timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    is_deleted boolean
);


ALTER TABLE public.assignments OWNER TO postgres;

--
-- Name: assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignments_id_seq OWNER TO postgres;

--
-- Name: assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assignments_id_seq OWNED BY public.assignments.id;


--
-- Name: audit_log_ai; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_log_ai (
    id integer NOT NULL,
    user_id integer,
    action_type character varying(100) NOT NULL,
    table_name character varying(50) NOT NULL,
    record_id integer,
    data text,
    "timestamp" timestamp without time zone NOT NULL
);


ALTER TABLE public.audit_log_ai OWNER TO postgres;

--
-- Name: audit_log_ai_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_log_ai_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_log_ai_id_seq OWNER TO postgres;

--
-- Name: audit_log_ai_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_log_ai_id_seq OWNED BY public.audit_log_ai.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id integer,
    changes json,
    status character varying(20),
    error_message text,
    ip_address character varying(50),
    user_agent character varying(500),
    "timestamp" timestamp without time zone NOT NULL,
    description text
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: brow_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brow_history (
    id integer NOT NULL,
    viewer_id integer,
    paper_id integer,
    old_content text,
    "timestamp" timestamp without time zone NOT NULL
);


ALTER TABLE public.brow_history OWNER TO postgres;

--
-- Name: brow_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.brow_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brow_history_id_seq OWNER TO postgres;

--
-- Name: brow_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.brow_history_id_seq OWNED BY public.brow_history.id;


--
-- Name: conference_mentors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conference_mentors (
    id integer NOT NULL,
    reviewer_user_id integer NOT NULL,
    paper_id integer,
    reason character varying(255),
    request_date timestamp without time zone,
    quota integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.conference_mentors OWNER TO postgres;

--
-- Name: conference_mentors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conference_mentors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conference_mentors_id_seq OWNER TO postgres;

--
-- Name: conference_mentors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conference_mentors_id_seq OWNED BY public.conference_mentors.id;


--
-- Name: conferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conferences (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    location character varying(255),
    website_url character varying(500),
    submission_deadline timestamp without time zone NOT NULL,
    review_deadline timestamp without time zone NOT NULL,
    decision_deadline timestamp without time zone,
    camera_ready_deadline timestamp without time zone,
    registration_deadline timestamp without time zone,
    conference_start_date timestamp without time zone,
    conference_end_date timestamp without time zone,
    blind_review_type character varying(20) NOT NULL,
    max_reviewers_per_paper integer NOT NULL,
    min_reviewers_per_paper integer NOT NULL,
    chair_id integer,
    is_active boolean NOT NULL,
    is_deleted boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.conferences OWNER TO postgres;

--
-- Name: COLUMN conferences.submission_deadline; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.conferences.submission_deadline IS 'Háº¡n ná»™p bĂ i (Paper Submission Deadline)';


--
-- Name: COLUMN conferences.review_deadline; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.conferences.review_deadline IS 'Háº¡n pháº£n biá»‡n (Review Deadline)';


--
-- Name: COLUMN conferences.decision_deadline; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.conferences.decision_deadline IS 'Háº¡n ra quyáº¿t Ä‘á»‹nh (Decision Deadline)';


--
-- Name: COLUMN conferences.camera_ready_deadline; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.conferences.camera_ready_deadline IS 'Háº¡n ná»™p báº£n hoĂ n chá»‰nh (Camera-Ready Deadline)';


--
-- Name: COLUMN conferences.registration_deadline; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.conferences.registration_deadline IS 'Háº¡n Ä‘Äƒng kĂ½ tham dá»± (Registration Deadline)';


--
-- Name: COLUMN conferences.conference_start_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.conferences.conference_start_date IS 'NgĂ y báº¯t Ä‘áº§u há»™i nghá»‹';


--
-- Name: COLUMN conferences.conference_end_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.conferences.conference_end_date IS 'NgĂ y káº¿t thĂºc há»™i nghá»‹';


--
-- Name: COLUMN conferences.blind_review_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.conferences.blind_review_type IS 'single-blind, double-blind, or open';


--
-- Name: COLUMN conferences.max_reviewers_per_paper; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.conferences.max_reviewers_per_paper IS 'Sá»‘ lÆ°á»£ng reviewers tá»‘i Ä‘a cho má»—i bĂ i';


--
-- Name: COLUMN conferences.min_reviewers_per_paper; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.conferences.min_reviewers_per_paper IS 'Sá»‘ lÆ°á»£ng reviewers tá»‘i thiá»ƒu cho má»—i bĂ i';


--
-- Name: conferences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conferences_id_seq OWNER TO postgres;

--
-- Name: conferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conferences_id_seq OWNED BY public.conferences.id;


--
-- Name: conflict_of_interest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conflict_of_interest (
    id integer NOT NULL,
    conference_id integer,
    paper_id integer NOT NULL,
    reviewer_id integer NOT NULL,
    reason text,
    created_at timestamp without time zone
);


ALTER TABLE public.conflict_of_interest OWNER TO postgres;

--
-- Name: conflict_of_interest_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conflict_of_interest_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conflict_of_interest_id_seq OWNER TO postgres;

--
-- Name: conflict_of_interest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conflict_of_interest_id_seq OWNED BY public.conflict_of_interest.id;


--
-- Name: decisions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.decisions (
    id integer NOT NULL,
    paper_id integer NOT NULL,
    conference_id integer,
    chair_user_id integer NOT NULL,
    result character varying(20),
    final_comment text,
    name character varying(255),
    code character varying(50),
    description text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone,
    is_deleted boolean NOT NULL
);


ALTER TABLE public.decisions OWNER TO postgres;

--
-- Name: decisions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.decisions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.decisions_id_seq OWNER TO postgres;

--
-- Name: decisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.decisions_id_seq OWNED BY public.decisions.id;


--
-- Name: email_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_logs (
    id integer NOT NULL,
    idempotency_key character varying(100) NOT NULL,
    recipient_email character varying(255) NOT NULL,
    subject character varying(500) NOT NULL,
    body text NOT NULL,
    email_type character varying(100) NOT NULL,
    related_entity_type character varying(50),
    related_entity_id integer,
    user_id integer,
    status character varying(20) NOT NULL,
    retry_count integer,
    max_retries integer,
    last_error text,
    created_at timestamp without time zone NOT NULL,
    sent_at timestamp without time zone
);


ALTER TABLE public.email_logs OWNER TO postgres;

--
-- Name: email_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.email_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_logs_id_seq OWNER TO postgres;

--
-- Name: email_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.email_logs_id_seq OWNED BY public.email_logs.id;


--
-- Name: feature_flags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feature_flags (
    id integer NOT NULL,
    conference_id integer NOT NULL,
    feature_name character varying(100) NOT NULL,
    enabled boolean NOT NULL,
    config character varying(2000),
    description character varying(500),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone
);


ALTER TABLE public.feature_flags OWNER TO postgres;

--
-- Name: feature_flags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.feature_flags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.feature_flags_id_seq OWNER TO postgres;

--
-- Name: feature_flags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.feature_flags_id_seq OWNED BY public.feature_flags.id;


--
-- Name: la_umcauthres; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.la_umcauthres (
    id integer NOT NULL,
    paper_id character varying(255),
    sender_domain_id character varying(255),
    content text,
    upload_cache_uid text,
    "timestamp" timestamp without time zone,
    foreign_key character varying(255)
);


ALTER TABLE public.la_umcauthres OWNER TO postgres;

--
-- Name: la_umcauthres_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.la_umcauthres_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.la_umcauthres_id_seq OWNER TO postgres;

--
-- Name: la_umcauthres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.la_umcauthres_id_seq OWNED BY public.la_umcauthres.id;


--
-- Name: paper_authors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paper_authors (
    id integer NOT NULL,
    paper_id integer NOT NULL,
    user_id integer,
    author_order integer NOT NULL,
    is_corresponding boolean,
    affiliation character varying(255),
    guest_name character varying(255),
    guest_email character varying(255)
);


ALTER TABLE public.paper_authors OWNER TO postgres;

--
-- Name: paper_authors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.paper_authors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.paper_authors_id_seq OWNER TO postgres;

--
-- Name: paper_authors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.paper_authors_id_seq OWNED BY public.paper_authors.id;


--
-- Name: papers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.papers (
    id integer NOT NULL,
    title character varying(500) NOT NULL,
    abstract text,
    keywords character varying(500),
    pdf_path character varying(500),
    camera_ready_path character varying(500),
    status public.paperstatus NOT NULL,
    is_withdrawn boolean NOT NULL,
    submitter_id integer NOT NULL,
    conference_id integer NOT NULL,
    track_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.papers OWNER TO postgres;

--
-- Name: papers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.papers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.papers_id_seq OWNER TO postgres;

--
-- Name: papers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.papers_id_seq OWNED BY public.papers.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(500) NOT NULL,
    token_hash character varying(500),
    is_revoked boolean NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL,
    ip_address character varying(50),
    user_agent character varying(500)
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    assignment_id integer NOT NULL,
    paper_id integer NOT NULL,
    score integer,
    comments_for_author text,
    confidential_content text,
    old_confidential_content text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone,
    is_deleted boolean NOT NULL,
    CONSTRAINT check_score_range CHECK (((score >= 1) AND (score <= 10)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    description text,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: submission_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.submission_versions (
    id integer NOT NULL,
    paper_id integer NOT NULL,
    version integer NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size integer,
    title character varying(500),
    abstract text,
    keywords character varying(500),
    change_notes text,
    created_at timestamp without time zone NOT NULL,
    created_by integer
);


ALTER TABLE public.submission_versions OWNER TO postgres;

--
-- Name: submission_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.submission_versions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.submission_versions_id_seq OWNER TO postgres;

--
-- Name: submission_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.submission_versions_id_seq OWNED BY public.submission_versions.id;


--
-- Name: tracks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tracks (
    id integer NOT NULL,
    conference_id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20) NOT NULL,
    description text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone,
    is_deleted boolean NOT NULL
);


ALTER TABLE public.tracks OWNER TO postgres;

--
-- Name: tracks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tracks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tracks_id_seq OWNER TO postgres;

--
-- Name: tracks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tracks_id_seq OWNED BY public.tracks.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    role_id integer NOT NULL,
    conference_id integer,
    is_active boolean NOT NULL,
    assigned_by integer,
    assigned_at timestamp without time zone NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_roles_id_seq OWNER TO postgres;

--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone,
    is_deleted boolean NOT NULL,
    is_blocked boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments ALTER COLUMN id SET DEFAULT nextval('public.assignments_id_seq'::regclass);


--
-- Name: audit_log_ai id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log_ai ALTER COLUMN id SET DEFAULT nextval('public.audit_log_ai_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: brow_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brow_history ALTER COLUMN id SET DEFAULT nextval('public.brow_history_id_seq'::regclass);


--
-- Name: conference_mentors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conference_mentors ALTER COLUMN id SET DEFAULT nextval('public.conference_mentors_id_seq'::regclass);


--
-- Name: conferences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conferences ALTER COLUMN id SET DEFAULT nextval('public.conferences_id_seq'::regclass);


--
-- Name: conflict_of_interest id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conflict_of_interest ALTER COLUMN id SET DEFAULT nextval('public.conflict_of_interest_id_seq'::regclass);


--
-- Name: decisions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.decisions ALTER COLUMN id SET DEFAULT nextval('public.decisions_id_seq'::regclass);


--
-- Name: email_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_logs ALTER COLUMN id SET DEFAULT nextval('public.email_logs_id_seq'::regclass);


--
-- Name: feature_flags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feature_flags ALTER COLUMN id SET DEFAULT nextval('public.feature_flags_id_seq'::regclass);


--
-- Name: la_umcauthres id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_umcauthres ALTER COLUMN id SET DEFAULT nextval('public.la_umcauthres_id_seq'::regclass);


--
-- Name: paper_authors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paper_authors ALTER COLUMN id SET DEFAULT nextval('public.paper_authors_id_seq'::regclass);


--
-- Name: papers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.papers ALTER COLUMN id SET DEFAULT nextval('public.papers_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: submission_versions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submission_versions ALTER COLUMN id SET DEFAULT nextval('public.submission_versions_id_seq'::regclass);


--
-- Name: tracks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracks ALTER COLUMN id SET DEFAULT nextval('public.tracks_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignments (id, conference_id, paper_id, reviewer_id, is_auto_assigned, status, score, confidential_comment, assigned_at, created_at, updated_at, is_deleted) FROM stdin;
520	17	225	30	f	Assigned	\N	\N	2026-01-31 09:30:42.486787	2026-01-31 09:30:42.48679	2026-01-31 09:30:42.48679	f
522	17	225	24	f	Assigned	\N	\N	2026-01-31 09:30:42.794763	2026-01-31 09:30:42.794767	2026-01-31 09:30:42.794768	f
521	17	225	29	f	Completed	\N	\N	2026-01-31 09:30:42.549485	2026-01-31 09:30:42.54949	2026-01-31 09:58:27.767861	f
523	17	226	24	f	Assigned	\N	\N	2026-01-31 10:01:36.798761	2026-01-31 10:01:36.798764	2026-01-31 10:01:36.798765	f
524	17	226	28	f	Assigned	\N	\N	2026-01-31 10:01:36.898178	2026-01-31 10:01:36.898183	2026-01-31 10:01:36.898184	f
525	17	226	29	f	Assigned	\N	\N	2026-01-31 10:01:36.938817	2026-01-31 10:01:36.938821	2026-01-31 10:01:36.938822	f
\.


--
-- Data for Name: audit_log_ai; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_log_ai (id, user_id, action_type, table_name, record_id, data, "timestamp") FROM stdin;
47	25	user_login	users	25	{"username": "author01"}	2026-01-29 07:59:44.568469
48	19	user_login	users	19	{"username": "admin"}	2026-01-29 07:59:51.772369
49	19	admin_user_blocked	users	25	{"username": "author01"}	2026-01-29 08:00:02.079305
50	26	user_login	users	26	{"username": "author02"}	2026-01-29 08:01:36.118347
51	19	user_login	users	19	{"username": "admin"}	2026-01-29 08:01:52.947924
52	19	admin_user_unblocked	users	25	{"username": "author01"}	2026-01-29 08:01:57.2561
53	25	user_login	users	25	{"username": "author01"}	2026-01-29 08:10:15.49272
54	19	user_login	users	19	{"username": "admin"}	2026-01-29 08:49:21.407748
55	19	user_login	users	19	{"username": "admin"}	2026-01-29 09:25:56.75211
56	25	user_login	users	25	{"username": "author01"}	2026-01-29 09:26:04.063154
57	19	user_login	users	19	{"username": "admin"}	2026-01-29 09:40:54.345348
58	28	admin_user_created	users	28	{"username": "tamleminhtam437", "roles": ["Reviewer", "Author", "Chair"]}	2026-01-29 09:41:28.010488
59	19	user_login	users	19	{"username": "admin"}	2026-01-29 13:56:32.884331
60	19	user_login	users	19	{"username": "admin"}	2026-01-29 14:08:41.106674
61	19	admin_user_updated	users	28	{"full_name": "L\\u00ea Minh T\\u00e2m", "email": "tamleminhtam437@gmail.com", "organization": "", "roles": ["Author", "Reviewer", "Chair", "Admin"], "is_blocked": false}	2026-01-29 14:27:48.339252
62	19	user_login	users	19	{"username": "admin"}	2026-01-29 14:30:31.207402
63	19	user_login	users	19	{"username": "admin"}	2026-01-29 15:57:22.839684
64	19	admin_user_updated	users	28	{"full_name": "leminhtam", "email": "tamleminhtam437@gmail.com", "organization": "", "roles": ["Admin", "Chair", "Author", "Reviewer"], "is_blocked": false}	2026-01-29 15:58:06.050844
65	19	user_login	users	19	{"username": "admin"}	2026-01-29 16:00:08.512907
66	19	user_login	users	19	{"username": "admin"}	2026-01-29 16:00:38.92798
67	29	user_registered	users	29	{"username": "tamchair", "email": "tamleminhtam734@gmail.com", "full_name": "le minh tam", "roles": ["Chair"]}	2026-01-29 16:01:39.562127
68	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-29 16:01:46.206572
69	19	user_login	users	19	{"username": "admin"}	2026-01-29 16:08:41.577373
70	19	admin_user_updated	users	29	{"full_name": "le minh tam", "email": "tamleminhtam734@gmail.com", "organization": "", "roles": ["Chair", "Admin", "Reviewer", "Author"], "is_blocked": false}	2026-01-29 16:08:51.830995
71	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-29 16:09:08.455926
72	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-29 16:09:45.440244
73	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-30 03:15:25.036898
74	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-30 03:15:48.050766
75	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-30 03:16:03.483255
76	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-30 10:30:29.146117
77	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-30 10:30:36.708205
78	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-30 10:42:07.702655
79	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-30 10:44:25.404245
80	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-30 10:48:59.454424
81	29	user_login	users	29	{"username": "tamchair"}	2026-01-30 11:04:17.136457
82	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-30 13:04:53.527302
83	19	user_login	users	19	{"username": "admin"}	2026-01-30 13:05:11.815656
84	19	user_login	users	19	{"username": "admin"}	2026-01-30 13:07:21.555085
85	30	admin_user_created	users	30	{"username": "tamlm5060", "roles": ["Reviewer", "Chair"]}	2026-01-30 13:08:03.5279
86	30	user_login	users	30	{"username": "tamlm5060@ut.edu.vn"}	2026-01-30 13:08:12.144872
87	19	user_login	users	19	{"username": "admin"}	2026-01-30 13:08:20.148009
88	19	user_login	users	19	{"username": "admin"}	2026-01-30 13:12:03.52141
89	19	user_login	users	19	{"username": "admin"}	2026-01-30 13:14:24.660198
90	19	user_login	users	19	{"username": "admin"}	2026-01-30 13:16:03.703287
91	19	user_login	users	19	{"username": "admin"}	2026-01-30 13:21:43.647182
92	19	user_login	users	19	{"username": "admin"}	2026-01-30 13:35:54.772802
93	31	user_registered	users	31	{"username": "tam2", "email": "tamlm506s0@ut.edu.vn", "full_name": "L\\u00ea Minh T\\u00e2m", "roles": ["Author"]}	2026-01-30 13:36:31.453085
94	31	user_login	users	31	{"username": "tamlm506s0@ut.edu.vn"}	2026-01-30 13:36:36.709237
95	25	user_login	users	25	{"username": "author01"}	2026-01-30 13:41:39.330132
96	22	user_login	users	22	{"username": "reviewer01"}	2026-01-30 13:41:48.534842
97	20	user_login	users	20	{"username": "chair01"}	2026-01-30 13:42:01.745113
98	20	user_login	users	20	{"username": "chair01"}	2026-01-30 13:56:39.917253
99	19	user_login	users	19	{"username": "admin"}	2026-01-30 13:57:38.344863
100	19	admin_user_blocked	users	27	{"username": "author03"}	2026-01-30 13:57:46.635365
101	19	admin_user_unblocked	users	27	{"username": "author03"}	2026-01-30 13:57:50.658987
102	19	admin_conference_deactivated	conferences	16	{"name": "UTH-AI Symposium 2026"}	2026-01-30 14:42:58.04192
103	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-30 14:43:11.053177
104	20	user_login	users	20	{"username": "chair01"}	2026-01-30 14:47:59.032157
105	22	user_login	users	22	{"username": "reviewer01"}	2026-01-30 14:57:40.856596
106	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-30 14:58:32.032778
107	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-30 14:58:49.473147
108	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-30 14:59:02.259868
109	19	user_login	users	19	{"username": "admin"}	2026-01-30 14:59:19.681904
110	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-30 15:16:01.893013
111	25	user_login	users	25	{"username": "author01"}	2026-01-30 15:16:14.06346
112	25	user_login	users	25	{"username": "author01"}	2026-01-30 15:47:23.163809
113	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-30 15:47:28.068274
114	19	user_login	users	19	{"username": "admin"}	2026-01-30 15:47:38.498957
115	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 02:40:57.406921
116	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 03:04:29.481128
117	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 03:09:05.999979
118	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 03:09:19.416867
119	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 03:48:33.578451
120	29	admin_conference_activated	conferences	16	{"name": "UTH-AI Symposium 2026"}	2026-01-31 03:54:34.535886
121	29	admin_conference_created	conferences	18	{"name": "UTH002"}	2026-01-31 04:07:32.366626
122	20	user_login	users	20	{"username": "chair01"}	2026-01-31 04:41:34.991133
123	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 04:41:51.646108
124	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 05:02:24.794704
125	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 05:33:57.306695
126	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 06:19:40.681178
127	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 07:36:03.301376
128	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 07:42:17.259487
129	20	user_login	users	20	{"username": "chair01"}	2026-01-31 07:42:32.228377
130	20	user_login	users	20	{"username": "chair01"}	2026-01-31 07:43:04.283583
131	31	user_login	users	31	{"username": "tamlm506s0@ut.edu.vn"}	2026-01-31 07:47:56.206464
132	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 07:48:05.479102
133	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 07:48:43.206987
134	20	user_login	users	20	{"username": "chair01"}	2026-01-31 07:54:38.18361
135	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 07:57:04.099936
136	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 08:03:29.94691
137	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 08:15:07.498141
138	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 08:59:21.990528
139	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 08:59:31.888749
140	29	decision_made	decisions	86	{"paper_id": 226, "result": "Accept", "paper_title": "b\\u00e0i b\\u00e1o m\\u1edbi 01 31/1 11/45"}	2026-01-31 09:03:52.351607
141	29	decision_updated	decisions	86	{"paper_id": 226, "result": "Accept", "paper_title": "b\\u00e0i b\\u00e1o m\\u1edbi 01 31/1 11/45"}	2026-01-31 09:04:01.750597
142	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 09:23:34.73198
143	29	decision_updated	decisions	86	{"paper_id": 226, "result": "Revision", "paper_title": "b\\u00e0i b\\u00e1o m\\u1edbi 01 31/1 11/45"}	2026-01-31 09:25:23.902124
144	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 09:28:11.465323
145	29	assignment_created	assignments	520	{"paper_id": "225", "reviewer_id": 30, "conference_id": 17}	2026-01-31 09:30:42.504713
146	29	assignment_created	assignments	521	{"paper_id": "225", "reviewer_id": 29, "conference_id": 17}	2026-01-31 09:30:42.714102
147	29	assignment_created	assignments	522	{"paper_id": "225", "reviewer_id": 24, "conference_id": 17}	2026-01-31 09:30:42.802421
148	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 09:57:51.407088
149	29	review_submitted	reviews	398	{"assignment_id": 521, "paper_id": 225, "score": 5}	2026-01-31 09:58:27.846828
150	29	assignment_created	assignments	523	{"paper_id": "226", "reviewer_id": 24, "conference_id": 17}	2026-01-31 10:01:36.826492
151	29	assignment_created	assignments	524	{"paper_id": "226", "reviewer_id": 28, "conference_id": 17}	2026-01-31 10:01:36.907482
152	29	assignment_created	assignments	525	{"paper_id": "226", "reviewer_id": 29, "conference_id": 17}	2026-01-31 10:01:36.945512
153	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 10:05:50.101681
154	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 10:06:36.775594
155	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 10:06:53.006924
156	29	decision_updated	decisions	86	{"paper_id": 226, "result": "Revision", "paper_title": "b\\u00e0i b\\u00e1o m\\u1edbi 01 31/1 11/45"}	2026-01-31 10:37:17.267013
157	29	decision_made	decisions	87	{"paper_id": 225, "result": "Reject", "paper_title": "b\\u00e0i b\\u00e1o m\\u1edbi"}	2026-01-31 10:37:53.233563
158	29	decision_updated	decisions	87	{"paper_id": 225, "result": "Revision", "paper_title": "b\\u00e0i b\\u00e1o m\\u1edbi"}	2026-01-31 10:38:59.285417
159	29	decision_updated	decisions	86	{"paper_id": 226, "result": "Revision", "paper_title": "b\\u00e0i b\\u00e1o m\\u1edbi 01 31/1 11/45"}	2026-01-31 10:45:50.87497
160	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 10:47:54.937377
161	29	decision_updated	decisions	86	{"paper_id": 226, "result": "Accept", "paper_title": "b\\u00e0i b\\u00e1o m\\u1edbi 01 31/1 11/45"}	2026-01-31 10:48:12.201212
162	29	decision_updated	decisions	87	{"paper_id": 225, "result": "Revision", "paper_title": "b\\u00e0i b\\u00e1o m\\u1edbi"}	2026-01-31 10:48:25.163065
163	29	decision_updated	decisions	87	{"paper_id": 225, "result": "Revision", "paper_title": "b\\u00e0i b\\u00e1o m\\u1edbi"}	2026-01-31 10:49:10.71356
164	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 10:56:47.434302
165	29	decision_updated	decisions	87	{"paper_id": 225, "result": "Revision", "paper_title": "b\\u00e0i b\\u00e1o m\\u1edbi"}	2026-01-31 10:57:09.753277
166	29	decision_updated	decisions	87	{"paper_id": 225, "result": "Revision", "paper_title": "b\\u00e0i b\\u00e1o m\\u1edbi"}	2026-01-31 10:57:28.676036
167	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 10:57:46.777675
168	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 10:58:25.240626
169	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 13:35:17.515559
170	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 13:43:28.267908
171	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 13:45:52.844952
172	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 13:50:55.791594
173	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 13:52:08.464844
174	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 13:54:36.065227
175	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 13:55:18.042518
176	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 13:57:30.495144
177	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 13:58:42.122942
178	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 14:09:38.616999
179	29	decision_updated	decisions	87	{"paper_id": 225, "result": "Accept", "paper_title": "b\\u00e0i b\\u00e1o m\\u1edbi"}	2026-01-31 14:13:31.097711
180	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 14:29:24.605779
181	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 14:31:18.521414
182	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 14:32:38.822203
183	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 14:38:04.806039
184	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 14:50:13.316494
185	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 14:50:23.457301
186	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 14:53:21.653754
187	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 14:59:11.798007
188	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 15:00:26.361888
189	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-01-31 15:07:25.665962
222	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 03:14:16.132798
223	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 03:40:35.193219
224	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 03:45:11.268403
225	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 03:45:25.539579
226	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 03:47:06.668318
227	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 09:36:25.325249
228	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 09:37:26.196393
229	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 09:47:25.178149
230	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 09:59:18.609979
231	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 10:01:09.993791
232	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 10:08:25.534004
233	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 10:08:41.211398
234	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 10:08:49.123154
235	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 10:09:17.798515
236	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 10:13:46.805355
237	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 10:13:58.613579
238	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 10:14:40.399873
239	19	user_login	users	19	{"username": "admin"}	2026-02-01 10:18:38.190881
240	25	user_login	users	25	{"username": "author01"}	2026-02-01 10:18:45.714753
241	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 10:18:50.471921
242	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 10:23:33.145267
243	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 10:28:55.70796
244	19	user_login	users	19	{"username": "admin"}	2026-02-01 11:09:11.043486
245	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 11:09:24.815438
246	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 11:48:28.244007
247	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 11:48:56.305502
248	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 11:54:26.378137
249	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 11:55:06.541486
250	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 11:59:17.052989
251	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 12:07:09.150078
252	29	user_login	users	29	{"username": "tamleminhtam734@gmail.com"}	2026-02-01 12:07:37.719795
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, changes, status, error_message, ip_address, user_agent, "timestamp", description) FROM stdin;
1	29	PAPER_SUBMITTED	Paper	225	{"title": "b\\u00e0i b\\u00e1o m\\u1edbi", "conference_id": 17}	success	\N	\N	\N	2026-01-31 04:28:39.183066	\N
2	29	PAPER_SUBMITTED	Paper	226	{"title": "b\\u00e0i b\\u00e1o m\\u1edbi 01 31/1 11/45", "conference_id": 17}	success	\N	\N	\N	2026-01-31 04:42:39.079073	\N
\.


--
-- Data for Name: brow_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brow_history (id, viewer_id, paper_id, old_content, "timestamp") FROM stdin;
\.


--
-- Data for Name: conference_mentors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conference_mentors (id, reviewer_user_id, paper_id, reason, request_date, quota, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: conferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conferences (id, name, description, location, website_url, submission_deadline, review_deadline, decision_deadline, camera_ready_deadline, registration_deadline, conference_start_date, conference_end_date, blind_review_type, max_reviewers_per_paper, min_reviewers_per_paper, chair_id, is_active, is_deleted, created_at, updated_at) FROM stdin;
15	UTH-CS Conference 2026s	International Conference on Computer Science	Cao Lanh City, Dong Thap, Vietnam	https://cs-conf.uth.edu.vn	2026-02-28 00:00:00	2026-03-30 00:00:00	2026-04-14 07:54:18.343078	2026-04-29 07:54:18.343078	2026-05-09 07:54:18.343078	2026-05-29 07:54:18.343078	2026-05-31 07:54:18.343078	double-blind	3	2	20	t	f	2026-01-29 07:54:18.347195	2026-01-29 14:50:31.056795
16	UTH-AI Symposium 2026	Symposium on Artificial Intelligence and Machine Learning	My Tho City, Tien Giang, Vietnam	https://ai-symposium.uth.edu.vn	2026-03-15 00:00:00	2026-04-14 00:00:00	2026-04-29 07:54:18.343078	2026-05-14 07:54:18.343078	2026-05-24 07:54:18.343078	2026-06-13 07:54:18.343078	2026-06-15 07:54:18.343078	single-blind	4	3	28	t	f	2026-01-29 07:54:18.347199	2026-01-31 03:54:34.508698
17	UTH001	s	Khoa CĂ´ng nghá»‡ thĂ´ng tin		2026-03-31 23:59:59	2026-02-10 11:11:00	2026-03-01 11:11:00	\N	\N	2026-01-20 00:00:00	\N	double-blind	3	2	28	t	f	2026-01-30 14:00:24.257314	2026-01-30 14:00:24.262787
18	UTH002	s	Khoa CĂ´ng nghá»‡ thĂ´ng tin		2026-01-31 14:00:00	2026-03-01 11:11:00	\N	\N	\N	\N	\N	double-blind	3	2	29	t	f	2026-01-31 04:07:32.328787	2026-01-31 09:28:42.69994
\.


--
-- Data for Name: conflict_of_interest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conflict_of_interest (id, conference_id, paper_id, reviewer_id, reason, created_at) FROM stdin;
\.


--
-- Data for Name: decisions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.decisions (id, paper_id, conference_id, chair_user_id, result, final_comment, name, code, description, created_at, updated_at, is_deleted) FROM stdin;
86	226	17	29	Accept	KĂ­nh gá»­i tĂ¡c giáº£,\n\nHá»™i Ä‘á»“ng chÆ°Æ¡ng trĂ¬nh Ä‘Ă£ xem xĂ©t ká»¹ lÆ°á»¡ng bĂ i bĂ¡o cá»§a quĂ½ vá»‹ vĂ  ráº¥t vui má»«ng thĂ´ng bĂ¡o ráº±ng bĂ i bĂ¡o Ä‘Ă£ Ä‘Æ°á»£c CHáº¤P NHáº¬N Ä‘á»ƒ cĂ´ng bá»‘ táº¡i há»™i nghá»‹.\n\nCĂ¡c Ă½ kiáº¿n Ä‘Ă³ng gĂ³p tá»« pháº£n biá»‡n Ä‘Ă£ Ä‘Æ°á»£c tá»•ng há»£p vĂ  gá»­i kĂ¨m theo. Vui lĂ²ng xem xĂ©t cĂ¡c gĂ³p Ă½ nĂ y khi hoĂ n thiá»‡n báº£n Camera-ready.\n\nVui lĂ²ng ná»™p báº£n Camera-ready trÆ°á»›c ngĂ y [deadline] theo hÆ°á»›ng dáº«n Ä‘Ă­nh kĂ¨m.\n\nTrĂ¢n trá»ng,\nBan ChÆ°Æ¡ng TrĂ¬nh	\N	\N	\N	2026-01-31 09:03:52.315649	2026-01-31 10:48:12.16714	f
87	225	17	29	Revision	KĂ­nh gá»­i tĂ¡c giáº£,\n\nSau khi xem xĂ©t Ă½ kiáº¿n tá»« Há»™i Ä‘á»“ng pháº£n biá»‡n, bĂ i bĂ¡o cá»§a quĂ½ vá»‹ cáº§n Ä‘Æ°á»£c CHá»ˆNH Sá»¬A trÆ°á»›c khi cĂ³ thá»ƒ Ä‘Æ°á»£c cháº¥p nháº­n.\n\nCĂ¡c váº¥n Ä‘á» cáº§n giáº£i quyáº¿t:\n[Liá»‡t kĂª cĂ¡c yĂªu cáº§u chĂ­nh tá»« reviewers]\n\nVui lĂ²ng ná»™p báº£n chá»‰nh sá»­a kĂ¨m theo giáº£i trĂ¬nh (Response to Reviewers) trÆ°á»›c ngĂ y [deadline].\n\nTrĂ¢n trá»ng,\nBan ChÆ°Æ¡ng TrĂ¬nh	\N	\N	\N	2026-01-31 10:37:53.189779	2026-02-01 11:45:15.505638	f
\.


--
-- Data for Name: email_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_logs (id, idempotency_key, recipient_email, subject, body, email_type, related_entity_type, related_entity_id, user_id, status, retry_count, max_retries, last_error, created_at, sent_at) FROM stdin;
1	b11b89a232e0a3ca3d752bb6a7e6789a	tamleminhtam734@gmail.com	Káº¿t quáº£ quyáº¿t Ä‘á»‹nh - bĂ i bĂ¡o má»›i...	\n                        Xin chĂ o le minh tam,\n                        \n                        Káº¿t quáº£ quyáº¿t Ä‘á»‹nh cho bĂ i bĂ¡o cá»§a báº¡n:\n                        \n                        TiĂªu Ä‘á»: bĂ i bĂ¡o má»›i\n                        Káº¿t quáº£: CHáº¤P NHáº¬N\n                        \n                        Nháº­n xĂ©t: KĂ­nh gá»­i tĂ¡c giáº£,\n\nHá»™i Ä‘á»“ng chÆ°Æ¡ng trĂ¬nh Ä‘Ă£ xem xĂ©t ká»¹ lÆ°á»¡ng bĂ i bĂ¡o cá»§a quĂ½ vá»‹ vĂ  ráº¥t vui má»«ng thĂ´ng bĂ¡o ráº±ng bĂ i bĂ¡o Ä‘Ă£ Ä‘Æ°á»£c CHáº¤P NHáº¬N Ä‘á»ƒ cĂ´ng bá»‘ táº¡i há»™i nghá»‹.\n\nCĂ¡c Ă½ kiáº¿n Ä‘Ă³ng gĂ³p tá»« pháº£n biá»‡n Ä‘Ă£ Ä‘Æ°á»£c tá»•ng há»£p vĂ  gá»­i kĂ¨m theo. Vui lĂ²ng xem xĂ©t cĂ¡c gĂ³p Ă½ nĂ y khi hoĂ n thiá»‡n báº£n Camera-ready.\n\nVui lĂ²ng ná»™p báº£n Camera-ready trÆ°á»›c ngĂ y [deadline] theo hÆ°á»›ng dáº«n Ä‘Ă­nh kĂ¨m.\n\nTrĂ¢n trá»ng,\nBan ChÆ°Æ¡ng TrĂ¬nh\n                        \n                        Vui lĂ²ng Ä‘Äƒng nháº­p vĂ o há»‡ thá»‘ng Ä‘á»ƒ xem chi tiáº¿t.\n                        \n                        TrĂ¢n trá»ng,\n                        Ban tá»• chá»©c há»™i nghá»‹\n                        	DECISION	Paper	225	29	sent	0	3	\N	2026-01-31 14:13:26.703504	2026-01-31 14:13:31.082057
\.


--
-- Data for Name: feature_flags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feature_flags (id, conference_id, feature_name, enabled, config, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: la_umcauthres; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.la_umcauthres (id, paper_id, sender_domain_id, content, upload_cache_uid, "timestamp", foreign_key) FROM stdin;
\.


--
-- Data for Name: paper_authors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paper_authors (id, paper_id, user_id, author_order, is_corresponding, affiliation, guest_name, guest_email) FROM stdin;
334	224	28	1	t	UTH	\N	\N
335	225	28	1	t	UTH	\N	\N
336	226	28	1	t	UTH	\N	\N
331	221	25	1	t	\N	\N	\N
332	222	26	1	t	\N	\N	\N
333	223	27	1	t	\N	\N	\N
\.


--
-- Data for Name: papers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.papers (id, title, abstract, keywords, pdf_path, camera_ready_path, status, is_withdrawn, submitter_id, conference_id, track_id, created_at, updated_at) FROM stdin;
224	bĂ i bĂ¡o má»›i	má»™t hai ba bá»‘n nÄƒm sĂ¡u báº£y tĂ¡m chĂ­n mÆ°á»i	Machine Learning	uploads/papers/paper_224_UTHcnpm.pdf	\N	SUBMITTED	f	29	17	\N	2026-01-31 04:25:10.593295	2026-01-31 04:25:11.364593
225	bĂ i bĂ¡o má»›i	má»™t hai ba bá»‘n nÄƒm sĂ¡u báº£y tĂ¡m chĂ­n mÆ°á»i	Machine Learning	uploads/papers/paper_225_UTHcnpm.pdf	\N	UNDER_REVIEW	f	29	17	\N	2026-01-31 04:28:38.598767	2026-01-31 14:29:43.448176
226	bĂ i bĂ¡o má»›i 01 31/1 11/45	má»™t ahi ba bá»‘n náº¯m sĂ¡u báº£y tĂ¡m chĂ­n má»i	Machine Learning	uploads/papers/paper_226_UTHcnpm.pdf	\N	ACCEPTED	f	29	17	\N	2026-01-31 04:42:38.502782	2026-01-31 10:48:12.185547
221	Deep Learning for Image Classification	This paper presents a novel approach to image classification using deep convolutional neural networks...	deep learning, CNN, image classification	uploads/papers/paper1.pdf	\N	SUBMITTED	f	25	15	67	2026-01-29 07:54:18.406009	2026-01-29 07:54:18.406013
222	Agile Software Development Practices	We explore modern agile practices and their impact on software quality...	agile, scrum, software engineering	uploads/papers/paper2.pdf	\N	UNDER_REVIEW	f	26	15	68	2026-01-29 07:54:18.412372	2026-01-29 07:54:18.412376
223	Transformer Models for Vietnamese NLP	This research introduces improvements to transformer architectures for Vietnamese language processing...	NLP, transformers, Vietnamese	uploads/papers/paper3.pdf	\N	SUBMITTED	f	27	16	71	2026-01-29 07:54:18.422585	2026-01-29 07:54:18.422589
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token, token_hash, is_revoked, expires_at, created_at, ip_address, user_agent) FROM stdin;
45	25	xEDduPLILfr1HGsKTBjA05FNAoTLOdlhQLytbnJeI_Q	\N	f	2026-02-05 07:59:44.620515	2026-01-29 07:59:44.631127	\N	\N
46	19	loshkOlpLt9o_mHQQ9EL1H3OHnH9UYmkpYAQbTu94Ow	\N	f	2026-02-05 07:59:51.78307	2026-01-29 07:59:51.78346	\N	\N
47	26	X2On5A5RMy39bc5gxfQblxthZZN0BRFsvJdDiKYUwlg	\N	f	2026-02-05 08:01:36.146229	2026-01-29 08:01:36.14751	\N	\N
48	19	TI0P3vikJHRhvB75bo4xzm38z66L9l6MtvkUHnc-sks	\N	f	2026-02-05 08:01:52.965064	2026-01-29 08:01:52.965594	\N	\N
49	25	TYKo6DW7HufMl31E2ubH8FJOmeGktOIDEMyO6xyyr5k	\N	f	2026-02-05 08:10:15.559073	2026-01-29 08:10:15.560517	\N	\N
50	19	UQYDxRx4um8xPfKhQ1YTJiGJ24m0jYMaJMOtAVXBrhU	\N	f	2026-02-05 08:49:21.524735	2026-01-29 08:49:21.527919	\N	\N
51	19	X-3GF43KqZWIKmLjlVrXj77mnWgvPsyxDramZNYMs-A	\N	f	2026-02-05 09:25:56.849222	2026-01-29 09:25:56.851137	\N	\N
52	25	yBqmKsC1jawTyTSIFCVUCTejWd7qeI33d4XVx_h0eSs	\N	f	2026-02-05 09:26:04.113125	2026-01-29 09:26:04.113896	\N	\N
53	19	_e1DDeOSWh3c0XzBzHoLJ5fFkZOJg4ugXqZ8Z48xx-0	\N	f	2026-02-05 09:40:54.419927	2026-01-29 09:40:54.422227	\N	\N
54	19	TKaYlpu5cpVD5wUfGfwLu0O4w0ob9OIBsiQyBdFpoGg	\N	f	2026-02-05 13:56:32.989089	2026-01-29 13:56:32.991486	\N	\N
55	19	hv2_n9MqnIrNDxDuhVa5huK9zA2B5hFtGJ9PnosvsQs	\N	f	2026-02-05 14:08:41.160271	2026-01-29 14:08:41.162133	\N	\N
56	19	M3BfuIkOpoCyhEKEUmttmZyH7CHAsovX1WIjuCm8o_M	\N	f	2026-02-05 14:30:31.225808	2026-01-29 14:30:31.228222	\N	\N
57	19	5vpSnE_itNL4HsD8kHlcofsIbruO3Rz601WuVVtKl88	\N	f	2026-02-05 15:57:22.952165	2026-01-29 15:57:22.954943	\N	\N
58	19	kKuQEoLHz2lmUTeLzImSUUDk8VeoNKF497cLeCZ_kD0	\N	f	2026-02-05 16:00:08.552629	2026-01-29 16:00:08.553745	\N	\N
59	19	zPC1ZsqjNWt86GaFPC2q4JY5-TNcnquz5UoZazSo63E	\N	f	2026-02-05 16:00:38.948869	2026-01-29 16:00:38.950114	\N	\N
60	29	NGrqNPjfJzaum3fCsf7oOKyp7DHTDU7yU08GTHxQD40	\N	f	2026-02-05 16:01:39.599134	2026-01-29 16:01:39.599898	\N	\N
61	29	Zi_1eOyu9C7_4zc6Zy1g_qQ_jAwnd-nlrY9FP51uS3I	\N	f	2026-02-05 16:01:46.226027	2026-01-29 16:01:46.226643	\N	\N
62	19	mxgnwpmWhfmgp_x8gCtSCsog8p72av7YzhmOuP8buj4	\N	f	2026-02-05 16:08:41.666911	2026-01-29 16:08:41.669596	\N	\N
63	29	OahPhVztjnCgV6VhjRIc7CA_j7p0cfGx_cKQA4w-3Ks	\N	f	2026-02-05 16:09:08.470837	2026-01-29 16:09:08.471871	\N	\N
64	29	Ag-iq89qCTnhw4qatiko58zijWO528VamaU0aKS0dz8	\N	f	2026-02-05 16:09:45.467556	2026-01-29 16:09:45.46854	\N	\N
65	29	Myt7iSqHBAvBaOm2ErNNXt6MYFklP2GzLHhDiPP-tPU	\N	f	2026-02-06 03:15:25.150973	2026-01-30 03:15:25.154263	\N	\N
66	29	syfn6Ml3Y0kRx0TX9R0Q-c4Ir19fDWYVUCn1sHHPj9k	\N	f	2026-02-06 03:15:48.068666	2026-01-30 03:15:48.069365	\N	\N
67	29	iujLDbWG7mE65I2JDfFohqNSNN_OJQBgnOnoXUYMmtM	\N	f	2026-02-06 03:16:03.496371	2026-01-30 03:16:03.497134	\N	\N
68	29	Ofu0BcI3phnQ2vP3_zbJD3-B4nR4TcsgtF18hbMeEhc	\N	f	2026-02-06 10:30:29.183728	2026-01-30 10:30:29.185478	\N	\N
69	29	JGei0WS4hHNgPboydFI5H-goUG2OtIz7meR_v38WzM4	\N	f	2026-02-06 10:30:36.719665	2026-01-30 10:30:36.720048	\N	\N
70	29	VsCjmzA_4x9ihHrH3udeApaAYaSYdT5Zm36qdq_5qhA	\N	f	2026-02-06 10:42:07.732124	2026-01-30 10:42:07.733587	\N	\N
71	29	kUguNQREyMqxHtis6Wr2qa-aElBkyUSSHjU8Ia8uOCg	\N	f	2026-02-06 10:44:25.438182	2026-01-30 10:44:25.439073	\N	\N
72	29	lnCmjhSePGULTfzdDepL2tS7_X06SVC5vrVkUZrl0nM	\N	f	2026-02-06 10:48:59.471369	2026-01-30 10:48:59.471895	\N	\N
73	29	ZHo3KE89nnKDEtwXKEdZJBWl3Aw8EYQV2yFgWAN-9eo	\N	f	2026-02-06 11:04:17.17813	2026-01-30 11:04:17.180245	\N	\N
74	29	FYGdm3L0AJhW2_7lZES-IckI0zkZecwoI6c6HiC4mfY	\N	f	2026-02-06 13:04:53.583243	2026-01-30 13:04:53.584204	\N	\N
75	19	_LnFmM6t0VkqAVgpGOtwbDb45LCEGl69h6IfM_bbNNs	\N	f	2026-02-06 13:05:11.828326	2026-01-30 13:05:11.828808	\N	\N
76	19	iuk7OVPeomRC2BY8EQwL4ShXP3cvAgwOa4YBq1BWOxM	\N	f	2026-02-06 13:07:21.566603	2026-01-30 13:07:21.567152	\N	\N
77	30	PlJBvzjbYE05NKmlPyNLYzQUwcPzyukESPmTAPTjafM	\N	f	2026-02-06 13:08:12.152977	2026-01-30 13:08:12.153328	\N	\N
78	19	Opi5_zLvTUiz6fOszqnOgCu2Ivnmw_j1guPYjnBJBUc	\N	f	2026-02-06 13:08:20.155039	2026-01-30 13:08:20.15536	\N	\N
79	19	DywwUg4QsLlrh9tyoT1hRpeLKfdYxK5BWCGerEWtma4	\N	f	2026-02-06 13:12:03.530095	2026-01-30 13:12:03.530447	\N	\N
80	19	V0BFANNoID84XoypzLG9fuBgAmxSbiyWu424N60pEJc	\N	f	2026-02-06 13:14:24.694182	2026-01-30 13:14:24.695826	\N	\N
81	19	dFdm2ZlG1R2APCE3cKj-84N5hCNbr-eKeMzwD9GEBUo	\N	f	2026-02-06 13:16:03.712201	2026-01-30 13:16:03.712651	\N	\N
82	19	z0_2MYDVd9vmXNbxcaewMEhGoJQMX3h3HVVSK_MXi-Y	\N	f	2026-02-06 13:21:43.656402	2026-01-30 13:21:43.656735	\N	\N
83	19	Gph1paBb-VCmymX1w7kMdVzlInP3e6V_RKQl3nu-GsY	\N	f	2026-02-06 13:35:54.813805	2026-01-30 13:35:54.81664	\N	\N
84	31	cD41IymMb8yKHbZbrBG36IkmpN7L7Jo3Q6k7kwVWHMs	\N	f	2026-02-06 13:36:31.468702	2026-01-30 13:36:31.46908	\N	\N
85	31	C9Ain30d7ysdirZI3x0iOmvOFEV5BIcgtm8AOnzqJo4	\N	f	2026-02-06 13:36:36.720043	2026-01-30 13:36:36.720414	\N	\N
86	25	_n190iHbdroZWFEJHDMetgJr3UsfUB4n9kn9hgqFtAY	\N	f	2026-02-06 13:41:39.365677	2026-01-30 13:41:39.366499	\N	\N
87	22	f1ulcn-y0qaLW-cErjAiqsru2lL6gSgcDgWBW1pu_Y4	\N	f	2026-02-06 13:41:48.547977	2026-01-30 13:41:48.548602	\N	\N
88	20	u7pfpdYprwxu-L7F3kE9d1Y8sMuzTUoiXHcjiU7eSc0	\N	f	2026-02-06 13:42:01.754447	2026-01-30 13:42:01.754806	\N	\N
89	20	iYDJRuhtTANTer1VJOhlY8zk8J6L694NADyVgKjcx8A	\N	f	2026-02-06 13:56:39.935513	2026-01-30 13:56:39.93706	\N	\N
90	19	HFq0z-mg0xmkA2gl9dyYyDt9KY-vrsWg1dsqR-M9MH8	\N	f	2026-02-06 13:57:38.35496	2026-01-30 13:57:38.355369	\N	\N
91	29	FmfCIkQHtQ-56GiIvAJPIk66WDv__ew0XNyN_AMoSh8	\N	f	2026-02-06 14:43:11.064714	2026-01-30 14:43:11.066515	\N	\N
92	20	Vk-SVkL_RkC5DC9h8TVIv898iMi0ohsO5WhfB0D8WOY	\N	f	2026-02-06 14:47:59.042195	2026-01-30 14:47:59.042641	\N	\N
93	22	7rd3VJDVww139fdibHIwZpVJQtPRwTXewN3txV6ZwbU	\N	f	2026-02-06 14:57:40.868628	2026-01-30 14:57:40.869132	\N	\N
94	29	XPyGJlTBKJGSicZoqANHAJ1fXUDJ-2aDrRVPd9-cibc	\N	f	2026-02-06 14:58:32.043883	2026-01-30 14:58:32.044377	\N	\N
95	29	jdA4qil5efDCBC0LRFop92rbHeT8lfIQozgCbYHurmk	\N	f	2026-02-06 14:58:49.483621	2026-01-30 14:58:49.484044	\N	\N
96	29	uypEUGkNqhJfHDA7qU42WSYSfYAA4Fjq-U0NVA_uaFE	\N	f	2026-02-06 14:59:02.269354	2026-01-30 14:59:02.269735	\N	\N
97	19	h30s6Z_Bw229s9D-7aMa6qEqzdMD-xGknZ7yCqc77fk	\N	f	2026-02-06 14:59:19.690274	2026-01-30 14:59:19.690617	\N	\N
98	29	thEcWnoFDPlK07SQjuw1eENiJGN_sR9w5nEcHI9Ihaw	\N	f	2026-02-06 15:16:01.928626	2026-01-30 15:16:01.929477	\N	\N
99	25	swQtjVA2SC_O3Ku2D30pX3dG-a1u_G5MYwzKp5jNMcI	\N	f	2026-02-06 15:16:14.076029	2026-01-30 15:16:14.076379	\N	\N
100	25	WyRHUjqw3SacBxtidzOV6m4Z9pql7kpE0dnJdzywKnQ	\N	f	2026-02-06 15:47:23.203613	2026-01-30 15:47:23.204981	\N	\N
101	29	PK5N_SUXyIYm62flFz5chyftA3by5kYF5QDHQ_IX5bc	\N	f	2026-02-06 15:47:28.088216	2026-01-30 15:47:28.088571	\N	\N
102	19	-lS-oD_gQhn7pd2G5l6BYOHeVwKQGvzquv7C1bMCMbs	\N	f	2026-02-06 15:47:38.512505	2026-01-30 15:47:38.512883	\N	\N
103	29	o8i30vy69kL_F7i-XU0LfOe3DAu1I1Vu4B6lqlhKsqQ	\N	f	2026-02-07 02:40:57.482198	2026-01-31 02:40:57.485878	\N	\N
104	29	YGYuLuevqaDQRkl4YK16Xf74rgIdKZyOycZxIkqReS8	\N	f	2026-02-07 03:04:29.538054	2026-01-31 03:04:29.539659	\N	\N
105	29	gJGNWHecJRv_KzsuL_CPNPIF0sUkphijW8zj-GSTeVM	\N	f	2026-02-07 03:09:06.041177	2026-01-31 03:09:06.043693	\N	\N
106	29	8kWrsZ6RJWKZ0kgHYfmCEAL5nNVu6TdU1XQ-48LC0lo	\N	f	2026-02-07 03:09:19.442046	2026-01-31 03:09:19.442739	\N	\N
107	29	zjggKK6WfgHbCFvcz_yo0_OaPR9Vp0McNt0ueKA-zls	\N	f	2026-02-07 03:48:33.595948	2026-01-31 03:48:33.596694	\N	\N
108	20	q7YmkXMAOZvX-fWYVEP6F6pMgZ1kUwBHVx3ZSuYAQFg	\N	f	2026-02-07 04:41:35.014723	2026-01-31 04:41:35.017249	\N	\N
109	29	XwVXibFNgJZWTnh99ksL2IjpPzbr_ZN4HDeN3_Ny6kY	\N	f	2026-02-07 04:41:51.658447	2026-01-31 04:41:51.659269	\N	\N
110	29	HL-mfTOilDbyfJiEig93-_aO-y1-c8oJGBYFnpvE2Ng	\N	f	2026-02-07 05:02:24.86202	2026-01-31 05:02:24.863937	\N	\N
111	29	i_UF9BiYcWCGzcuH6i8-mNEnjNrvmlSldY-RoxcaTBo	\N	f	2026-02-07 05:33:57.337068	2026-01-31 05:33:57.338472	\N	\N
112	29	y5MK4D5uo0UtNHAnMEpSsnnexi6s-3sQOMru7JKiuok	\N	f	2026-02-07 06:19:40.725634	2026-01-31 06:19:40.728143	\N	\N
113	29	WyV8MBT3HInVfaMsqbhfxjhD-ipSvKj-RCWaLPCP1Fc	\N	f	2026-02-07 07:36:03.335522	2026-01-31 07:36:03.337334	\N	\N
114	29	onT2LAOmnDshGgZ9pwOKl2zkxekYKiKoRXNJwWaL5V4	\N	f	2026-02-07 07:42:17.304162	2026-01-31 07:42:17.305535	\N	\N
115	20	YN3Dx_vFMBVUwdpqYYE51A67CfPq_8euCB023AhDQmc	\N	f	2026-02-07 07:42:32.239513	2026-01-31 07:42:32.240228	\N	\N
116	20	vRr4kzSIUA2Fu02tVmPyZ5rAJ3QTSf0acVKkfKVXg6M	\N	f	2026-02-07 07:43:04.307236	2026-01-31 07:43:04.308756	\N	\N
117	31	vrB4kHoqPvVPLtvmvJD7M0Nn_qFKxtukpG_RGGB3WBs	\N	f	2026-02-07 07:47:56.220213	2026-01-31 07:47:56.220673	\N	\N
118	29	4lCoNfIiTvjgG2x1as0CPtR1udDCqzjENAhfkk8pyAk	\N	f	2026-02-07 07:48:05.49156	2026-01-31 07:48:05.492217	\N	\N
119	29	0gitkCiztIqrWqDLfHjoTjx0lxavIoKjEmTtzUkVgDI	\N	f	2026-02-07 07:48:43.216743	2026-01-31 07:48:43.217092	\N	\N
120	20	ITGmgwHX7ps7v0gGDIKmwqBSapJj_Hz_idRCfFjnkKw	\N	f	2026-02-07 07:54:38.198173	2026-01-31 07:54:38.199418	\N	\N
121	29	nflfhQy9RA-7BLGawA_lpxtYebFqnU1LKwUugg8u6mI	\N	f	2026-02-07 07:57:04.112201	2026-01-31 07:57:04.112602	\N	\N
122	29	y380nG7h_p6qWPyK-1-sbMTvghsTeJ9CjIxZW1iwHx8	\N	f	2026-02-07 08:03:29.956505	2026-01-31 08:03:29.957125	\N	\N
123	29	bMkPm9485rSjsHLs6nqhDyFSUxFI9tmbsGJV9wUqMmo	\N	f	2026-02-07 08:15:07.524982	2026-01-31 08:15:07.526189	\N	\N
124	29	bzl8TgLEwDwHgbpA5DutZO_CfIn0BQ8ht3V7W7o2bWM	\N	f	2026-02-07 08:59:22.02745	2026-01-31 08:59:22.028872	\N	\N
125	29	1c870EqxCq5MjrJL3LYQz4G8Crr8I1r38MepyJ5QrZU	\N	f	2026-02-07 08:59:31.904099	2026-01-31 08:59:31.904672	\N	\N
126	29	LIb1trFSZZM9lCpNbCCDOuyw3BUHvOA-_XNPAkwP_GY	\N	f	2026-02-07 09:23:34.767248	2026-01-31 09:23:34.76847	\N	\N
127	29	3R7_E5RYUoXOg9IDSbmAzk1JT6Te2256dTKJh7yY04w	\N	f	2026-02-07 09:28:11.505113	2026-01-31 09:28:11.506342	\N	\N
128	29	SbA9yIqFKvwsh_E6xb2kRcyh-qcuX7IhLsN3SJfangU	\N	f	2026-02-07 09:57:51.550982	2026-01-31 09:57:51.578925	\N	\N
129	29	EdiFmuK00prwFh-woFYaASHkPNt2Q96muBTqtAZByQk	\N	f	2026-02-07 10:05:50.15253	2026-01-31 10:05:50.153809	\N	\N
130	29	Klk2m9b28hd3XzBRyAsGSfayp_v-HVhBFepWhhsP13s	\N	f	2026-02-07 10:06:36.839761	2026-01-31 10:06:36.840279	\N	\N
131	29	lzFDDH1fQ4ukK92WS9JpjNgs2Dp5Q2pfmARUp62EY3s	\N	f	2026-02-07 10:06:53.028939	2026-01-31 10:06:53.029321	\N	\N
132	29	IbBoqy5nta6AGuig6rf1y1og85-d_pyMN_qIhbfaNIM	\N	f	2026-02-07 10:47:54.953869	2026-01-31 10:47:54.963291	\N	\N
133	29	SqreBlDygNx7hYNnbbuzCqaLE2e5VGnaGsmEhzJ_lbA	\N	f	2026-02-07 10:56:47.596974	2026-01-31 10:56:47.600808	\N	\N
134	29	ahU5U_weIF72g67Fa2wLAqTz9FkQ5OvhXIMhuKU_J84	\N	f	2026-02-07 10:57:46.794562	2026-01-31 10:57:46.795114	\N	\N
135	29	S2026BlD7APqFdlYFthyCuCCIh1wBMGvJfTST8XvU8w	\N	f	2026-02-07 10:58:25.270299	2026-01-31 10:58:25.2716	\N	\N
136	29	EtnETsx8DMMYcc_v_UqOE6xd2xpE1bydY1p5VekTKFU	\N	f	2026-02-07 13:35:17.565369	2026-01-31 13:35:17.566327	\N	\N
137	29	AwkgXOLG3EX1BGLjxSy8LGE_oY_H8dxjPB_nM-imRUw	\N	f	2026-02-07 13:43:28.292101	2026-01-31 13:43:28.29298	\N	\N
138	29	a4W54mKtCL4SijzycxXkWfhLtLjw8PDjj0engIWfQwU	\N	f	2026-02-07 13:45:52.858852	2026-01-31 13:45:52.859305	\N	\N
139	29	heBRHnEMJciPxG-2E2EcERM3MQyeJUj36eCrfZTk_Ss	\N	f	2026-02-07 13:50:55.848452	2026-01-31 13:50:55.849644	\N	\N
140	29	BvS9s7_Dr194EjVzlbdP6z-g4bUrccuuT-tLOgcJC9o	\N	f	2026-02-07 13:52:08.478158	2026-01-31 13:52:08.478858	\N	\N
141	29	U13ykgOwpm0q_YZ-uTpBDlQMh4BON-sXiFconqq7XRY	\N	f	2026-02-07 13:54:36.091062	2026-01-31 13:54:36.091967	\N	\N
142	29	5VCDZ2LeluvVItApq0A3wuyoIGrmH0LKcfzNwEQFowU	\N	f	2026-02-07 13:55:18.073924	2026-01-31 13:55:18.075171	\N	\N
143	29	sdXaqYDFKRTwV9vrYIIKS7jwFEZhYS1BNJZMHeVm2wI	\N	f	2026-02-07 13:57:30.507649	2026-01-31 13:57:30.508257	\N	\N
144	29	ye-WYNV3XeG2kfZvuSWNGMIx6-VdexGdq0IKZGW51Fg	\N	f	2026-02-07 13:58:42.144003	2026-01-31 13:58:42.145305	\N	\N
145	29	MtoOn17zpHlkXqWhvlNepiAMAIy8my1e8wlR1shzVdk	\N	f	2026-02-07 14:09:38.635284	2026-01-31 14:09:38.636729	\N	\N
146	29	8hD_2BuFyQtaNDXQhsd1FLGOTUCJkSznJLuzjv9tfWw	\N	f	2026-02-07 14:29:24.659728	2026-01-31 14:29:24.6609	\N	\N
147	29	ve9AnXArIhR9GOLxtyciFYpKxXEew1woKqh-2c6M8jI	\N	f	2026-02-07 14:31:18.535304	2026-01-31 14:31:18.535798	\N	\N
148	29	5kpf1XeFc3zesAQG72vMolE4vbyx_c0vRzk50C6b94w	\N	f	2026-02-07 14:32:38.869176	2026-01-31 14:32:38.870443	\N	\N
149	29	2yb0n1Rvvj0PE8UeL59vyqigMctF_lPitu19Mp_WR_Q	\N	f	2026-02-07 14:38:04.8281	2026-01-31 14:38:04.829364	\N	\N
150	29	I3f0rif5KYHcNXCfqXY8xkm6NrMVZNmrpZ8oJMKMSi4	\N	f	2026-02-07 14:50:13.344929	2026-01-31 14:50:13.34644	\N	\N
151	29	_33ybJH00BC_i-GK6oY2Rtvhpem-4eq7RJw2aDMU_eE	\N	f	2026-02-07 14:50:23.475331	2026-01-31 14:50:23.476166	\N	\N
152	29	RHNn-T42IJ6jb3X1LdTvamf1IvwWYwsSB92_EtHC4Tc	\N	f	2026-02-07 14:53:21.683836	2026-01-31 14:53:21.685246	\N	\N
153	29	WFawYpmg7MIdlfrjWzisjOjk4iXG70V8jYNKd-kLgBQ	\N	f	2026-02-07 14:59:11.832298	2026-01-31 14:59:11.833726	\N	\N
154	29	MfItxUrV6WofMetT0zQ3bmPQwQxrj4TDnVzBUDumgzk	\N	f	2026-02-07 15:00:26.386748	2026-01-31 15:00:26.388051	\N	\N
155	29	8OICNFRAB5bIr3h5lQ9HDbTQvmipmuaPW3Oaf9cZdNE	\N	f	2026-02-07 15:07:25.697047	2026-01-31 15:07:25.698854	\N	\N
188	29	7RIeXvK65QAJOfaQIp91JjY5_PI-hg9ZKjKV7cH2SYY	\N	f	2026-02-08 03:14:16.149289	2026-02-01 03:14:16.150205	\N	\N
189	29	S-zZvqY5FAbU9Sa89_eYWe4k95JlLkOPHqMHhVDbQyM	\N	f	2026-02-08 03:40:35.278275	2026-02-01 03:40:35.280516	\N	\N
190	29	O-PvLRrHXR7TdrwW9hEXQL_59y0JG8qixfyqKspmzNU	\N	f	2026-02-08 03:45:11.313133	2026-02-01 03:45:11.315296	\N	\N
191	29	DLKbisnko_BpZ2WbuDPTUiQk9L0vgeI9k_9GyyS0RvU	\N	f	2026-02-08 03:45:25.557707	2026-02-01 03:45:25.558239	\N	\N
192	29	J7whEa4J5-a_h2ofSgZuddipc-YLPm0IUO_-iXsiCzw	\N	f	2026-02-08 03:47:06.681911	2026-02-01 03:47:06.682553	\N	\N
193	29	rExzSHQuaWLcvgNi5HrYijIFv7S3VUOhdlbz9cCVaX8	\N	f	2026-02-08 09:36:25.382709	2026-02-01 09:36:25.384655	\N	\N
194	29	YjGORbq-GOnLctSKLS7jTXbg20U5NjtGcfN81CpYnV4	\N	f	2026-02-08 09:37:26.268389	2026-02-01 09:37:26.269967	\N	\N
195	29	4SoWgzsCVyjhihiwLWlJqkCTTFFzT7SpuqnwpZbCIfA	\N	f	2026-02-08 09:47:25.26591	2026-02-01 09:47:25.267346	\N	\N
196	29	CN3TwGKU-SEUubFWTT6cpDCIoAEAfzjaNr8MEp0mzmE	\N	f	2026-02-08 09:59:18.647599	2026-02-01 09:59:18.648249	\N	\N
197	29	C3LilQtOkyf0vAcZp_pqdjcZ6Lh_oe-r_4cvOVO2eZI	\N	f	2026-02-08 10:01:10.02163	2026-02-01 10:01:10.022321	\N	\N
198	29	tT5XpqSyMeMEncF4s4ijSZCwL3zheKlsNba2E_2B2oc	\N	f	2026-02-08 10:08:25.641716	2026-02-01 10:08:25.6424	\N	\N
199	29	M4AZyW1hwOtE4nmQt2YQcoUCAw5gFs3Zry97Xvq8lyQ	\N	f	2026-02-08 10:08:41.240567	2026-02-01 10:08:41.241534	\N	\N
200	29	CqwFXv7vRKPnCl9lqQlJw-i35HbF_93dGGKgRiYB2vE	\N	f	2026-02-08 10:08:49.161306	2026-02-01 10:08:49.162284	\N	\N
201	29	uitvVurjS1PizetyFN7mv1KNG5rl8oMrV7h6-EYchBg	\N	f	2026-02-08 10:09:17.836849	2026-02-01 10:09:17.837949	\N	\N
202	29	9Snp1MNhd2oSboZyhbhWzhUxH_hfuMdIBb4tOw_AwKI	\N	f	2026-02-08 10:13:46.863467	2026-02-01 10:13:46.864968	\N	\N
203	29	RrCYNuKx4okotsb41AWniftX7TRqZmhK5_F07moU_Gc	\N	f	2026-02-08 10:13:58.630274	2026-02-01 10:13:58.630934	\N	\N
204	29	rpD886PEK2jkDMX_QIPvV-i93-q58S3V1g7Exk0ook4	\N	f	2026-02-08 10:14:40.420269	2026-02-01 10:14:40.421179	\N	\N
205	19	UsqaQ-dNFV8XLiQ17x5529vKy1yG-AV0InT93qkhy0w	\N	f	2026-02-08 10:18:38.240535	2026-02-01 10:18:38.245671	\N	\N
206	25	Kw1dlQlQ0A_kSWCATlTSmjEUE-3SptvpbdjM0-7QiQI	\N	f	2026-02-08 10:18:45.727935	2026-02-01 10:18:45.728412	\N	\N
207	29	5DOPp-NKBPjb5d7rgtAOajcGVRptfhQMpw8xJGh5Jp8	\N	f	2026-02-08 10:18:50.483236	2026-02-01 10:18:50.483634	\N	\N
208	29	__0vRGXGpKC8HtFMcU3zA6eWt4x5WfnHLRGCfL_hsOY	\N	f	2026-02-08 10:23:33.181591	2026-02-01 10:23:33.183292	\N	\N
209	29	V-Dg3lXxjETyxVIBu6Qix5NypDj4PEZWeZUQVQT_Gcc	\N	f	2026-02-08 10:28:55.725254	2026-02-01 10:28:55.725878	\N	\N
210	19	dVA2P7AIRdvM2b3FnPZsBIZ9qcZhTCufjgMCs1fLH4I	\N	f	2026-02-08 11:09:11.069804	2026-02-01 11:09:11.071938	\N	\N
211	29	8UaGI0asTpRIcoIIwL1TOeGm00ifhL6hZKMpnHQ7IIw	\N	f	2026-02-08 11:09:24.825126	2026-02-01 11:09:24.825565	\N	\N
212	29	aZA-Zg_Tih_FSwQJkFgugCZ6eJVs-IpUuCeUA-6uSfE	\N	f	2026-02-08 11:48:28.27527	2026-02-01 11:48:28.27702	\N	\N
213	29	lP1DFWll9DIxws4SMvg-oEGESO5vmj0zXwkKpEBXgdQ	\N	f	2026-02-08 11:48:56.316539	2026-02-01 11:48:56.317043	\N	\N
214	29	9gp6bG-qdjexN2_7x-SazPk5eDC5AK_IfRgJbGnWZTA	\N	f	2026-02-08 11:54:26.402696	2026-02-01 11:54:26.404329	\N	\N
215	29	yyM7o0a4ghPi6l51dC36IdoJhipftkbxU9UE3-6a-zM	\N	f	2026-02-08 11:55:06.556512	2026-02-01 11:55:06.557138	\N	\N
216	29	_JueLqEbKPtuw9QoYBU95QtehRPPW9qG-6vqlNckews	\N	f	2026-02-08 11:59:17.068692	2026-02-01 11:59:17.069199	\N	\N
217	29	qiKJQzcTFVJFBDdszG5pw8vjFANugWcgSOh0Xnkr4ek	\N	f	2026-02-08 12:07:09.174313	2026-02-01 12:07:09.175269	\N	\N
218	29	JMAT6XFGklBu1P1Qm7Tns5rFmqDIjKgEFZUZY5ndRPk	\N	f	2026-02-08 12:07:37.738172	2026-02-01 12:07:37.73852	\N	\N
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, assignment_id, paper_id, score, comments_for_author, confidential_content, old_confidential_content, created_at, updated_at, is_deleted) FROM stdin;
398	521	225	5	**Äiá»ƒm máº¡nh:**\ncáº¥u chĂºc tá»‘t\n\n**Äiá»ƒm yáº¿u:**\nok\n\n**Nháº­n xĂ©t chi tiáº¿t:**\na\n\n**Khuyáº¿n nghá»‹:** accept	Originality: 5/10\nTechnical Quality: 5/10\nClarity: 5/10\nRelevance: 5/10\nOverall: 5/10	\N	2026-01-31 09:58:27.653812	2026-01-31 09:58:27.65382	f
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, created_at) FROM stdin;
1	Author	Paper submitter	2026-01-29 07:54:17.275055
2	Reviewer	Paper reviewer	2026-01-29 07:54:17.275058
3	Chair	Conference chair	2026-01-29 07:54:17.275059
4	Admin	System administrator	2026-01-29 07:54:17.27506
\.


--
-- Data for Name: submission_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.submission_versions (id, paper_id, version, file_path, file_size, title, abstract, keywords, change_notes, created_at, created_by) FROM stdin;
1	224	1	uploads/papers/paper_224_UTHcnpm.pdf	1429270	bĂ i bĂ¡o má»›i	má»™t hai ba bá»‘n nÄƒm sĂ¡u báº£y tĂ¡m chĂ­n mÆ°á»i	Machine Learning	Initial submission	2026-01-31 04:25:11.408033	29
2	225	1	uploads/papers/paper_225_UTHcnpm.pdf	1429270	bĂ i bĂ¡o má»›i	má»™t hai ba bá»‘n nÄƒm sĂ¡u báº£y tĂ¡m chĂ­n mÆ°á»i	Machine Learning	Initial submission	2026-01-31 04:28:39.161693	29
3	226	1	uploads/papers/paper_226_UTHcnpm.pdf	1429270	bĂ i bĂ¡o má»›i 01 31/1 11/45	má»™t ahi ba bá»‘n náº¯m sĂ¡u báº£y tĂ¡m chĂ­n má»i	Machine Learning	Initial submission	2026-01-31 04:42:39.051486	29
\.


--
-- Data for Name: tracks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tracks (id, conference_id, name, code, description, created_at, updated_at, is_deleted) FROM stdin;
75	16	TrĂ­ tuá»‡ nhĂ¢n táº¡o	TRĂ	AI	2026-01-30 13:50:07.975129	2026-01-30 13:50:07.975133	f
76	17	a	A	a	2026-01-30 14:48:21.054675	2026-01-30 14:48:21.054681	f
77	18	sx	SX		2026-01-31 05:48:39.635326	2026-01-31 05:48:42.909226	f
67	15	Machine Learning	ML	ML & Deep Learning	2026-01-29 07:54:18.372515	2026-01-29 07:54:18.372518	f
68	15	Software Engineering	SE	Software Development	2026-01-29 07:54:18.37252	2026-01-29 07:54:18.37252	f
69	15	Database Systems	DB	Database & Big Data	2026-01-29 07:54:18.372521	2026-01-29 07:54:18.372521	f
70	15	Computer Networks	CN	Networks & Security	2026-01-29 07:54:18.372522	2026-01-29 07:54:18.372522	f
71	16	Natural Language Processing	NLP	NLP & Text Mining	2026-01-29 07:54:18.372523	2026-01-29 07:54:18.372524	f
72	16	Computer Vision	CV	Image & Video Processing	2026-01-29 07:54:18.372524	2026-01-29 07:54:18.372525	f
73	16	Robotics	ROB	Robotics & Automation	2026-01-29 07:54:18.372526	2026-01-29 07:54:18.372526	f
74	16	AI Ethics	AIE	Responsible AI	2026-01-29 07:54:18.372527	2026-01-29 07:54:18.372527	f
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (id, user_id, role_id, conference_id, is_active, assigned_by, assigned_at) FROM stdin;
19	19	4	\N	t	\N	2026-01-29 07:54:17.408837
20	20	3	\N	t	\N	2026-01-29 07:54:17.538288
21	21	3	\N	t	\N	2026-01-29 07:54:17.639595
22	22	2	\N	t	\N	2026-01-29 07:54:17.730384
23	23	2	\N	t	\N	2026-01-29 07:54:17.83965
24	24	2	\N	t	\N	2026-01-29 07:54:17.952332
25	25	1	\N	t	\N	2026-01-29 07:54:18.094655
26	26	1	\N	t	\N	2026-01-29 07:54:18.194915
27	27	1	\N	t	\N	2026-01-29 07:54:18.311937
28	28	2	\N	t	\N	2026-01-29 09:41:27.992488
29	28	1	\N	t	\N	2026-01-29 09:41:27.992493
30	28	3	\N	t	\N	2026-01-29 09:41:27.992494
31	28	4	\N	t	19	2026-01-29 14:27:48.32187
32	29	3	\N	t	\N	2026-01-29 16:01:39.559075
33	29	4	\N	t	19	2026-01-29 16:08:51.792722
34	29	2	\N	t	19	2026-01-29 16:08:51.792733
35	29	1	\N	t	19	2026-01-29 16:08:51.792736
36	30	2	\N	t	\N	2026-01-30 13:08:03.514169
37	30	3	\N	t	\N	2026-01-30 13:08:03.514173
38	31	1	\N	t	\N	2026-01-30 13:36:31.452288
39	20	2	\N	t	\N	2026-01-31 05:23:21.187596
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, full_name, email, created_at, updated_at, is_deleted, is_blocked) FROM stdin;
19	admin	scrypt:32768:8:1$oqCEfBP61tlBFHXf$854571ad68dcaffca036d55bbabc96df3f20d0042ce3d49ed86eae0ce83a806606c9b9e9439cf55c3c85a705b18e727e10f6e1539bc1f6eaa86f4af7a65b85a8	System Admin	admin@uth.edu.vn	2026-01-29 07:54:17.395818	2026-01-29 07:54:17.395821	f	f
20	chair01	scrypt:32768:8:1$VGIXtV7mMAnDLH81$14fc343b647d760aaf0c89bdb3e7e26fe970732646aa5c19fdb21d3943a4b85eb8339ef98b5049bc351e1a4ce9f9bb38c2bb03d46518d34e4d2ba2131a79a897	Nguyá»…n VÄƒn Chá»§ Tá»a	chair01@uth.edu.vn	2026-01-29 07:54:17.527803	2026-01-29 07:54:17.527807	f	f
21	chair02	scrypt:32768:8:1$RmOL9mpxfR4ynSJG$aa214c1efdd4dc364f8263ea891db1bcd56c513fa716f67add9bec0df39ca2ccac10aaf4c3bb047ac9f1eaff55fbd198ce60aad35634b9b194e9f92c89d49754	Tráº§n Thá»‹ Ban Tá»• Chá»©c	chair02@uth.edu.vn	2026-01-29 07:54:17.635685	2026-01-29 07:54:17.635688	f	f
22	reviewer01	scrypt:32768:8:1$W9lMAyHm4bzJqSW1$5c65a37974b8de116568e82a678b69320c979de8a9bcf15ca3822f9ce61250fa61891ce89aa0d360a3c53f2a5b97baebab26f6b3433df9226969418e495e1439	LĂª VÄƒn Pháº£n Biá»‡n A	reviewer01@uth.edu.vn	2026-01-29 07:54:17.725826	2026-01-29 07:54:17.725829	f	f
23	reviewer02	scrypt:32768:8:1$S59pqTTSPTUch4Ti$ec29fcbe53f0da07108efd337fcb2372a4dcb6374df7576120b85e362add26ccd5a269bb2ab60c22bbc80402786f18fd7f723ea568926c1575c868a66fbc248b	Pháº¡m Thá»‹ Pháº£n Biá»‡n B	reviewer02@uth.edu.vn	2026-01-29 07:54:17.834572	2026-01-29 07:54:17.834576	f	f
24	reviewer03	scrypt:32768:8:1$o3bIHKiNuD6zdJ0J$126385a2e5ed440b5c05dd0e6a99b03690d5a4be7c6a6b80d71c3f9c109b6b6605b2c908997336315aea34bf6ebdc1521796cbc4faef8612e3b6d3b5ec51b297	HoĂ ng VÄƒn Pháº£n Biá»‡n C	reviewer03@uth.edu.vn	2026-01-29 07:54:17.948529	2026-01-29 07:54:17.948532	f	f
26	author02	scrypt:32768:8:1$fS1EPnRQqFVS3Rui$d37a8c086ebfb2893e8d36ff4d19caee535a87f734c1a87bc2283bd5813178aa9bd67fee7bd55168ccfdd085e02e2751a0baaaa8f911af134e4d52b8125d1d39	Tráº§n Thá»‹ TĂ¡c Giáº£ B	author02@uth.edu.vn	2026-01-29 07:54:18.189007	2026-01-29 07:54:18.18901	f	f
25	author01	scrypt:32768:8:1$j9ZFje3gnUHiVh29$edd973a635c21e2cc1ed966a05bff2ab2cd6a9ccedad6a8a44e2debaadc63f7d708cd4f0bec965a14d8390d810917f9913b30e2ddb0f45b38655a215a2a06de0	Nguyá»…n VÄƒn TĂ¡c Giáº£ A	author01@uth.edu.vn	2026-01-29 07:54:18.088814	2026-01-29 08:01:57.234676	f	f
28	tamleminhtam437	$2b$12$pNCfte2te7mTt03oV6xubetM3I3OPRjG0Wj9OoS/Ah7gWpMu3ZDjq	leminhtam	tamleminhtam437@gmail.com	2026-01-29 09:41:27.964115	2026-01-29 15:58:06.029959	f	f
29	tamchair	scrypt:32768:8:1$R5bwRQyQ5ow367sW$44e42c57f3eac6186d629ca579a223227de9f728c9984f18ef9e047e5cf13f7b8a55edd2e7c0ca3e935570ed6e4a9dbdbd30b7eff55fcbc7ad6acdee7fdf6444	le minh tam	tamleminhtam734@gmail.com	2026-01-29 16:01:39.539669	2026-01-29 16:01:39.53999	f	f
30	tamlm5060	scrypt:32768:8:1$GybzJq9okeC6bBMK$031dce596e8a1b526a75191881d673acdf265e8519c91971e6f6f073fc9b2c1973e6001a612bb4b5c9e7cf565388503c98e975c740ea37f40966e08f3e82531c	tam2	tamlm5060@ut.edu.vn	2026-01-30 13:08:03.501035	2026-01-30 13:08:03.501049	f	f
31	tam2	scrypt:32768:8:1$Mh2ehPvS8BEVG68b$c8d82790f4c5bd96b5f32c82504b7641aa76633c73e3eaa4ef2e78267c91b8246f8a84ca2f0346d48c3c133386e2d0946417a8e2534b530109b4915123fc0e92	LĂª Minh TĂ¢m	tamlm506s0@ut.edu.vn	2026-01-30 13:36:31.446796	2026-01-30 13:36:31.446802	f	f
27	author03	scrypt:32768:8:1$eKj79owhazu64mcZ$703d32b189ab5ed9d9dce48b84e220a75503a2a85c9184e969c517b3b0fc102f85e9499cf3a88b2556ee2950362492055465e525fb4f063c4ba01564fb239161	LĂª VÄƒn TĂ¡c Giáº£ C	author03@uth.edu.vn	2026-01-29 07:54:18.305849	2026-01-30 13:57:50.640428	f	f
\.


--
-- Name: assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignments_id_seq', 525, true);


--
-- Name: audit_log_ai_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_log_ai_id_seq', 252, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 2, true);


--
-- Name: brow_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.brow_history_id_seq', 1, false);


--
-- Name: conference_mentors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conference_mentors_id_seq', 1, false);


--
-- Name: conferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conferences_id_seq', 18, true);


--
-- Name: conflict_of_interest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conflict_of_interest_id_seq', 1, false);


--
-- Name: decisions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.decisions_id_seq', 87, true);


--
-- Name: email_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.email_logs_id_seq', 1, true);


--
-- Name: feature_flags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.feature_flags_id_seq', 1, false);


--
-- Name: la_umcauthres_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.la_umcauthres_id_seq', 1, false);


--
-- Name: paper_authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.paper_authors_id_seq', 336, true);


--
-- Name: papers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.papers_id_seq', 226, true);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 218, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 398, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: submission_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.submission_versions_id_seq', 3, true);


--
-- Name: tracks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tracks_id_seq', 77, true);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 39, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 31, true);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: audit_log_ai audit_log_ai_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log_ai
    ADD CONSTRAINT audit_log_ai_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: brow_history brow_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brow_history
    ADD CONSTRAINT brow_history_pkey PRIMARY KEY (id);


--
-- Name: conference_mentors conference_mentors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conference_mentors
    ADD CONSTRAINT conference_mentors_pkey PRIMARY KEY (id);


--
-- Name: conferences conferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conferences
    ADD CONSTRAINT conferences_pkey PRIMARY KEY (id);


--
-- Name: conflict_of_interest conflict_of_interest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conflict_of_interest
    ADD CONSTRAINT conflict_of_interest_pkey PRIMARY KEY (id);


--
-- Name: decisions decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.decisions
    ADD CONSTRAINT decisions_pkey PRIMARY KEY (id);


--
-- Name: email_logs email_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_pkey PRIMARY KEY (id);


--
-- Name: feature_flags feature_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_pkey PRIMARY KEY (id);


--
-- Name: la_umcauthres la_umcauthres_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.la_umcauthres
    ADD CONSTRAINT la_umcauthres_pkey PRIMARY KEY (id);


--
-- Name: paper_authors paper_authors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paper_authors
    ADD CONSTRAINT paper_authors_pkey PRIMARY KEY (id);


--
-- Name: papers papers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.papers
    ADD CONSTRAINT papers_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_assignment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_assignment_id_key UNIQUE (assignment_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: submission_versions submission_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submission_versions
    ADD CONSTRAINT submission_versions_pkey PRIMARY KEY (id);


--
-- Name: tracks tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_pkey PRIMARY KEY (id);


--
-- Name: user_roles uq_user_role_conference; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT uq_user_role_conference UNIQUE (user_id, role_id, conference_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_assignments_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_assignments_id ON public.assignments USING btree (id);


--
-- Name: ix_audit_log_ai_action_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_log_ai_action_type ON public.audit_log_ai USING btree (action_type);


--
-- Name: ix_audit_log_ai_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_log_ai_id ON public.audit_log_ai USING btree (id);


--
-- Name: ix_audit_log_ai_table_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_log_ai_table_name ON public.audit_log_ai USING btree (table_name);


--
-- Name: ix_audit_log_ai_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_log_ai_timestamp ON public.audit_log_ai USING btree ("timestamp");


--
-- Name: ix_audit_log_ai_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_log_ai_user_id ON public.audit_log_ai USING btree (user_id);


--
-- Name: ix_audit_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: ix_audit_logs_entity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_logs_entity_id ON public.audit_logs USING btree (entity_id);


--
-- Name: ix_audit_logs_entity_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_logs_entity_type ON public.audit_logs USING btree (entity_type);


--
-- Name: ix_audit_logs_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_logs_id ON public.audit_logs USING btree (id);


--
-- Name: ix_audit_logs_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_logs_timestamp ON public.audit_logs USING btree ("timestamp");


--
-- Name: ix_audit_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: ix_brow_history_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_brow_history_id ON public.brow_history USING btree (id);


--
-- Name: ix_brow_history_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_brow_history_timestamp ON public.brow_history USING btree ("timestamp");


--
-- Name: ix_conference_mentors_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_conference_mentors_id ON public.conference_mentors USING btree (id);


--
-- Name: ix_conferences_chair_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_conferences_chair_id ON public.conferences USING btree (chair_id);


--
-- Name: ix_conferences_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_conferences_name ON public.conferences USING btree (name);


--
-- Name: ix_conflict_of_interest_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_conflict_of_interest_id ON public.conflict_of_interest USING btree (id);


--
-- Name: ix_decisions_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_decisions_id ON public.decisions USING btree (id);


--
-- Name: ix_email_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_email_logs_created_at ON public.email_logs USING btree (created_at);


--
-- Name: ix_email_logs_email_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_email_logs_email_type ON public.email_logs USING btree (email_type);


--
-- Name: ix_email_logs_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_email_logs_id ON public.email_logs USING btree (id);


--
-- Name: ix_email_logs_idempotency_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_email_logs_idempotency_key ON public.email_logs USING btree (idempotency_key);


--
-- Name: ix_email_logs_recipient_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_email_logs_recipient_email ON public.email_logs USING btree (recipient_email);


--
-- Name: ix_email_logs_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_email_logs_status ON public.email_logs USING btree (status);


--
-- Name: ix_email_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_email_logs_user_id ON public.email_logs USING btree (user_id);


--
-- Name: ix_feature_flags_conference_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_feature_flags_conference_id ON public.feature_flags USING btree (conference_id);


--
-- Name: ix_feature_flags_feature_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_feature_flags_feature_name ON public.feature_flags USING btree (feature_name);


--
-- Name: ix_feature_flags_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_feature_flags_id ON public.feature_flags USING btree (id);


--
-- Name: ix_la_umcauthres_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_la_umcauthres_id ON public.la_umcauthres USING btree (id);


--
-- Name: ix_paper_authors_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_paper_authors_id ON public.paper_authors USING btree (id);


--
-- Name: ix_papers_conference_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_papers_conference_id ON public.papers USING btree (conference_id);


--
-- Name: ix_papers_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_papers_status ON public.papers USING btree (status);


--
-- Name: ix_papers_submitter_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_papers_submitter_id ON public.papers USING btree (submitter_id);


--
-- Name: ix_papers_title; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_papers_title ON public.papers USING btree (title);


--
-- Name: ix_papers_track_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_papers_track_id ON public.papers USING btree (track_id);


--
-- Name: ix_refresh_tokens_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_refresh_tokens_id ON public.refresh_tokens USING btree (id);


--
-- Name: ix_refresh_tokens_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_refresh_tokens_token ON public.refresh_tokens USING btree (token);


--
-- Name: ix_refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- Name: ix_reviews_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_reviews_id ON public.reviews USING btree (id);


--
-- Name: ix_roles_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_roles_id ON public.roles USING btree (id);


--
-- Name: ix_roles_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_roles_name ON public.roles USING btree (name);


--
-- Name: ix_submission_versions_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_submission_versions_created_at ON public.submission_versions USING btree (created_at);


--
-- Name: ix_submission_versions_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_submission_versions_id ON public.submission_versions USING btree (id);


--
-- Name: ix_submission_versions_paper_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_submission_versions_paper_id ON public.submission_versions USING btree (paper_id);


--
-- Name: ix_submission_versions_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_submission_versions_version ON public.submission_versions USING btree (version);


--
-- Name: ix_tracks_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_tracks_id ON public.tracks USING btree (id);


--
-- Name: ix_user_roles_conference_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_user_roles_conference_id ON public.user_roles USING btree (conference_id);


--
-- Name: ix_user_roles_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_user_roles_role_id ON public.user_roles USING btree (role_id);


--
-- Name: ix_user_roles_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- Name: assignments assignments_conference_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_conference_id_fkey FOREIGN KEY (conference_id) REFERENCES public.conferences(id) ON DELETE CASCADE;


--
-- Name: assignments assignments_paper_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_paper_id_fkey FOREIGN KEY (paper_id) REFERENCES public.papers(id) ON DELETE CASCADE;


--
-- Name: assignments assignments_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: audit_log_ai audit_log_ai_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log_ai
    ADD CONSTRAINT audit_log_ai_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: brow_history brow_history_paper_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brow_history
    ADD CONSTRAINT brow_history_paper_id_fkey FOREIGN KEY (paper_id) REFERENCES public.papers(id) ON DELETE CASCADE;


--
-- Name: brow_history brow_history_viewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brow_history
    ADD CONSTRAINT brow_history_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conference_mentors conference_mentors_paper_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conference_mentors
    ADD CONSTRAINT conference_mentors_paper_id_fkey FOREIGN KEY (paper_id) REFERENCES public.papers(id) ON DELETE CASCADE;


--
-- Name: conference_mentors conference_mentors_reviewer_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conference_mentors
    ADD CONSTRAINT conference_mentors_reviewer_user_id_fkey FOREIGN KEY (reviewer_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conferences conferences_chair_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conferences
    ADD CONSTRAINT conferences_chair_id_fkey FOREIGN KEY (chair_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: conflict_of_interest conflict_of_interest_conference_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conflict_of_interest
    ADD CONSTRAINT conflict_of_interest_conference_id_fkey FOREIGN KEY (conference_id) REFERENCES public.conferences(id) ON DELETE CASCADE;


--
-- Name: conflict_of_interest conflict_of_interest_paper_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conflict_of_interest
    ADD CONSTRAINT conflict_of_interest_paper_id_fkey FOREIGN KEY (paper_id) REFERENCES public.papers(id) ON DELETE CASCADE;


--
-- Name: conflict_of_interest conflict_of_interest_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conflict_of_interest
    ADD CONSTRAINT conflict_of_interest_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: decisions decisions_chair_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.decisions
    ADD CONSTRAINT decisions_chair_user_id_fkey FOREIGN KEY (chair_user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: decisions decisions_conference_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.decisions
    ADD CONSTRAINT decisions_conference_id_fkey FOREIGN KEY (conference_id) REFERENCES public.conferences(id) ON DELETE SET NULL;


--
-- Name: decisions decisions_paper_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.decisions
    ADD CONSTRAINT decisions_paper_id_fkey FOREIGN KEY (paper_id) REFERENCES public.papers(id) ON DELETE CASCADE;


--
-- Name: email_logs email_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: feature_flags feature_flags_conference_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_conference_id_fkey FOREIGN KEY (conference_id) REFERENCES public.conferences(id) ON DELETE CASCADE;


--
-- Name: paper_authors paper_authors_paper_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paper_authors
    ADD CONSTRAINT paper_authors_paper_id_fkey FOREIGN KEY (paper_id) REFERENCES public.papers(id) ON DELETE CASCADE;


--
-- Name: paper_authors paper_authors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paper_authors
    ADD CONSTRAINT paper_authors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: papers papers_conference_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.papers
    ADD CONSTRAINT papers_conference_id_fkey FOREIGN KEY (conference_id) REFERENCES public.conferences(id);


--
-- Name: papers papers_submitter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.papers
    ADD CONSTRAINT papers_submitter_id_fkey FOREIGN KEY (submitter_id) REFERENCES public.users(id);


--
-- Name: papers papers_track_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.papers
    ADD CONSTRAINT papers_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id);


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_paper_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_paper_id_fkey FOREIGN KEY (paper_id) REFERENCES public.papers(id) ON DELETE CASCADE;


--
-- Name: submission_versions submission_versions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submission_versions
    ADD CONSTRAINT submission_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: submission_versions submission_versions_paper_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submission_versions
    ADD CONSTRAINT submission_versions_paper_id_fkey FOREIGN KEY (paper_id) REFERENCES public.papers(id) ON DELETE CASCADE;


--
-- Name: tracks tracks_conference_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_conference_id_fkey FOREIGN KEY (conference_id) REFERENCES public.conferences(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_conference_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_conference_id_fkey FOREIGN KEY (conference_id) REFERENCES public.conferences(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict xqOUdpcfH2fU3ro5foKFG5H8CGP9jfAWn31RywkoKapKrQRgTEgcsezsBqdAxUa

