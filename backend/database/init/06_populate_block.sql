DO $$
DECLARE
    i INT;
    blocker_id INT;
    blocked_id INT;
    attempt_count INT;
BEGIN
    FOR i IN 1..30 LOOP
        attempt_count := 0;

        LOOP
            blocker_id := (SELECT id FROM T_USER ORDER BY random() LIMIT 1);

            blocked_id := (SELECT id FROM T_USER WHERE id <> blocker_id ORDER BY random() LIMIT 1);

            BEGIN
                INSERT INTO T_BLOCK (blocker_id, blocked_id, block_date)
                VALUES (blocker_id, blocked_id, NOW());
                EXIT;
            EXCEPTION WHEN unique_violation THEN
                attempt_count := attempt_count + 1;
                IF attempt_count > 100 THEN
                    RAISE 'Too many attempts to find a unique pair';
                END IF;
            END;
        END LOOP;
    END LOOP;
END $$;
