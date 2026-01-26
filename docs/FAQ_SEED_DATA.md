# FAQ Seed Data for Local Snow

This document contains sample FAQ data that can be inserted into the `faqs` table to improve SEO with FAQPage schema.

## Global FAQs (for homepage and general pages)

```sql
-- Global FAQs (entity_type = 'global', entity_id = NULL)
INSERT INTO faqs (entity_type, entity_id, question, answer, display_order, is_published) VALUES
('global', NULL, 'How much do ski lessons cost in Spain?', 'Ski lesson prices in Spain typically range from €45-120 per hour for private instruction, depending on the instructor''s experience, location, and lesson duration. Group lessons at ski schools are generally more affordable, starting from €30-40 per person for a 2-hour session.', 1, true),
('global', NULL, 'Do I need to book ski lessons in advance?', 'Yes, we recommend booking at least 1-2 weeks in advance, especially during peak season (December-March) and school holidays. Popular instructors can be fully booked weeks ahead. However, last-minute bookings are sometimes available during quieter periods.', 2, true),
('global', NULL, 'Are all instructors on Local Snow certified?', 'Yes, all instructors listed on Local Snow are verified and hold valid certifications from recognized ski instructor associations such as AEEPD (Spanish Association), BASI (British), ISIA, or equivalent national qualifications.', 3, true),
('global', NULL, 'Can I book lessons for my children?', 'Absolutely! Many instructors and schools specialize in teaching children. You can filter by age-appropriate instructors, and most offer specialized kids'' programs for ages 3+. Just mention your child''s age and skill level when booking.', 4, true),
('global', NULL, 'What happens if the weather is bad?', 'Weather policies vary by instructor. Most instructors will reschedule if conditions are unsafe or lifts are closed. We recommend discussing cancellation and rescheduling policies directly with your instructor when booking.', 5, true);
```

## Resort-Specific FAQs

### Baqueira Beret FAQs (example)

```sql
-- Assuming Baqueira Beret resort has id = 1
INSERT INTO faqs (entity_type, entity_id, question, answer, display_order, is_published) VALUES
('resort', 1, 'How much do ski instructors cost in Baqueira Beret?', 'Private ski lessons in Baqueira Beret typically range from €60-120 per hour. The average is around €75/hour for experienced instructors. Multi-day packages and group lessons offer better rates.', 1, true),
('resort', 1, 'What is the best time to ski in Baqueira Beret?', 'Baqueira Beret''s season runs from late November to mid-April. The best conditions are typically in January and February when snow coverage is most reliable. March offers great spring skiing with longer days and warmer weather.', 2, true),
('resort', 1, 'Is Baqueira Beret suitable for beginners?', 'Yes! Baqueira Beret has excellent beginner areas with gentle slopes and modern lifts. The resort offers 111km of pistes, with around 30% classified as beginner-friendly. We recommend booking a lesson for your first few days to learn proper technique.', 3, true),
('resort', 1, 'Do instructors in Baqueira Beret speak English?', 'Many instructors in Baqueira Beret speak English, as well as Spanish, Catalan, and French. You can filter instructors by spoken languages on their profiles to find one that matches your preference.', 4, true),
('resort', 1, 'Where do ski lessons meet in Baqueira Beret?', 'Meeting points vary by instructor but are typically at the base of Baqueira or Beret ski areas. Your instructor will provide specific meeting instructions when you confirm your booking. Popular meeting spots include the Baqueira 1500 base station and the ESF meeting point.', 5, true);
```

### Formigal FAQs (example)

```sql
-- Assuming Formigal resort has id = 2
INSERT INTO faqs (entity_type, entity_id, question, answer, display_order, is_published) VALUES
('resort', 2, 'How much do ski instructors cost in Formigal?', 'Private ski instruction in Formigal ranges from €50-100 per hour. Many instructors offer discounted rates for half-day (3 hours) or full-day (6 hours) bookings. Group lessons through schools start from €35 per person.', 1, true),
('resort', 2, 'Is Formigal good for families?', 'Yes! Formigal is excellent for families with kids'' snow parks, dedicated beginner areas, and numerous ski schools offering children''s programs. The resort has 176km of varied terrain suitable for all levels, from complete beginners to advanced skiers.', 2, true),
('resort', 2, 'What is the ski season in Formigal?', 'Formigal''s season typically runs from early December to mid-April, with the best snow conditions between January and March. The resort has extensive snowmaking capabilities to ensure good coverage throughout the season.', 3, true),
('resort', 2, 'Can I take snowboard lessons in Formigal?', 'Absolutely! Formigal is a popular snowboarding destination with terrain parks and halfpipes. Many instructors specialize in snowboarding, and you can filter by sport when searching for instructors on Local Snow.', 4, true);
```

### Sierra Nevada FAQs (example)

