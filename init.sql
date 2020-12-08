--
-- PostgreSQL database dump
--

-- Dumped from database version 13.0
-- Dumped by pg_dump version 13.0

-- Started on 2020-12-07 17:03:28

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 200 (class 1259 OID 16457)
-- Name: hazarddata; Type: TABLE; Schema: public; Owner: floodmapping_admin
--

CREATE TABLE public.hazarddata (
    username character varying,
    projectid character varying,
    projectname character varying,
    projectcat character varying,
    typeofrecord character varying,
    floodhzdstd text[],
    extent json,
    officialwcname character varying,
    fedundertaking character varying,
    caundertaking character varying,
    munundertaking character varying,
    privundertaking character varying,
    otherundertaking character varying,
    datasetstatus character varying,
    lastprojupdate smallint,
    partupdate character varying,
    updatepurp character varying,
    drainagearea numeric,
    summreportavail boolean,
    updatesinceorig boolean,
    localwcname character varying,
    wclength numeric,
    widestcswidth numeric,
    maxfloodplain numeric,
    majorevent character varying,
    coordinatesysproj character varying,
    generalprojcomments text,
    imgprojid character varying,
    acquisitionyear smallint,
    datadescrip character varying,
    acquisitionseason character varying,
    imghref character varying,
    imgvref character varying,
    imghozacc numeric,
    imgderivmethod character varying,
    spatialreshoz numeric,
    spatialresvert numeric,
    imgpeerreview boolean,
    imggeneralcomments text,
    elevprojid character varying,
    digitaldata character varying,
    dataformat character varying,
    primdatasource character varying,
    elevdataowner character varying,
    elevhref character varying,
    elevvref character varying,
    elevhozacc numeric,
    elevvertacc numeric,
    elevderivmethod character varying,
    elevspatialreshoz numeric,
    elevspatialresvert numeric,
    secdatasource character varying,
    elevpeerreview boolean,
    elevgeneralcomments text,
    hydroprojid character varying,
    hydromethod character varying,
    hydroyear smallint,
    datasetyrs numeric,
    eventsmodelled numeric,
    inputcomments text,
    hydromodelyear smallint,
    smincorporated boolean,
    volreduction character varying,
    catdiscretized boolean,
    hydrosupportingdoc boolean,
    ccconsidered boolean,
    hydropeerreview boolean,
    hydrogeneralcomments text,
    hydraprojid character varying,
    hydrayear smallint,
    hydramethod character varying,
    flowcond character varying,
    hydracalib boolean,
    hydrainputcomments text,
    floodlineestimated boolean,
    hydrasupportingdoc boolean,
    elevsource text[],
    hydrapeerreview boolean,
    hydrageneralcomments text,
    boundingbox box,
    privateundertakingname character varying,
    otherundertakingname character varying,
    submissionid integer NOT NULL,
    climatechangecomments character varying,
    otherfloodhzd character varying,
    createdtime timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.hazarddata OWNER TO floodmapping_admin;

--
-- TOC entry 201 (class 1259 OID 16463)
-- Name: hazarddata_submissionid_seq; Type: SEQUENCE; Schema: public; Owner: floodmapping_admin
--

CREATE SEQUENCE public.hazarddata_submissionid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.hazarddata_submissionid_seq OWNER TO floodmapping_admin;

--
-- TOC entry 2999 (class 0 OID 0)
-- Dependencies: 201
-- Name: hazarddata_submissionid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: floodmapping_admin
--

ALTER SEQUENCE public.hazarddata_submissionid_seq OWNED BY public.hazarddata.submissionid;


--
-- TOC entry 202 (class 1259 OID 16475)
-- Name: spatial_ref_sys; Type: TABLE; Schema: public; Owner: pgsql
--

CREATE TABLE public.spatial_ref_sys (
    srid integer NOT NULL,
    auth_name character varying(256),
    auth_srid integer,
    srtext character varying(2048),
    proj4text character varying(2048),
    CONSTRAINT spatial_ref_sys_srid_check CHECK (((srid > 0) AND (srid <= 998999)))
);


ALTER TABLE public.spatial_ref_sys OWNER TO floodmapping_admin;

--
-- TOC entry 2856 (class 2604 OID 16465)
-- Name: hazarddata submissionid; Type: DEFAULT; Schema: public; Owner: floodmapping_admin
--

ALTER TABLE ONLY public.hazarddata ALTER COLUMN submissionid SET DEFAULT nextval('public.hazarddata_submissionid_seq'::regclass);
