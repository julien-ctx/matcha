DO $$
DECLARE
    i INT;
    liker_id INT;
    liked_id INT;
    attempt_count INT;
BEGIN
    -- Matchs
    FOR i IN 1..20 LOOP
        FOR j IN 1..20 LOOP
            IF i != j THEN
                INSERT INTO T_LIKE (liker_id, liked_id, liked_at)
                VALUES (i, j, NOW()) ON CONFLICT DO NOTHING;
                INSERT INTO T_LIKE (liker_id, liked_id, liked_at)
                VALUES (j, i, NOW()) ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;

    -- Random likes
    FOR i IN 1..480 LOOP
        liker_id := (SELECT id FROM T_USER WHERE id >= 21 ORDER BY random() LIMIT 1);
        
        attempt_count := 0;

        LOOP
            liked_id := (SELECT id FROM T_USER WHERE id >= 21 AND id != liker_id ORDER BY random() LIMIT 1);
            BEGIN
                INSERT INTO T_LIKE (liker_id, liked_id, liked_at)
                VALUES (liker_id, liked_id, NOW());
                EXIT;
            EXCEPTION WHEN unique_violation THEN
                attempt_count := attempt_count + 1;
                IF attempt_count > 500 THEN
                    RAISE EXCEPTION 'Too many attempts';
                END IF;
            END;
        END LOOP;
    END LOOP;
END $$;
