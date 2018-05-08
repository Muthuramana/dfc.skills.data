SELECT soccode, onetocccode, skillid, skillname, skillsrank
	FROM public.soc_onetocc_skills
    where soccode = '2137'
    order by skillsrank desc
    