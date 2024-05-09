DO $$
DECLARE
    i INT := 0;
    j INT;
    num_tags INT;
    num_pictures INT;
    gender_list gender[] := ARRAY['Male', 'Female', 'Other'];
    orientation_list sexual_orientation[] := ARRAY['Male', 'Female', 'Both', 'Other'];
    tag_list tag[] := ARRAY[
        'piercing', 'geek', 'biker', 'athlete', 'adventurer', 'artist',
        'musician', 'foodie', 'gamer', 'nature lover', 'fitness enthusiast',
        'traveler', 'bookworm', 'movie buff', 'science nerd', 'fashionista',
        'social butterfly', 'homebody', 'pet lover', 'diy enthusiast'
    ];
    bio TEXT := 'I am happy to do the RNCP';
    random_tags tag[];
    random_pictures TEXT[];
    random_age DATE;
    fame_rating INTEGER;
    account_verified BOOLEAN;
    random_latitude DOUBLE PRECISION;
    random_longitude DOUBLE PRECISION;
    gender_choice gender;
    age_years INT;
    image_index INT;
    candidate_tag tag;
    is_premium BOOLEAN;
BEGIN
    FOR i IN 1..500 LOOP
        num_tags := (random() * 5 + 1)::int;
        random_tags := '{}';
        num_pictures := (random() * 4 + 1)::int;
        random_pictures := '{}';

        FOR j IN 1..num_tags LOOP
            candidate_tag := tag_list[floor(random() * array_length(tag_list, 1)) + 1];
            IF NOT candidate_tag = ANY(random_tags) THEN
                random_tags := array_append(random_tags, candidate_tag);
            ELSE
                j := j - 1;
            END IF;
        END LOOP;

        random_age := (CURRENT_DATE - (INTERVAL '1 year' * (18 + (random() * 42)::int)));
        age_years := EXTRACT(year FROM AGE(random_age));
        gender_choice := gender_list[LEAST((random() * 3)::int + 1, 3)];
        image_index := CASE
            WHEN age_years < 25 THEN 1
            WHEN age_years < 35 THEN 2
            WHEN age_years < 45 THEN 3
            WHEN age_years < 55 THEN 4
            ELSE 5
        END;

        FOR j IN 1..num_pictures LOOP
            IF gender_choice = 'Male' THEN
                random_pictures := array_append(random_pictures, 'fake_profile/man' || image_index || '.jpeg');
            ELSIF gender_choice = 'Female' THEN
                random_pictures := array_append(random_pictures, 'fake_profile/woman' || image_index || '.jpeg');
            ELSE
                random_pictures := array_append(random_pictures, 'fake_profile/' || (CASE WHEN (random() < 0.5) THEN 'man' ELSE 'woman' END) || (1 + (random() * 4)::int) || '.jpeg');
            END IF;
        END LOOP;

        fame_rating := (random() * 100)::int;
        account_verified := (random() < 0.5);
        random_latitude := (random() * (51 - 42) + 42)::DOUBLE PRECISION;
        random_longitude := (random() * (8 - (-5)) - 5)::DOUBLE PRECISION;
        is_premium := (random() < 0.2);

        INSERT INTO T_USER (
            email, username, password, first_name, last_name, gender,
            sexual_orientation, bio, tags, date_of_birth, fame_rating,
            account_verified, is_online, created_at, updated_at,
            latitude, longitude, city, country, pictures,
            registration_method, is_premium
        ) VALUES (
            'user' || i || '@example.com', 'user' || i, '$2a$10$Ucg9Ro08qtBMv0PTlyhKae/G1Kw8rpabs6qjYrFZ5Ew6Pz5x9PoX2', 
            'FirstName' || i, 'LastName' || i, gender_choice, 
            orientation_list[LEAST((random() * 4)::int + 1, 4)], bio, 
            random_tags, random_age, fame_rating, account_verified, 
            (random() < 0.5), NOW(), NOW(), random_latitude, 
            random_longitude, 'Paris', 'France', random_pictures, 
            'Default', is_premium
        );
    END LOOP;
END $$;
