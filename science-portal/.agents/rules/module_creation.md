# Module Creation Guidelines

### Mandatory Pre-Flight Check (Duplication Prevention)
- **Before** generating any new module, proposing topics, or writing SQL scripts, you MUST check the existing modules in the database (e.g., by executing a SQL query to list all `materials` or by analyzing the project's existing seed files).
- Your goal is to identify the highest existing `id` and to review existing `title`s and `category`s to ensure you do not propose duplicate topics or use conflicting IDs.

Whenever the user requests the creation of a new learning module, you MUST provide a complete package containing all of the following database columns/fields:

1. `title`: The title of the module.
2. `description`: A short description of the module.
3. `category`: The target category (e.g., `sd_1_3`, `sd_4_6`, `smp_7_9`, `sma_10_12`).
4. `topic_order`: The logical order of the module within its category.
5. `theory_content`: HTML formatted theory text.
6. `game_slug`: A URL-friendly slug for the game.
7. `game_type`: The type of game (e.g., `sensor_match`, `dynamic_match`, `visual_quiz`, `true_false`, `sequence`).
8. `kkm_score`: The passing score (e.g., 70).
9. `xp_theory`: XP awarded for reading the theory (e.g., 10).
10. `xp_pass`: XP awarded for passing the game (e.g., 25).
11. `xp_perfect`: XP awarded for a perfect game score (e.g., 50).
12. `badge_name`: The display name of the title/badge awarded to the student upon completing the module (e.g., 'Ahli Panca Indra', 'Pengamat Cuaca').
13. `game_data`: A complete JSON object containing the interactive game's configuration.
14. `quiz_data`: A complete JSON object containing at least 3 quiz questions related to the theory, including the options and the correct answer index.

### Topic Selection Constraints
- **For `smp_7_9` and `sma_10_12` categories**: You MUST ONLY create **Physics** (Fisika) topics. Do NOT create Biology, Chemistry, or general science topics for these grade levels.
