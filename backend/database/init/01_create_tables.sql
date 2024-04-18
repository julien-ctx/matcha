CREATE TYPE gender AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE sexual_orientation AS ENUM ('Male', 'Female', 'Both', 'Other');
CREATE TYPE tag AS ENUM (
    'piercing', 'geek', 'biker', 'athlete', 'adventurer', 'artist',
    'musician', 'foodie', 'gamer', 'nature lover', 'fitness enthusiast',
    'traveler', 'bookworm', 'movie buff', 'science nerd', 'fashionista',
    'social butterfly', 'homebody', 'pet lover', 'diy enthusiast'
);

CREATE TABLE IF NOT EXISTS T_USER (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender gender DEFAULT 'Other',
    sexual_orientation sexual_orientation DEFAULT 'Both',
    bio TEXT,
    tags tag[] DEFAULT '{}',
    pictures TEXT[] CHECK (array_length(pictures, 1) <= 5),
    fame_rating INTEGER DEFAULT 0,
    gps_location VARCHAR(255),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_online BOOLEAN DEFAULT FALSE,
    account_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_of_birth DATE
);

CREATE TABLE IF NOT EXISTS T_VIEW (
    id SERIAL PRIMARY KEY,
    viewer_id INTEGER NOT NULL REFERENCES T_USER(id),
    viewed_id INTEGER NOT NULL REFERENCES T_USER(id),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS T_LIKE (
    id SERIAL PRIMARY KEY,
    liker_id INTEGER NOT NULL REFERENCES T_USER(id),
    liked_id INTEGER NOT NULL REFERENCES T_USER(id),
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(liker_id, liked_id)
);
