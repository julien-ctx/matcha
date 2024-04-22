DO $$
DECLARE
    i INT;
    viewer_id INT;
    viewed_id INT;
BEGIN
    FOR i IN 1..500 LOOP
        viewer_id := (SELECT id FROM T_USER ORDER BY random() LIMIT 1);
        
        LOOP
            viewed_id := (SELECT id FROM T_USER ORDER BY random() LIMIT 1);
            IF viewer_id != viewed_id THEN
                EXIT;
            END IF;
        END LOOP;

        INSERT INTO T_VIEW (viewer_id, viewed_id, viewed_at)
        VALUES (viewer_id, viewed_id, NOW());
    END LOOP;
END $$;
