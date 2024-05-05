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
    candidate_tag tag;
    picture_options TEXT[] := ARRAY['danielle1.jpeg', 'danielle2.jpeg', 'wonyoung1.jpeg', 'wonyoung2.jpeg'];
    is_premium BOOLEAN;
BEGIN
    FOR i IN 1..500 LOOP
        num_tags := (random() * 5 + 1)::int;
        random_tags := '{}';
        num_pictures := (random() * 4 + 1)::int;  -- Randomly choose between 1 and 5 pictures
        random_pictures := '{}';

        FOR j IN 1..num_tags LOOP
            candidate_tag := tag_list[floor(random() * array_length(tag_list, 1)) + 1];
            IF NOT candidate_tag = ANY(random_tags) THEN
                random_tags := array_append(random_tags, candidate_tag);
            ELSE
                j := j - 1;
            END IF;
        END LOOP;

        FOR j IN 1..num_pictures LOOP
            random_pictures := array_append(random_pictures, picture_options[ceil(random() * array_length(picture_options, 1))]);
        END LOOP;

        random_age := (CURRENT_DATE - (INTERVAL '1 year' * (18 + (random() * 42)::int)));

        fame_rating := (random() * 100)::int;

        account_verified := (random() < 0.5);

        random_latitude := (random() * (51 - 42) + 42)::DOUBLE PRECISION;
        random_longitude := (random() * (8 - (-5)) - 5)::DOUBLE PRECISION;

        is_premium := (random() < 0.2);

        INSERT INTO T_USER (
            email,
            username,
            password,
            first_name,
            last_name,
            gender,
            sexual_orientation,
            bio,
            tags,
            date_of_birth,
            fame_rating,
            account_verified,
            is_online,
            created_at,
            updated_at,
            latitude,
            longitude,
            city,
            country,
            pictures,
            registration_method,
            is_premium
        ) VALUES (
            'user' || i || '@example.com',
            'user' || i,
            '$2a$10$Ucg9Ro08qtBMv0PTlyhKae/G1Kw8rpabs6qjYrFZ5Ew6Pz5x9PoX2',
            'FirstName' || i,
            'LastName' || i,
            gender_list[LEAST((random() * 3)::int + 1, 3)],
            orientation_list[LEAST((random() * 4)::int + 1, 4)],
            bio,
            random_tags,
            random_age,
            fame_rating,
            account_verified,
            (random() < 0.5),
            NOW(),
            NOW(),
            random_latitude,
            random_longitude,
            'Paris',
            'France',
            random_pictures,
            'Default',
            is_premium
        );
    END LOOP;
END $$;
