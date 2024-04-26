DO $$
DECLARE
    i INT := 0;
    user_id INT;
    used_user_ids INT[] := '{}';
    age_min INT;
    age_max INT;
    location_radius INT;
    min_fame_rating INT;
    max_fame_rating INT;
    num_tags INT;
    j INT;
    random_tags tag[] := '{}';
    candidate_tag tag;
    page_number INT;
    limit_number INT;
    sort_by_options VARCHAR(50)[] := ARRAY['distance', 'fameRating', 'age'];
    order_by_options VARCHAR(10)[] := ARRAY['asc', 'desc', 'rand'];
    sort_by VARCHAR(50);
    order_by VARCHAR(10);

    tag_list tag[] := ARRAY[
        'piercing', 'geek', 'biker', 'athlete', 'adventurer', 'artist',
        'musician', 'foodie', 'gamer', 'nature lover', 'fitness enthusiast',
        'traveler', 'bookworm', 'movie buff', 'science nerd', 'fashionista',
        'social butterfly', 'homebody', 'pet lover', 'diy enthusiast'
    ];
BEGIN
    WHILE i < 30 LOOP
        user_id := (RANDOM() * 500)::INT;
        IF NOT (user_id = ANY(used_user_ids)) THEN
            age_min := (RANDOM() * (99 - 18) + 18)::INT;
            age_max := (RANDOM() * (99 - age_min) + age_min)::INT;
            location_radius := (RANDOM() * 500)::INT;
            min_fame_rating := (RANDOM() * 100)::INT;
            max_fame_rating := (RANDOM() * (100 - min_fame_rating) + min_fame_rating)::INT;
            page_number := (RANDOM() * 9 + 1)::INT;
            limit_number := 10 * ((RANDOM() * 9 + 1)::INT);
           	sort_by := sort_by_options[floor(random() * array_length(sort_by_options, 1)) + 1];
			order_by := order_by_options[floor(random() * array_length(order_by_options, 1)) + 1];
            
            num_tags := (RANDOM() * 5 + 1)::INT;
            random_tags := '{}';
            FOR j IN 1..num_tags LOOP
            	candidate_tag := tag_list[floor(random() * array_length(tag_list, 1)) + 1];
                IF NOT candidate_tag = ANY(random_tags) THEN
                    random_tags := array_append(random_tags, candidate_tag);
                ELSE
                    j := j - 1;
                END IF;
            END LOOP;

            INSERT INTO T_FILTER (
                user_id,
                age_min,
                age_max,
                location_radius,
                min_fame_rating,
                max_fame_rating,
                tags,
                page_number,
                limit_number,
                sort_by,
                order_by
            ) VALUES (
                user_id,
                age_min,
                age_max,
                location_radius,
                min_fame_rating,
                max_fame_rating,
                random_tags,
                page_number,
                limit_number,
                sort_by,
                order_by
            );
            used_user_ids := array_append(used_user_ids, user_id);
            i := i + 1;
        END IF;
    END LOOP;
END $$;