```sql
-- Assuming Sierra Nevada resort has id = 3
INSERT INTO faqs (entity_type, entity_id, question, answer, display_order, is_published) VALUES
('resort', 3, 'How much do ski lessons cost in Sierra Nevada?', 'Ski lessons in Sierra Nevada range from €45-110 per hour for private instruction. The resort is generally more affordable than the Pyrenees resorts. Group lessons start from €30-35 per person for 2-hour sessions.', 1, true),
('resort', 3, 'When is the best time to ski in Sierra Nevada?', 'Sierra Nevada''s season runs from late November to early May - one of the longest in Europe. January to March offers the most reliable snow. Spring skiing in April can be excellent with warm temperatures and good snow coverage at higher elevations.', 2, true),
('resort', 3, 'Can you ski and visit Granada in the same day?', 'Yes! Sierra Nevada is only 30km from Granada city. Many visitors ski in the morning and explore the Alhambra and Granada''s historic center in the afternoon. This makes it a unique ski destination combining winter sports with cultural tourism.', 3, true),
('resort', 3, 'Is Sierra Nevada suitable for beginners?', 'Yes, Sierra Nevada has excellent beginner facilities with wide, gentle slopes and modern lifts. The resort offers dedicated beginner zones and numerous ski schools. We highly recommend booking lessons for first-time skiers to learn safely and progress quickly.', 4, true),
('resort', 3, 'What altitude is Sierra Nevada resort?', 'Sierra Nevada''s ski area ranges from 2,100m to 3,300m, making it one of the highest ski resorts in Europe. The high altitude generally ensures good snow conditions, though it can be affected by the warmer Mediterranean climate.', 5, true);
```

## Instructor-Specific FAQs (optional)

```sql
-- Example for individual instructor profiles
-- Assuming instructor user has id = 100
INSERT INTO faqs (entity_type, entity_id, question, answer, display_order, is_published) VALUES
('instructor', 100, 'What qualifications do you have?', 'I am certified by AEEPD (Level 3) and BASI (Level 2) with over 10 years of teaching experience in the Spanish Pyrenees. I specialize in teaching beginners and intermediate skiers of all ages.', 1, true),
('instructor', 100, 'Do you teach children?', 'Yes! I love teaching kids and have extensive experience with children aged 4-16. I use fun, games-based methods to keep lessons engaging while focusing on safety and proper technique.', 2, true),
('instructor', 100, 'What should I bring to the lesson?', 'Please bring all your ski equipment (skis, boots, poles, helmet), appropriate clothing for the weather, sunscreen, and a water bottle. If you don''t have equipment, I can recommend rental shops near the meeting point.', 3, true);
```

## School-Specific FAQs (optional)

```sql
-- Example for ski school profiles
-- Assuming ski school has id = 10
INSERT INTO faqs (entity_type, entity_id, question, answer, display_order, is_published) VALUES
('school', 10, 'What age groups do you teach?', 'We offer programs for all ages starting from 3 years old. We have specialized groups for children (3-6, 7-12, 13-17) and adults of all levels. Our instructors are trained in age-appropriate teaching methods.', 1, true),
('school', 10, 'Do you offer group lessons?', 'Yes! Group lessons are our specialty. We run small groups (maximum 6-8 students) organized by age and skill level. This provides a balance between personalized attention and social learning.', 2, true),
('school', 10, 'How do I book a lesson?', 'You can book directly through our profile on Local Snow by clicking the contact button, or visit our website. We recommend booking at least one week in advance during peak season.', 3, true),
('school', 10, 'What is your cancellation policy?', 'We offer free cancellation up to 48 hours before the lesson start time. Cancellations with less than 48 hours notice or no-shows will be charged 50% of the lesson fee. Weather-related closures result in full refunds or rescheduling.', 4, true);
```

## How to Use This Data

1. **Run the migration** to create the `faqs` table:
   ```bash
   npm run db:migrate
   ```

2. **Connect to your database** and run the SQL inserts above

3. **Update entity IDs** - Replace the placeholder `entity_id` values with your actual resort/instructor/school IDs from your database

4. **Customize the content** - Edit questions and answers to match your specific resorts and instructors

5. **FAQs will automatically appear** on the corresponding pages with FAQPage schema for SEO

## SEO Benefits

- **FAQPage schema** helps pages appear in Google's rich results with expandable FAQ sections
- **Long-tail keywords** - FAQs naturally include question-based searches users make
- **Featured snippets** - Well-structured FAQs can appear as featured snippets in search results
- **User experience** - Answers common questions upfront, reducing friction in the booking process

## Tips for Writing Good SEO FAQs

1. **Use natural question phrasing** - Write questions as users would ask them
2. **Include location keywords** - Mention resort names and regions in answers
3. **Keep answers concise** - 2-4 sentences is ideal
4. **Answer the question directly** - Don't be overly promotional
5. **Update seasonally** - Refresh date-specific information annually
6. **Add new FAQs** - Based on actual customer questions you receive

---

**Created:** 2026-01-21
**For:** Local Snow SEO Implementation
