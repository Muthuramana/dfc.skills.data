-- Table: public.soc_onetocc_skills

-- DROP TABLE public.soc_onetocc_skills;

CREATE TABLE public.soc_onetocc_skills
(
    onetocccode character varying COLLATE pg_catalog."default" NOT NULL,
    skillid character varying COLLATE pg_catalog."default" NOT NULL,
    skillname character varying(200) COLLATE pg_catalog."default" NOT NULL,
    skillsrank double precision NOT NULL,
    soccode character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT soc_onetocc_skills_pkey PRIMARY KEY (onetocccode, skillid, soccode)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.soc_onetocc_skills
    OWNER to postgres;