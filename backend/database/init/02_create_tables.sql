CREATE TYPE gender AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE sexual_orientation AS ENUM ('Male', 'Female', 'Both', 'Other');
CREATE TYPE tag AS ENUM (
    'piercing', 'geek', 'biker', 'athlete', 'adventurer', 'artist',
    'musician', 'foodie', 'gamer', 'nature lover', 'fitness enthusiast',
    'traveler', 'bookworm', 'movie buff', 'science nerd', 'fashionista',
    'social butterfly', 'homebody', 'pet lover', 'diy enthusiast'
);
CREATE TYPE registration_method AS ENUM ('Default', 'Google');
CREATE TYPE notification_type AS ENUM ('Message');

CREATE TABLE IF NOT EXISTS T_USER (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    gender gender DEFAULT 'Other',
    sexual_orientation sexual_orientation DEFAULT 'Both',
    bio TEXT,
    tags tag[] DEFAULT '{}',
    pictures TEXT[] DEFAULT '{}' CHECK (array_length(pictures, 1) <= 5),
    fame_rating INTEGER DEFAULT 0,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_online BOOLEAN DEFAULT FALSE,
    account_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_of_birth DATE,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    city VARCHAR(50),
    country VARCHAR(50),
    registration_method registration_method,
    is_premium BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS T_VIEW (
    id SERIAL PRIMARY KEY,
    viewer_id INTEGER NOT NULL REFERENCES T_USER(id),
    viewed_id INTEGER NOT NULL REFERENCES T_USER(id),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS T_LIKE (
    liker_id INTEGER NOT NULL REFERENCES T_USER(id),
    liked_id INTEGER NOT NULL REFERENCES T_USER(id),
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (liker_id, liked_id)
);

CREATE TABLE IF NOT EXISTS T_REPORT (
    reporter_id INTEGER NOT NULL REFERENCES T_USER(id),
    reported_id INTEGER NOT NULL REFERENCES T_USER(id),
    report_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    PRIMARY KEY (reporter_id, reported_id)
);

CREATE TABLE IF NOT EXISTS T_BLOCK (
    blocker_id INTEGER NOT NULL REFERENCES T_USER(id),
    blocked_id INTEGER NOT NULL REFERENCES T_USER(id),
    block_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS T_FILTER (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    age_min INTEGER,
    age_max INTEGER,
    location_radius INTEGER,
    min_fame_rating INTEGER,
    max_fame_rating INTEGER,
    tags tag[] DEFAULT '{}',
    page_number INTEGER DEFAULT 1,
    limit_number INTEGER DEFAULT 25,
    sort_by VARCHAR(50) DEFAULT 'distance',
    order_by VARCHAR(10) DEFAULT 'asc',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES T_USER(id)
);

CREATE TABLE IF NOT EXISTS T_CHATROOM (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL REFERENCES T_USER(id),
    user2_id INTEGER NOT NULL REFERENCES T_USER(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (user1_id < user2_id),
    UNIQUE (user1_id, user2_id)
);

CREATE TABLE IF NOT EXISTS T_MESSAGE (
    id SERIAL PRIMARY KEY,
    chatroom_id INTEGER NOT NULL REFERENCES T_CHATROOM(id),
    sender_id INTEGER NOT NULL REFERENCES T_USER(id),
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS T_UNREAD_NOTIFICATION (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES T_USER(id),
    recipient_id INTEGER NOT NULL REFERENCES T_USER(id),
    notification_type notification_type,
    content TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sender_id, recipient_id)
);
