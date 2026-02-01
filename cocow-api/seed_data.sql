-- 清空数据库
TRUNCATE TABLE websites CASCADE;

TRUNCATE TABLE categories CASCADE;

-- 插入分类
INSERT INTO
    categories (name, icon, "order")
VALUES ('AI Tools', '🤖', 1),
    ('Development', '💻', 2),
    ('Design', '🎨', 3),
    ('Productivity', '⚡', 4),
    ('Social Media', '📱', 5),
    ('Entertainment', '🎬', 6),
    ('News', '📰', 7),
    ('Education', '📚', 8);

-- 获取分类ID用于插入网站
DO $$
DECLARE
    ai_id UUID;
    dev_id UUID;
    design_id UUID;
    productivity_id UUID;
    social_id UUID;
    entertainment_id UUID;
    news_id UUID;
    education_id UUID;
BEGIN
    -- 获取各分类ID
    SELECT id INTO ai_id FROM categories WHERE icon = '🤖' LIMIT 1;
    SELECT id INTO dev_id FROM categories WHERE icon = '💻' LIMIT 1;
    SELECT id INTO design_id FROM categories WHERE icon = '🎨' LIMIT 1;
    SELECT id INTO productivity_id FROM categories WHERE icon = '⚡' LIMIT 1;
    SELECT id INTO social_id FROM categories WHERE icon = '📱' LIMIT 1;
    SELECT id INTO entertainment_id FROM categories WHERE icon = '🎬' LIMIT 1;
    SELECT id INTO news_id FROM categories WHERE icon = '📰' LIMIT 1;
    SELECT id INTO education_id FROM categories WHERE icon = '📚' LIMIT 1;

    -- AI工具
    INSERT INTO websites (name, url, icon, category_id) VALUES
    ('ChatGPT', 'https://chat.openai.com', 'https://chat.openai.com/favicon.ico', ai_id),
    ('Claude', 'https://claude.ai', 'https://claude.ai/favicon.ico', ai_id),
    ('Midjourney', 'https://www.midjourney.com', 'https://www.midjourney.com/favicon.ico', ai_id),
    ('Gemini', 'https://gemini.google.com', 'https://gemini.google.com/favicon.ico', ai_id),
    ('Copilot', 'https://copilot.microsoft.com', 'https://copilot.microsoft.com/favicon.ico', ai_id);

    -- 开发工具
    INSERT INTO websites (name, url, icon, category_id) VALUES
    ('GitHub', 'https://github.com', 'https://github.com/favicon.ico', dev_id),
    ('Stack Overflow', 'https://stackoverflow.com', 'https://stackoverflow.com/favicon.ico', dev_id),
    ('VS Code', 'https://code.visualstudio.com', 'https://code.visualstudio.com/favicon.ico', dev_id),
    ('GitLab', 'https://gitlab.com', 'https://gitlab.com/favicon.ico', dev_id),
    ('Docker Hub', 'https://hub.docker.com', 'https://hub.docker.com/favicon.ico', dev_id);

    -- 设计
    INSERT INTO websites (name, url, icon, category_id) VALUES
    ('Figma', 'https://www.figma.com', 'https://www.figma.com/favicon.ico', design_id),
    ('Dribbble', 'https://dribbble.com', 'https://dribbble.com/favicon.ico', design_id),
    ('Behance', 'https://www.behance.net', 'https://www.behance.net/favicon.ico', design_id),
    ('Canva', 'https://www.canva.com', 'https://www.canva.com/favicon.ico', design_id),
    ('Unsplash', 'https://unsplash.com', 'https://unsplash.com/favicon.ico', design_id);

    -- 效率工具
    INSERT INTO websites (name, url, icon, category_id) VALUES
    ('Notion', 'https://www.notion.so', 'https://www.notion.so/favicon.ico', productivity_id),
    ('Trello', 'https://trello.com', 'https://trello.com/favicon.ico', productivity_id),
    ('Todoist', 'https://todoist.com', 'https://todoist.com/favicon.ico', productivity_id),
    ('Slack', 'https://slack.com', 'https://slack.com/favicon.ico', productivity_id),
    ('Evernote', 'https://evernote.com', 'https://evernote.com/favicon.ico', productivity_id);

    -- 社交媒体
    INSERT INTO websites (name, url, icon, category_id) VALUES
    ('Twitter/X', 'https://twitter.com', 'https://twitter.com/favicon.ico', social_id),
    ('Instagram', 'https://www.instagram.com', 'https://www.instagram.com/favicon.ico', social_id),
    ('LinkedIn', 'https://www.linkedin.com', 'https://www.linkedin.com/favicon.ico', social_id),
    ('Reddit', 'https://www.reddit.com', 'https://www.reddit.com/favicon.ico', social_id),
    ('Discord', 'https://discord.com', 'https://discord.com/favicon.ico', social_id);

    -- 娱乐
    INSERT INTO websites (name, url, icon, category_id) VALUES
    ('YouTube', 'https://www.youtube.com', 'https://www.youtube.com/favicon.ico', entertainment_id),
    ('Netflix', 'https://www.netflix.com', 'https://www.netflix.com/favicon.ico', entertainment_id),
    ('Spotify', 'https://www.spotify.com', 'https://www.spotify.com/favicon.ico', entertainment_id),
    ('Twitch', 'https://www.twitch.tv', 'https://www.twitch.tv/favicon.ico', entertainment_id),
    ('Steam', 'https://store.steampowered.com', 'https://store.steampowered.com/favicon.ico', entertainment_id);

    -- 新闻
    INSERT INTO websites (name, url, icon, category_id) VALUES
    ('BBC News', 'https://www.bbc.com/news', 'https://www.bbc.com/favicon.ico', news_id),
    ('CNN', 'https://www.cnn.com', 'https://www.cnn.com/favicon.ico', news_id),
    ('Reuters', 'https://www.reuters.com', 'https://www.reuters.com/favicon.ico', news_id),
    ('Hacker News', 'https://news.ycombinator.com', 'https://news.ycombinator.com/favicon.ico', news_id),
    ('TechCrunch', 'https://techcrunch.com', 'https://techcrunch.com/favicon.ico', news_id);

    -- 教育
    INSERT INTO websites (name, url, icon, category_id) VALUES
    ('Coursera', 'https://www.coursera.org', 'https://www.coursera.org/favicon.ico', education_id),
    ('Khan Academy', 'https://www.khanacademy.org', 'https://www.khanacademy.org/favicon.ico', education_id),
    ('edX', 'https://www.edx.org', 'https://www.edx.org/favicon.ico', education_id),
    ('Udemy', 'https://www.udemy.com', 'https://www.udemy.com/favicon.ico', education_id),
    ('MDN Web Docs', 'https://developer.mozilla.org', 'https://developer.mozilla.org/favicon.ico', education_id);
END $$;