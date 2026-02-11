-- Function to get user progress for a specific week
CREATE OR REPLACE FUNCTION get_user_week_progress(p_user_id UUID, p_week_number INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_video_watched BOOLEAN;
    v_quiz_completed BOOLEAN;
    v_challenge_completed BOOLEAN;
    v_reflection_completed BOOLEAN;
    v_all_completed BOOLEAN;
BEGIN
    -- Check Video (Attendance)
    SELECT EXISTS (
        SELECT 1 FROM attendance_records
        WHERE user_id = p_user_id AND week_number = p_week_number AND is_present = true
    ) INTO v_video_watched;

    -- Check Quiz
    SELECT EXISTS (
        SELECT 1 FROM quiz_scores qs
        JOIN quizzes q ON q.quiz_id = qs.quiz_id
        WHERE qs.user_id = p_user_id AND q.week_number = p_week_number
    ) INTO v_quiz_completed;

    -- Check Challenge
    SELECT EXISTS (
        SELECT 1 FROM challenge_scores cs
        JOIN challenges c ON c.challenge_id = cs.challenge_id
        WHERE cs.user_id = p_user_id AND c.week_number = p_week_number
    ) INTO v_challenge_completed;

    -- Check Reflection
    SELECT EXISTS (
        SELECT 1 FROM reflection_scores rs
        JOIN reflections r ON r.reflection_id = rs.reflection_id
        WHERE rs.user_id = p_user_id AND r.week_number = p_week_number
    ) INTO v_reflection_completed;

    v_all_completed := v_video_watched AND v_quiz_completed AND v_challenge_completed AND v_reflection_completed;

    RETURN jsonb_build_object(
        'video_watched', v_video_watched,
        'quiz_completed', v_quiz_completed,
        'challenge_completed', v_challenge_completed,
        'reflection_completed', v_reflection_completed,
        'all_completed', v_all_completed
    );
END;
$$;

-- Function to calculate total points for a user
CREATE OR REPLACE FUNCTION calculate_total_points(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_points INT := 0;
    v_quiz_points INT := 0;
    v_challenge_points INT := 0;
    v_reflection_points INT := 0;
BEGIN
    -- Quiz Points
    SELECT COALESCE(SUM(score_achieved), 0) INTO v_quiz_points
    FROM quiz_scores
    WHERE user_id = p_user_id;

    -- Challenge Points
    SELECT COALESCE(SUM(score_achieved), 0) INTO v_challenge_points
    FROM challenge_scores
    WHERE user_id = p_user_id;

    -- Reflection Points
    SELECT COALESCE(SUM(score_achieved), 0) INTO v_reflection_points
    FROM reflection_scores
    WHERE user_id = p_user_id;

    v_total_points := v_quiz_points + v_challenge_points + v_reflection_points;
    
    RETURN v_total_points;
END;
$$;
