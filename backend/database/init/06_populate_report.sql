DO $$
DECLARE
    i INT;
    reporter_id INT;
    reported_id INT;
    attempt_count INT;
    report_reasons TEXT[] := ARRAY[
        'Inappropriate content',
        'Spam',
        'Harassment',
        'Fake profile',
        'Other'
    ];
    current_reason TEXT;
BEGIN
    FOR i IN 1..30 LOOP
        attempt_count := 0;

        LOOP
            reporter_id := (SELECT id FROM T_USER ORDER BY random() LIMIT 1);

            reported_id := (SELECT id FROM T_USER WHERE id <> reporter_id ORDER BY random() LIMIT 1);

			current_reason := report_reasons[(random() * array_length(report_reasons, 1))::int % array_length(report_reasons, 1) + 1];

            BEGIN
                INSERT INTO T_REPORT (reporter_id, reported_id, reason)
                VALUES (reporter_id, reported_id, current_reason);
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
