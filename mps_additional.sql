-- ============================================================
--  mps_additional  —  extra MP (Lok Sabha) profile fields + Positions Held.
--  Source: AP_MPs_Complete_Profile_Other_Details.xlsx (2 sheets).
--  Run AFTER mps_table.sql + mps_seed.sql.
-- ============================================================
alter table mps add column if not exists state_ut text;
alter table mps add column if not exists party_short text;
alter table mps add column if not exists membership_status text;
alter table mps add column if not exists date_of_marriage text;
alter table mps add column if not exists facebook text;
alter table mps add column if not exists twitter text;
alter table mps add column if not exists instagram text;
alter table mps add column if not exists profile_url text;
alter table mps add column if not exists special_interests text;
alter table mps add column if not exists hobbies text;
alter table mps add column if not exists sports_clubs text;
alter table mps add column if not exists social_cultural text;
alter table mps add column if not exists countries_visited text;
alter table mps add column if not exists other_information text;
alter table mps add column if not exists books_published text;
alter table mps add column if not exists literary_activities text;
alter table mps add column if not exists freedom_fighter text;
alter table mps add column if not exists positions_held text;
notify pgrst, 'reload schema';

update mps set state_ut = 'Andhra Pradesh', party_short = 'TDP', membership_status = 'SITTING', date_of_marriage = NULL, facebook = 'https://www.facebook.com/HarishBalayogi/', twitter = 'https://x.com/harishbalayogi', instagram = 'https://www.instagram.com/harishbalayogi/', profile_url = 'https://sansad.in/ls/members/biography/5722', special_interests = NULL, hobbies = NULL, sports_clubs = NULL, social_cultural = NULL, countries_visited = NULL, other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, The Joint Committee on the Constitution (One Hundred and Twenty-Ninth Amendment) Bill, 2024 and the Union Territories Laws (Amendment) Bill, 2024 (20-Dec-2024 -)
• Member, Committee on Labour, Textiles and Skill Development (26-Sep-2024 onwards)
• Elected to 18th Lok Sabha (June 2024)' where member_id = '5722';
update mps set state_ut = 'Andhra Pradesh', party_short = 'BJP', membership_status = 'SITTING', date_of_marriage = '14-Jun-2003', facebook = 'BhupathirajuSrinivasaVarmaBjpVarma', twitter = 'BjpVarma', instagram = 'Bjpvarma', profile_url = 'https://sansad.in/ls/members/biography/5745', special_interests = 'Public Service, Real Estate, Agriculture, Reading', hobbies = 'Spending with friends, family and party karyakartas.', sports_clubs = NULL, social_cultural = 'Helping poor students financially from my trust named Shri Bhupathiraju Bapi Raju educational society. Helping party karyakartas and local people to get quality education at low cost from DNR educational institutions for which I served as secretary and correspondent for 10 years.', countries_visited = NULL, other_information = 'Working continuously for the same Bhartiya Janata Party since my college days from past 34 years with commitment and for the upliftment of poor and downtrodden.', books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Union Minister of State in the Ministry of Heavy Industries; and Minister of State in the Ministry of Steel (09-Jun-2024 -)
• Elected to 18th Lok Sabha (June 2024)' where member_id = '5745';
update mps set state_ut = 'Andhra Pradesh', party_short = 'TDP', membership_status = 'SITTING', date_of_marriage = '13-Jun-2012', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/5096', special_interests = NULL, hobbies = NULL, sports_clubs = NULL, social_cultural = NULL, countries_visited = 'Australia, China, Sri Lanka, U.K. and U.S.A.', other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, The Joint Committee on The Constitution (One Hundred and Thirtieth Amendment) Bill, 2025; The Jammu and Kashmir Reorganisation (Amendment) Bill, 2025; and The Government Of Union Territories (Amendment) Bill, 2025 (12-Nov-2025 -)
• Member, The Select Committee on the Insolvency and Bankruptcy Code (Amendment) Bill, 2025 (01-Oct-2025 -)
• Member, Consultative Committee, Ministry of Home Affairs, Govt. of India (21-Oct-2024 -)
• Member, Committee on Finance (26-Sep-2024 onwards)
• Member, The Joint Committee on The Waqf (Amendment) Bill, 2024 (13-Aug-2024 -)
• Member, Business Advisory Committee (18-Jul-2024 -)
• Elected to 18th Lok Sabha (June 2024)
• Member, Joint Committee on the Multi-State Co-operative Societies (Amendment) Bill (21 Dec. 2022 onwards)
• Member, Standing Committee on Education, Women, Children, Youth and Sport (13 Sept. 2020 onwards)
• Member, Consultative Committee, Ministry of Animal Husbandry, Dairying and Fisheries
• Member, Standing Committee on Human Resource Development (13 Sept. 2019 - 12 Sept. 2020)
• Elected to 17th Lok Sabha (May, 2019)' where member_id = '5096';
update mps set state_ut = 'Andhra Pradesh', party_short = 'YSRCP', membership_status = 'SITTING', date_of_marriage = '17-Aug-2016', facebook = 'https://www.facebook.com/GuruMYSRCP', twitter = 'https://twitter.com/gurumysrcp', instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/5534', special_interests = 'Reading political biographies. Playing and watching Cricket', hobbies = 'Reading', sports_clubs = 'Swimming, Cricket, Badminton', social_cultural = 'To provide medical aid and assistance for the poor people', countries_visited = 'Brazil, Uruguay, UAE, USA', other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, Committee on Petroleum and Natural Gas (26-Sep-2024 onwards)
• Elected to 18th Lok Sabha (June 2024)
• Member, Standing Committee on Health and Family Welfare (13 Sept. 2022 onwards)
• Elected to Lok Sabha in a bye-election (May 2021)' where member_id = '5534';
update mps set state_ut = 'Andhra Pradesh', party_short = 'TDP', membership_status = 'SITTING', date_of_marriage = '10-May-1998', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/5697', special_interests = 'worked as a journalist in largest telugu news paper.', hobbies = NULL, sports_clubs = 'Shuttle Badminton, Kabaddi', social_cultural = 'Rendering social services through an NGO Nikhila Kalisetti Charitable Trust, Running educational institutions for poor people, control pollution, Free health camps', countries_visited = NULL, other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, Committee on Communications and Information Technology (26-Sep-2024 onwards)
• Elected to 18th Lok Sabha (June 2024)' where member_id = '5697';
update mps set state_ut = 'Andhra Pradesh', party_short = 'TDP', membership_status = 'SITTING', date_of_marriage = NULL, facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/5726', special_interests = NULL, hobbies = NULL, sports_clubs = NULL, social_cultural = NULL, countries_visited = 'USA, Singapore, Switzerland, Dubai, Germany, Australia, China, Hong Kong, UK, Malaysia and Thailand', other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member of the Tobacco Board (25-Feb-2025 -)
• Member, Consultative Committee for the Ministry of Jal Shakti (21-Oct-2024 -)
• Member, Committee on Petroleum and Natural Gas (26-Sep-2024 onwards)
• Elected to 18th Lok Sabha (June 2024)' where member_id = '5726';
update mps set state_ut = 'Andhra Pradesh', party_short = 'TDP', membership_status = 'SITTING', date_of_marriage = '07-May-1992', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/5584', special_interests = NULL, hobbies = NULL, sports_clubs = NULL, social_cultural = 'Ambica Foundation', countries_visited = NULL, other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, Committee on Labour, Textiles and Skill Development (26-Sep-2024 onwards)
• Member of the Committee on Welfare of Other Backward Classes (16 Aug. 2024 onwards)
• Elected to 18th Lok Sabha (June 2024)' where member_id = '5584';
update mps set state_ut = 'Andhra Pradesh', party_short = 'TDP', membership_status = 'SITTING', date_of_marriage = '21-Aug-2013', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/5623', special_interests = 'Keeping up with current affairs, watching movies, Education, Healthcare, Leadership', hobbies = 'Playing and following sports (especially Cricket, Tennis)', sports_clubs = 'Part of TiE Amaravati, Entrepreneurs Organization - AP chapter, Young Presidents Organization', social_cultural = 'Traveling', countries_visited = 'USA, Japan, Vietnam, Turkey', other_information = NULL, books_published = 'None', literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, Joint Committee on the Viksit Bharat Shiksha Adhishthan Bill, 2025 (10-Feb-2026 -)
• Member, The Select Committee on the Jan Vishwas (Amendment Of Provisions) Bill, 2025 (01-Oct-2025 -)
• Member, Committee on Commerce (26-Sep-2024 onwards)
• Elected to 18th Lok Sabha (June 2024)' where member_id = '5623';
update mps set state_ut = 'Andhra Pradesh', party_short = 'TDP', membership_status = 'SITTING', date_of_marriage = '13-Feb-2009', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/5601', special_interests = 'Environmental Protection programs and services aimed at reducing risks to the environment', hobbies = 'Reading books, visiting nature parks, Bird Sanctuaries, wildlife parks', sports_clubs = 'Kabaddi and Cricket', social_cultural = 'Environmental protection is the prime aim. Striving for protecting the natural environment and conserve the natural resources.', countries_visited = NULL, other_information = NULL, books_published = NULL, literary_activities = 'Producer, Cinematography.', freedom_fighter = 'N', positions_held = '• Member, Committee on Petitions (24-Feb-2025 -)
• Member, Committee on Consumer Affairs, Food and Public Distribution (26-Sep-2024 onwards)
• Elected to 18th Lok Sabha (June 2024)' where member_id = '5601';
update mps set state_ut = 'Andhra Pradesh', party_short = 'TDP', membership_status = 'SITTING', date_of_marriage = '14-Jun-2017', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/4771', special_interests = 'Reading Books, Traveling', hobbies = 'Music, Sports', sports_clubs = NULL, social_cultural = NULL, countries_visited = 'Widely travelled: USA, UK, UAE, Japan, Australia, Spain, Germany.', other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Union Cabinet Minister of Civil Aviation (09-Jun-2024 -)
• Elected to 18th Lok Sabha (June 2024)
• Member, Consultative Committee, Ministry of Youth Affairs and Sports
• Member, Standing Committee on Agriculture, Animal Husbandry and Food Processing (13 Sept. 2020 onwards)
• Member, Committee on Public Undertakings (1 May 2020 onwards)
• Member, Standing Committee on Rural Development (13 Sept. 2019 - 12 Sept. 2020)
• Re-elected to 17th Lok Sabha (2nd term) (May 2019)
• Member, Court of Indian Maritime University
• Member, Standing Committee on Railways (1 Sept. 2017 - 25 May 2019)
• Member, Committee on Welfare of Other Backward Classes (12 Sep. 2014 - 25 May 2019)
• Member, Official Language
• Member, Consultative Committee, Ministry of Tourism and Culture (3 Sep. 2014 - 25 May 2019)
• Member, Standing Committee on Home Affairs (1 Sep. 2014 - 25 May 2019)
• Elected to 16th Lok Sabha (May, 2014)' where member_id = '4771';
update mps set state_ut = 'Andhra Pradesh', party_short = 'TDP', membership_status = 'SITTING', date_of_marriage = '25-May-1984', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/292', special_interests = 'Reading, music and television', hobbies = NULL, sports_clubs = 'Cricket', social_cultural = 'Promoting social welfare programmes at local level', countries_visited = NULL, other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, Committee on Coal, Mines and Steel (26-Sep-2024 onwards)
• Member of the Committee on Estimates (14 Aug. 2024 onwards)
• Elected to 18th Lok Sabha (June 2024)
• Member, Committee on Science and Technology, Environment and Forests (1999-2000)
• Elected to 13th Lok Sabha (1999)
• Chairman, Zila Parishad, Distt. Anantapur, Andhra Pradesh' where member_id = '292';
update mps set state_ut = 'Andhra Pradesh', party_short = 'TDP', membership_status = 'SITTING', date_of_marriage = '03-Mar-2001', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/5636', special_interests = NULL, hobbies = NULL, sports_clubs = NULL, social_cultural = 'Dr. Pemmasani has been providing free and clean water to residents of the Palnadu area in Andhra Pradesh for over 10 years. Supporting numerous children through charitable donations to local community organisations.', countries_visited = NULL, other_information = 'Dr. Pemmasani''s mission to uplift the underprivileged and his genuine desire to contribute to societal advancement fuel efforts to empower individuals in their educational endeavours.', books_published = NULL, literary_activities = 'Having identified the challenges of cost and quality in study resources, Dr. Pemmasani started UWorld - a market leader in medical, nursing, pharmacy, law, accounting, and finance licensing preparation.', freedom_fighter = 'N', positions_held = '• Union Minister of State in the Ministry of Rural Development; and Minister of State in the Ministry of Communications (09-Jun-2024 -)
• Elected to 18th Lok Sabha (June 2024)' where member_id = '5636';
update mps set state_ut = 'Andhra Pradesh', party_short = 'BJP', membership_status = 'SITTING', date_of_marriage = '09-May-1979', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/4022', special_interests = NULL, hobbies = NULL, sports_clubs = NULL, social_cultural = NULL, countries_visited = NULL, other_information = NULL, books_published = 'In Quest Of Utopia', literary_activities = NULL, freedom_fighter = 'N', positions_held = '• President - India - Sri Lanka Parliamentary Friendship Group (23-February-2026 -)
• Chairperson, Joint Committee on the Viksit Bharat Shiksha Adhishthan Bill, 2025 (10-Feb-2026 -)
• Member, The Select Committee on the Insolvency and Bankruptcy Code (Amendment) Bill, 2025 (01-Oct-2025 -)
• Chairperson, Committee on the Empowerment of Women (21-Apr-2025 -)
• Member, Committee on Education, Women, Children, Youth and Sports (26-Sep-2024 onwards)
• CWP International Steering Committee (19-September-2024 -)
• Chairperson - Commonwealth Women Parliamentarians (Indian Region) (19-September-2024 -)
• Member, House Committee (04-Jul-2024 -)
• Elected to 18th Lok Sabha (June 2024)
• Union Minister of State, Commerce and Industry (28 Oct. 2012)
• Union Minister of State, Human Resource Development (2009 - 28 Oct. 2012)
• Re-elected to 15th Lok Sabha (2nd term) (2009)
• Union Minister State, Human Resource Development (29 Jan. 2006)
• Elected to 14th Lok Sabha (2004)' where member_id = '4022';
update mps set state_ut = 'Andhra Pradesh', party_short = 'BJP', membership_status = 'SITTING', date_of_marriage = '21-Mar-1992', facebook = 'facebook.com/cmrameshoffl', twitter = NULL, instagram = 'instagram.com/cmramesh_mp', profile_url = 'https://sansad.in/ls/members/biography/5544', special_interests = NULL, hobbies = 'Cricket and badminton', sports_clubs = NULL, social_cultural = NULL, countries_visited = 'U.S.A., Germany, Italy, U.K., Austria, China, Hong Kong, Scotland, U.A.E., Saudi Arabia, Yemen, Thailand, Singapore, Malaysia, Mauritius, Canada and Switzerland', other_information = 'Was Official Spokesperson, Central Committee, Telugu Desam Party', books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, The Joint Committee on the Constitution (One Hundred and Twenty-Ninth Amendment) Bill, 2024 (20-Dec-2024 -)
• Member, Consultative Committee, Ministry of Home Affairs, Govt. of India (21-Oct-2024 -)
• Member, Committee on Finance (26-Sep-2024 onwards)
• Chairperson, Committee on Railways (26-Sep-2024 onwards)
• Member, Committee on Public Accounts (14-Aug-2024 -)
• Elected to 18th Lok Sabha (June 2024)
• Chairman, House Committee (Nov. 2022 onwards)
• Re-elected to Rajya Sabha (third term) (Apr-18)
• Elected to Rajya Sabha (Apr-12)' where member_id = '5544';
update mps set state_ut = 'Andhra Pradesh', party_short = 'YSRCP', membership_status = 'SITTING', date_of_marriage = '12-May-2022', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/5679', special_interests = NULL, hobbies = 'Travelling', sports_clubs = 'Playing Badminton, Cricket', social_cultural = NULL, countries_visited = 'Dubai, Uzbekistan and Kyrgyzstan', other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, Committee on Housing and Urban Affairs (26-Sep-2024 onwards)
• Member, Committee on Welfare of Other Backward Classes (16 Aug. 2024 onwards)
• Elected to 18th Lok Sabha (June 2024)' where member_id = '5679';
update mps set state_ut = 'Andhra Pradesh', party_short = 'TDP', membership_status = 'SITTING', date_of_marriage = '10-Apr-1988', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/5670', special_interests = NULL, hobbies = NULL, sports_clubs = NULL, social_cultural = NULL, countries_visited = 'USA, Australia, New Zealand, UK, France, Austria, Sweden, Finland, Norway, Denmark, Portugal and Spain', other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, Committee on Chemicals and Fertilizers (26-Sep-2024 onwards)
• Member, Committee on the Welfare of Scheduled Castes and Scheduled Tribes (14-Aug-2024 - 30 Apr 2025)
• Elected to 18th Lok Sabha (June 2024)' where member_id = '5670';
update mps set state_ut = 'Andhra Pradesh', party_short = 'TDP', membership_status = 'SITTING', date_of_marriage = '30-Apr-1975', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/3907', special_interests = 'Identification of immediate needs and long term requirement of the public; monitoring State Government/Govt. of India Schemes; Panchayati Raj conferences; tobacco farmers issues; establishment of airport at Ongole', hobbies = 'Watching national and international news on television for latest development and listening to music', sports_clubs = 'Playing football and cricket', social_cultural = 'Founded school and Junior Degree Colleges in Ongole, Nellore and Prakasham Districts; Construction of Community Halls and Marriage Halls; Supply of drinking water in villages; providing ambulances; organizing health centres; Tsunami relief and rehabilitation.', countries_visited = 'Bangkok, China, Japan, Indonesia, Malaysia, Singapore, U.K, U.S.A, UAE', other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Chairperson of the Committee on Housing and Urban Affairs (26-Sep-2024 onwards)
• Member, Committee on Public Accounts (14-Aug-2024 -)
• Member, House Committee (04-Jul-2024 -)
• Elected to 18th Lok Sabha (June 2024)
• Member, Standing Committee on Commerce (13 Sept. 2019 onwards)
• Member, Committee on Estimates (24 July 2019 onwards)
• Re-elected to 17th Lok Sabha (4th term) (May, 2019)
• Member, Andhra Pradesh Legislative Council (2015 - 2019)
• Member, Standing Committee on Railways (31 Aug. 2012 - 18 May 2014)
• Member, Tobacco Board of India (2009 - 2014)
• Member, Committee on Finance (31 Aug. 2009 - 30 Aug. 2012)
• Member, Committee on Estimates (6 Aug. 2009 - 30 April 2011)
• Re-elected to 15th Lok Sabha (3rd term) (2009)
• Re-elected to 14th Lok Sabha (2nd term) (2004)
• Elected to 12th Lok Sabha (1998)' where member_id = '3907';
update mps set state_ut = 'Andhra Pradesh', party_short = 'YSRCP', membership_status = 'SITTING', date_of_marriage = '19-Aug-2006', facebook = 'https://www.facebook.com/PeddireddyMithunReddy/', twitter = 'https://www.MithunReddyYSRC', instagram = 'https://www.peddireddy_midhunreddyofficial', profile_url = 'https://sansad.in/ls/members/biography/4688', special_interests = 'Dairy Farming', hobbies = 'Travel & Exercise', sports_clubs = 'Constitution Club', social_cultural = 'Social Service', countries_visited = 'United Kingdom (Nov 2021), Cairo, Egypt (Nov 2022)', other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, The Select Committee on the Insolvency and Bankruptcy Code (Amendment) Bill, 2025 (01-Oct-2025 -)
• Member, Consultative Committee, Ministry of Home Affairs, Govt. of India (21-Oct-2024 -)
• Member, Committee on Finance (26-Sep-2024 onwards)
• Elected to 18th Lok Sabha (June 2024)
• Member, Joint Committee on the Personal Data Protection Bill, 2019 (11 Dec. 2019 onwards)
• Member, Standing Committee on Finance (13 Sept. 2019 onwards)
• Member, Business Advisory Committee (20 June 2019 onwards)
• Re-elected to 17th Lok Sabha (2nd term) (May 2019)
• Elected to 16th Lok Sabha (May 2014)' where member_id = '4688';
update mps set state_ut = 'Andhra Pradesh', party_short = 'YSRCP', membership_status = 'SITTING', date_of_marriage = '12-Feb-2011', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/4816', special_interests = NULL, hobbies = 'Reading News paper and Books related to irrigation projects; Being connected to the farmer', sports_clubs = 'Cricket (Represented the State in the Under-16 School Tournaments)', social_cultural = 'Organize number of activities and services to help orphanage homes, old-age homes, and help genuine, poor and downtrodden people.', countries_visited = 'Singapore, Sri Lanka and U.K.', other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, Committee on External Affairs (26-Sep-2024 onwards)
• Member, Committee on Estimates (14 Aug. 2024 onwards)
• Elected to 18th Lok Sabha (June 2024)
• Member, Standing Committee on Industry (13 Sept. 2019 onwards)
• Re-elected to 17th Lok Sabha (2nd term) (May 2019)
• Elected to 16th Lok Sabha (May 2014)' where member_id = '4816';
update mps set state_ut = 'Andhra Pradesh', party_short = 'TDP', membership_status = 'SITTING', date_of_marriage = '15-Feb-2008', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/5687', special_interests = NULL, hobbies = NULL, sports_clubs = 'Volleyball', social_cultural = 'Carnatic Music', countries_visited = NULL, other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, Committee on Health and Family Welfare (26-Sep-2024 onwards)
• Elected to 18th Lok Sabha (June 2024)' where member_id = '5687';
update mps set state_ut = 'Andhra Pradesh', party_short = 'TDP', membership_status = 'SITTING', date_of_marriage = '16-Jun-1995', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/5667', special_interests = NULL, hobbies = NULL, sports_clubs = NULL, social_cultural = 'Founder of Kesineni Group. Strong commitment to social welfare and community development. Through Anna Canteens distributed foods.', countries_visited = 'USA, Great Britain, China, Sri Lanka, Hongkong, Malaysia, Singapore, Thailand, Spain, France, Switzerland, Hungary.', other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, Committee on Absence of Members from the Sittings of the House (24-Feb-2025 -)
• Member, Committee on Defence (26 Sept 2024 onwards)
• Member, Committee on Home Affairs (26-Sep-2024 onwards)
• Elected to 18th Lok Sabha (June 2024)' where member_id = '5667';
update mps set state_ut = 'Andhra Pradesh', party_short = 'JSP', membership_status = 'SITTING', date_of_marriage = '19-Aug-2016', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/5676', special_interests = NULL, hobbies = 'Playing with pets, children', sports_clubs = 'Shuttle badminton and swimming', social_cultural = NULL, countries_visited = 'United Kingdom, Spain, Czech Republic, Australia, Turkiye, Thailand, Sri Lanka, UAE, France, Italy.', other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, Committee on Transport, Tourism and Culture (26-Sep-2024 onwards)
• Elected to 18th Lok Sabha (June 2024)' where member_id = '5676';
update mps set state_ut = 'Andhra Pradesh', party_short = 'TDP', membership_status = 'SITTING', date_of_marriage = '05-Feb-1990', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/5680', special_interests = '1. Infrastructure development (Airports, Sea ports, Industrial Corridors). 2. Poverty reduction and SDGs. 3. Skill Development. 4. Employment generation.', hobbies = '1. Wildlife 2. Tiger Sighting 3. Bird watching 4. Travelling.', sports_clubs = '1. Golf 2. Cricket 3. Shuttle Badminton 4. Wrestling 5. Boxing.', social_cultural = 'K P Foundation - Distribution of 16,000 oxygen ventilators in COVID; Construction of 23 hospitals with 100 beds each; Digital Literacy Program for 2,00,000 persons. MALUPU - Skill development of 1,62,000 BPL leather artisans.', countries_visited = 'USA, Japan, Singapore, Italy, Dubai', other_information = NULL, books_published = '1. Trafficking in persons-Tip of the iceberg 2. National Road Safety Plan. 3. Malupu.', literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, Committee on Home Affairs (26-Sep-2024 onwards)
• Elected to 18th Lok Sabha (June 2024)' where member_id = '5680';
update mps set state_ut = 'Andhra Pradesh', party_short = 'JSP', membership_status = 'SITTING', date_of_marriage = '18-May-1991', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/4021', special_interests = NULL, hobbies = 'Reading books', sports_clubs = 'Swimming', social_cultural = 'Leading an NGO in Tenali (Andhra Pradesh) namely PSSS (Guntur) working in the field of agriculture and child labour', countries_visited = 'China and U.A.E.', other_information = NULL, books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, The Joint Committee on The Constitution (One Hundred and Thirtieth Amendment) Bill, 2025 (12-Nov-2025 -)
• Chairperson, Committee on Subordinate Legislation (14-May-2025 -)
• Member, The Joint Committee on the Constitution (One Hundred and Twenty-Ninth Amendment) Bill, 2024 (20-Dec-2024 -)
• Member, Committee on Finance (26-Sep-2024 onwards)
• Member, Committee on Petroleum and Natural Gas (26-Sep-2024 onwards)
• Member, Committee on Public Accounts (14-Aug-2024 -)
• Elected to 18th Lok Sabha (June 2024)
• Member, Standing Committee on Energy (13 Sept. 2022 onwards)
• Chairperson, Committee on Subordinate Legislation (16 Oct. 2020 onwards)
• Member, Standing Committee on Finance (13 Sept. 2019 onwards)
• Re-elected to 17th Lok Sabha (2nd term) (May 2019)
• Elected to 14th Lok Sabha (2004)' where member_id = '4021';
update mps set state_ut = 'Andhra Pradesh', party_short = 'TDP', membership_status = 'SITTING', date_of_marriage = '10-Apr-2008', facebook = NULL, twitter = NULL, instagram = NULL, profile_url = 'https://sansad.in/ls/members/biography/5765', special_interests = NULL, hobbies = 'Cricket and Music', sports_clubs = NULL, social_cultural = 'Running VPR Foundation Charitable Trust - providing free Education and free mineral water plants in Nellore District. Organising spiritual programmes.', countries_visited = 'Europe, UK, UAE, Singapore, Australia, Japan, South Korea, USA', other_information = 'Attended several international symposiums on mines and minerals', books_published = NULL, literary_activities = NULL, freedom_fighter = 'N', positions_held = '• Member, Committee on Finance (26-Sep-2024 onwards)
• Member, Committee on Public Undertakings (14-Aug-2024 -)
• Elected to 18th Lok Sabha (June 2024)
• Member of Standing Committee on Coal and Steel (03-Apr-2018 - 02-Apr-2024)' where member_id = '5765';
