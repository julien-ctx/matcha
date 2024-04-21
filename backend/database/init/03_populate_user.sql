DO $$
DECLARE
    i INT := 0;
    j INT;
    num_tags INT;
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
    random_age DATE;
    fame_rating INTEGER;
    account_verified BOOLEAN;
    random_latitude DOUBLE PRECISION;
    random_longitude DOUBLE PRECISION;
BEGIN
    FOR i IN 1..500 LOOP
        num_tags := (random() * 5 + 1)::int;
        random_tags := '{}';

        FOR j IN 1..num_tags LOOP
            random_tags := array_append(random_tags, tag_list[(random() * array_length(tag_list, 1))::int % array_length(tag_list, 1) + 1]);
        END LOOP;

        random_age := (CURRENT_DATE - (INTERVAL '1 year' * (18 + (random() * 42)::int)));

        fame_rating := (random() * 100)::int;

        account_verified := (random() < 0.5);

        random_latitude := (random() * (51 - 42) + 42)::DOUBLE PRECISION;
        random_longitude := (random() * (8 - (-5)) - 5)::DOUBLE PRECISION;

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
            longitude
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
            random_longitude
        );
    END LOOP;
END $$;
