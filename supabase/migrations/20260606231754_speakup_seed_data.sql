/*
# SpeakUp AI - Seed Reference Data

1. Insert 15 learning levels
2. Insert sample lessons for each level
3. Insert vocabulary words across categories
4. Insert useful sentences
5. Insert achievements
6. Insert roleplay scenarios
*/

-- Levels
INSERT INTO levels (id, title_en, title_ar, description_en, description_ar, icon, xp_required, order_index) VALUES
(1, 'Greetings', 'التحيات', 'Learn basic greetings and hellos', 'تعلم التحيات الأساسية والسلام', 'HandMetal', 0, 1),
(2, 'Introducing Yourself', 'التعريف بالنفس', 'Introduce yourself and share basic info', 'عرف بنفسك وشارك معلومات أساسية', 'User', 200, 2),
(3, 'Daily Life', 'الحياة اليومية', 'Talk about daily routines and activities', 'تحدث عن الروتين اليومي والأنشطة', 'Sun', 500, 3),
(4, 'Family & Friends', 'العائلة والأصدقاء', 'Describe your family and relationships', 'صف عائلتك وعلاقاتك', 'Users', 900, 4),
(5, 'Restaurant', 'المطعم', 'Order food and communicate at restaurants', 'اطلب الطعام وتواصل في المطاعم', 'UtensilsCrossed', 1400, 5),
(6, 'Shopping', 'التسوق', 'Shop for items and negotiate prices', 'تسوق للمنتجات وتفاوض على الأسعار', 'ShoppingBag', 2000, 6),
(7, 'Travel', 'السفر', 'Navigate travel situations and directions', 'تعامل مع مواقف السفر والاتجاهات', 'Plane', 2700, 7),
(8, 'Airport', 'المطار', 'Handle airport check-in, security, and boarding', 'تعامل مع تسجيل الدخول والأمن والصعود في المطار', 'Building2', 3500, 8),
(9, 'Hotel', 'الفندق', 'Book rooms and communicate with hotel staff', 'احجز غرف وتواصل مع طاقم الفندق', 'Hotel', 4400, 9),
(10, 'Workplace English', 'الإنجليزية في مكان العمل', 'Professional communication at work', 'التواصل المهني في العمل', 'Briefcase', 5400, 10),
(11, 'Business English', 'الإنجليزية للأعمال', 'Business meetings, emails, and presentations', 'اجتماعات العمل والبريد الإلكتروني والعروض التقديمية', 'TrendingUp', 6500, 11),
(12, 'Job Interview', 'مقابلة العمل', 'Prepare for and excel in job interviews', 'استعد وتفوق في مقابلات العمل', 'FileText', 7700, 12),
(13, 'Advanced Conversation', 'المحادثة المتقدمة', 'Complex discussions and debates', 'نقاشات ومناظرات معقدة', 'MessageCircle', 9000, 13),
(14, 'Public Speaking', 'التحدث أمام الجمهور', 'Present ideas confidently to audiences', 'قدم أفكارك بثقة أمام الجمهور', 'Mic', 10400, 14),
(15, 'Fluent English Master', 'ماستر الإنجليزية', 'Master-level fluency and cultural nuances', 'إتقان مستوى الطلاقة والفروق الثقافية', 'Crown', 12000, 15)
ON CONFLICT (id) DO NOTHING;

-- Lessons for Level 1: Greetings
INSERT INTO lessons (level_id, title_en, title_ar, type, order_index, content) VALUES
(1, 'Basic Greetings', 'التحيات الأساسية', 'lesson', 1, '{"phrases": [{"en": "Hello", "ar": "مرحبا", "pron": "heh-LOH"}, {"en": "Hi", "ar": "أهلا", "pron": "hai"}, {"en": "Good morning", "ar": "صباح الخير", "pron": "good MOR-ning"}, {"en": "Good evening", "ar": "مساء الخير", "pron": "good EEV-ning"}, {"en": "Goodbye", "ar": "مع السلامة", "pron": "good-BAI"}]}'),
(1, 'How Are You?', 'كيف حالك؟', 'lesson', 2, '{"phrases": [{"en": "How are you?", "ar": "كيف حالك؟", "pron": "hau ar yoo"}, {"en": "I am fine, thank you", "ar": "أنا بخير، شكرا لك", "pron": "ai am fain thank yoo"}, {"en": "Nice to meet you", "ar": "سررت بلقائك", "pron": "nais tu meet yoo"}, {"en": "What is your name?", "ar": "ما اسمك؟", "pron": "wot iz yor neim"}]}'),
(1, 'Greetings Quiz', 'اختبار التحيات', 'quiz', 3, '{"questions": [{"q_en": "How do you say Hello?", "q_ar": "كيف تقول مرحبا؟", "options": ["Hello", "Goodbye", "Thanks", "Sorry"], "answer": 0}, {"q_en": "What does Good morning mean?", "q_ar": "ما معنى صباح الخير؟", "options": ["مساء الخير", "صباح الخير", "شكرا", "عفوا"], "answer": 1}]}'),
(1, 'Pronunciation: Greetings', 'النطق: التحيات', 'pronunciation', 4, '{"words": ["Hello", "Good morning", "Good evening", "How are you"]}'),
(1, 'AI Conversation: Meeting Someone', 'محادثة ذكية: مقابلة شخص', 'conversation', 5, '{"scenario": "You meet someone for the first time. Practice greeting them and asking how they are."}')
ON CONFLICT DO NOTHING;

-- Lessons for Level 2
INSERT INTO lessons (level_id, title_en, title_ar, type, order_index, content) VALUES
(2, 'My Name Is...', 'اسمي...', 'lesson', 1, '{"phrases": [{"en": "My name is...", "ar": "اسمي...", "pron": "mai neim iz"}, {"en": "I am from...", "ar": "أنا من...", "pron": "ai am from"}, {"en": "I live in...", "ar": "أعيش في...", "pron": "ai liv in"}, {"en": "I am a student", "ar": "أنا طالب", "pron": "ai am a stoo-dent"}]}'),
(2, 'Talking About Yourself', 'الحديث عن نفسك', 'lesson', 2, '{"phrases": [{"en": "I am years old", "ar": "عمري ... سنة", "pron": "ai am yirs old"}, {"en": "My hobby is reading", "ar": "هوايتي القراءة", "pron": "mai hob-bee iz ree-ding"}, {"en": "I enjoy cooking", "ar": "أستمتع بالطبخ", "pron": "ai in-joi koo-king"}]}'),
(2, 'Self Introduction Quiz', 'اختبار التعريف بالنفس', 'quiz', 3, '{"questions": [{"q_en": "How do you say My name is Ahmed?", "q_ar": "كيف تقول اسمي أحمد؟", "options": ["My name is Ahmed", "I am Ahmed", "Call me Ahmed", "He is Ahmed"], "answer": 0}]}')
ON CONFLICT DO NOTHING;

-- Vocabulary: Food category
INSERT INTO vocabulary (word_en, word_ar, pronunciation_en, pronunciation_ar, category, example_sentence_en, example_sentence_ar, difficulty) VALUES
('Apple', 'تفاحة', 'AP-ul', 'أبل', 'food', 'I eat an apple every morning.', 'آكل تفاحة كل صباح.', 1),
('Bread', 'خبز', 'BRED', 'بريد', 'food', 'Can I have some bread?', 'هل يمكنني الحصول على بعض الخبز؟', 1),
('Water', 'ماء', 'WAW-ter', 'وتر', 'food', 'I would like a glass of water.', 'أريد كوبا من الماء.', 1),
('Chicken', 'دجاج', 'CHIK-in', 'تشيكن', 'food', 'The chicken is delicious.', 'الدجاج لذيذ.', 1),
('Rice', 'أرز', 'RAYS', 'رايس', 'food', 'We eat rice with dinner.', 'نأكل الأرز مع العشاء.', 1),
('Coffee', 'قهوة', 'KAW-fee', 'كوفي', 'food', 'I drink coffee every morning.', 'أشرب القهوة كل صباح.', 1),
('Tea', 'شاي', 'TEE', 'تي', 'food', 'Would you like some tea?', 'هل تريد بعض الشاي؟', 1),
('Sugar', 'سكر', 'SHOO-gar', 'شوغر', 'food', 'No sugar in my coffee, please.', 'بدون سكر في القهوة من فضلك.', 1),
('Salt', 'ملح', 'SOLT', 'سولت', 'food', 'Add a little salt to the soup.', 'أضف قليلا من الملح للحساء.', 1),
('Milk', 'حليب', 'MILK', 'ميلك', 'food', 'I drink milk for breakfast.', 'أشرب الحليب في الإفطار.', 1)
ON CONFLICT DO NOTHING;

-- Vocabulary: Travel category
INSERT INTO vocabulary (word_en, word_ar, pronunciation_en, pronunciation_ar, category, example_sentence_en, example_sentence_ar, difficulty) VALUES
('Passport', 'جواز سفر', 'PAS-port', 'باسبورت', 'travel', 'Please show your passport.', 'من فضلك أظهر جواز سفرك.', 2),
('Ticket', 'تذكرة', 'TIK-et', 'تيكت', 'travel', 'I need to buy a ticket.', 'أحتاج لشراء تذكرة.', 2),
('Airport', 'مطار', 'AIR-port', 'إيربورت', 'travel', 'The airport is far from here.', 'المطار بعيد من هنا.', 2),
('Hotel', 'فندق', 'ho-TEL', 'هوتيل', 'travel', 'We booked a hotel near the beach.', 'حجزنا فندقا قريب الشاطئ.', 2),
('Luggage', 'أمتعة', 'LUG-ij', 'لاغيج', 'travel', 'My luggage is very heavy.', 'أمتعتي ثقيلة جدا.', 2),
('Flight', 'رحلة طيران', 'FLAIT', 'فلايت', 'travel', 'The flight is delayed.', 'الرحلة متأخرة.', 2),
('Boarding', 'صعود', 'BOR-ding', 'بوردينغ', 'travel', 'Boarding starts in 30 minutes.', 'يبدأ الصعود بعد 30 دقيقة.', 2),
('Departure', 'مغادرة', 'di-PAR-cher', 'ديبارتشر', 'travel', 'What time is the departure?', 'متى وقت المغادرة؟', 2),
('Arrival', 'وصول', 'uh-RIV-ul', 'أرايفل', 'travel', 'The arrival time is 5 PM.', 'وقت الوصول الساعة 5 مساء.', 2),
('Reservation', 'حجز', 'rez-er-VAY-shun', 'ريزيرفيشن', 'travel', 'I have a reservation under my name.', 'عندي حجز باسمي.', 2)
ON CONFLICT DO NOTHING;

-- Vocabulary: Business category
INSERT INTO vocabulary (word_en, word_ar, pronunciation_en, pronunciation_ar, category, example_sentence_en, example_sentence_ar, difficulty) VALUES
('Meeting', 'اجتماع', 'MEE-ting', 'ميتينغ', 'business', 'We have a meeting at 10 AM.', 'عندنا اجتماع الساعة 10 صباحا.', 3),
('Email', 'بريد إلكتروني', 'EE-mayl', 'إيميل', 'business', 'I sent you an email yesterday.', 'أرسلت لك إيميل أمس.', 3),
('Contract', 'عقد', 'KON-trakt', 'كونتراكت', 'business', 'Please review the contract.', 'من فضلك راجع العقد.', 3),
('Schedule', 'جدول', 'SKED-jool', 'سكيدجول', 'business', 'Let me check my schedule.', 'دعني أتحقق من جدولي.', 3),
('Deadline', 'موعد نهائي', 'DED-lain', 'ديدلاين', 'business', 'The deadline is next Friday.', 'الموعد النهائي الجمعة القادمة.', 3),
('Presentation', 'عرض تقديمي', 'pre-zen-TAY-shun', 'بريزنتيشن', 'business', 'I need to prepare a presentation.', 'أحتاج لإعداد عرض تقديمي.', 3),
('Salary', 'راتب', 'SAL-uh-ree', 'سيلري', 'business', 'The salary is negotiable.', 'الراتب قابل للتفاوض.', 3),
('Interview', 'مقابلة', 'IN-ter-vyoo', 'إنترفيو', 'business', 'The interview went well.', 'المقابلة went well.', 3),
('Manager', 'مدير', 'MAN-ij-er', 'مانجر', 'business', 'My manager approved the request.', 'مديري وافق على الطلب.', 3),
('Project', 'مشروع', 'PROJ-ekt', 'بروجكت', 'business', 'The project is on schedule.', 'المشروع في الموعد المحدد.', 3)
ON CONFLICT DO NOTHING;

-- Vocabulary: Daily Life
INSERT INTO vocabulary (word_en, word_ar, pronunciation_en, pronunciation_ar, category, example_sentence_en, example_sentence_ar, difficulty) VALUES
('Morning', 'صباح', 'MOR-ning', 'مورنينغ', 'daily_life', 'I wake up in the morning.', 'أستيقظ في الصباح.', 1),
('Night', 'ليل', 'NAIT', 'نايت', 'daily_life', 'Good night, sleep well.', 'طاب مساؤك، نم جيدا.', 1),
('Work', 'عمل', 'WERK', 'ويرك', 'daily_life', 'I go to work every day.', 'أذهب للعمل كل يوم.', 1),
('Home', 'منزل', 'HOHM', 'هوم', 'daily_life', 'I am at home now.', 'أنا في المنزل الآن.', 1),
('Friend', 'صديق', 'FREND', 'فرند', 'daily_life', 'She is my best friend.', 'هي أفضل صديقة لي.', 1),
('School', 'مدرسة', 'SKOOL', 'سكول', 'daily_life', 'The children are at school.', 'الأطفال في المدرسة.', 1),
('Car', 'سيارة', 'KAR', 'كار', 'daily_life', 'I drive my car to work.', 'أقود سيارتي للعمل.', 1),
('Bus', 'حافلة', 'BUS', 'باص', 'daily_life', 'I take the bus to school.', 'آخذ الحافلة للمدرسة.', 1),
('Phone', 'هاتف', 'FOHN', 'فون', 'daily_life', 'Call me on my phone.', 'اتصل بي على هاتفي.', 1),
('Time', 'وقت', 'TAIM', 'تايم', 'daily_life', 'What time is it?', 'كم الساعة؟', 1),
('Family', 'عائلة', 'FAM-uh-lee', 'فاميلي', 'daily_life', 'I love my family.', 'أحب عائلتي.', 1),
('Happy', 'سعيد', 'HAP-ee', 'هابي', 'daily_life', 'I am very happy today.', 'أنا سعيد جدا اليوم.', 1)
ON CONFLICT DO NOTHING;

-- Vocabulary: Restaurant
INSERT INTO vocabulary (word_en, word_ar, pronunciation_en, pronunciation_ar, category, example_sentence_en, example_sentence_ar, difficulty) VALUES
('Menu', 'قائمة', 'MEN-yoo', 'منيو', 'restaurant', 'Can I see the menu, please?', 'هل يمكنني رؤية القائمة من فضلك؟', 2),
('Order', 'طلب', 'OR-der', 'أوردر', 'restaurant', 'I would like to order now.', 'أريد أن أطلب الآن.', 2),
('Waiter', 'نادل', 'WAY-ter', 'ويتر', 'restaurant', 'Excuse me, waiter!', 'عذرا، نادل!', 2),
('Bill', 'فاتورة', 'BIL', 'بيل', 'restaurant', 'Can I have the bill, please?', 'هل يمكنني الحصول على الفاتورة من فضلك؟', 2),
('Delicious', 'لذيذ', 'di-LISH-us', 'ديليشس', 'restaurant', 'This food is delicious!', 'هذا الطعام لذيذ!', 2),
('Spicy', 'حار', 'SPAI-see', 'سبايسي', 'restaurant', 'I like spicy food.', 'أحب الطعام الحار.', 2),
('Appetizer', 'مقبلات', 'AP-uh-tai-zer', 'أبيتايزر', 'restaurant', 'We ordered an appetizer.', 'طلبنا مقبلات.', 2),
('Dessert', 'حلوى', 'di-ZERT', 'ديزيرت', 'restaurant', 'Would you like dessert?', 'هل تريد حلوى؟', 2),
('Drink', 'مشروب', 'DRINK', 'درينك', 'restaurant', 'What would you like to drink?', 'ماذا تريد أن تشرب؟', 2),
('Service', 'خدمة', 'SER-vis', 'سيرفس', 'restaurant', 'The service was excellent.', 'الخدمة كانت ممتازة.', 2)
ON CONFLICT DO NOTHING;

-- Sentences
INSERT INTO sentences (sentence_en, sentence_ar, pronunciation_guide, category, difficulty) VALUES
('Hello, how are you today?', 'مرحبا، كيف حالك اليوم؟', 'heh-LOH, hau ar yoo tuh-DAY', 'daily_life', 1),
('Nice to meet you!', 'سررت بلقائك!', 'nais tuh meet yoo', 'daily_life', 1),
('My name is Ahmed.', 'اسمي أحمد.', 'mai neim iz AH-med', 'daily_life', 1),
('Can you help me, please?', 'هل يمكنك مساعدتي من فضلك؟', 'kan yoo help mee pleez', 'daily_life', 1),
('Where is the bathroom?', 'أين الحمام؟', 'wehr iz thuh BATH-room', 'daily_life', 1),
('I would like to order, please.', 'أريد أن أطلب من فضلك.', 'ai wud laik tuh OR-der pleez', 'restaurant', 2),
('Can I have the menu?', 'هل يمكنني الحصول على القائمة؟', 'kan ai hav thuh MEN-yoo', 'restaurant', 2),
('The food was delicious, thank you.', 'الطعام كان لذيذا، شكرا.', 'thuh food wuz di-LISH-us thank yoo', 'restaurant', 2),
('I need a room for two nights.', 'أحتاج غرفة لليلتين.', 'ai need uh room for too naits', 'hotel', 2),
('What time is breakfast?', 'متى وقت الإفطار؟', 'wot taim iz BREAK-fust', 'hotel', 2),
('I have a reservation.', 'عندي حجز.', 'ai hav uh rez-er-VAY-shun', 'travel', 2),
('Where is gate number 5?', 'أين البوابة رقم 5؟', 'wehr iz gait NUM-ber faiv', 'airport', 3),
('My flight is at 3 PM.', 'رحلتي الساعة 3 مساء.', 'mai flait iz at three pee-em', 'airport', 3),
('How much does this cost?', 'كم يكلف هذا؟', 'hau mush duz this kost', 'shopping', 2),
('Do you have a smaller size?', 'هل لديكم مقاس أصغر؟', 'doo yoo hav uh SMAW-ler saiz', 'shopping', 2),
('I would like to schedule a meeting.', 'أريد تحديد موعد اجتماع.', 'ai wud laik tuh SKED-jool uh MEE-ting', 'business', 3),
('Could you send me the report?', 'هل يمكنك إرسال التقرير لي؟', 'kood yoo send mee thuh ri-PORT', 'business', 3),
('I am applying for the manager position.', 'أقدم طلبا لمنصب المدير.', 'ai am uh-PLAI-ing for thuh MAN-ij-er po-ZISH-un', 'business', 4),
('In my opinion, we should proceed.', 'في رأيي، يجب أن نمضي قدما.', 'in mai uh-PIN-yun wee shood pro-SEED', 'advanced', 4),
('I disagree with that approach.', 'أختلف مع هذا النهج.', 'ai dis-uh-GREE with that uh-PROCH', 'advanced', 4),
('Welcome everyone to today''s presentation.', 'مرحبا بالجميع في عرض اليوم التقديمي.', 'WEL-kum EV-ree-wan tuh tuh-DAYZ pre-zen-TAY-shun', 'advanced', 5),
('Thank you for your attention.', 'شكرا لاهتمامكم.', 'thank yoo for yor uh-TEN-shun', 'advanced', 5)
ON CONFLICT DO NOTHING;

-- Achievements
INSERT INTO achievements (name_en, name_ar, description_en, description_ar, icon, category, requirement_type, requirement_value, xp_bonus) VALUES
('First Step', 'الخطوة الأولى', 'Complete your first lesson', 'أكمل درسك الأول', 'Star', 'learning', 'lessons_completed', 1, 25),
('Week Warrior', 'محارب الأسبوع', 'Maintain a 7-day streak', 'حافظ على سلسلة 7 أيام', 'Flame', 'streak', 'streak_days', 7, 100),
('Monthly Master', 'ماستر الشهر', 'Maintain a 30-day streak', 'حافظ على سلسلة 30 يوم', 'Shield', 'streak', 'streak_days', 30, 500),
('First Conversation', 'أول محادثة', 'Complete your first AI conversation', 'أكمل أول محادثة ذكية', 'MessageCircle', 'conversation', 'conversations_completed', 1, 50),
('Pronunciation Pro', 'محترف النطق', 'Score 90+ on a pronunciation exercise', 'حقق 90+ في تمرين نطق', 'Mic', 'pronunciation', 'pronunciation_score', 90, 75),
('Vocabulary Hero', 'بطل المفردات', 'Learn 100 vocabulary words', 'تعلم 100 كلمة', 'BookOpen', 'vocabulary', 'words_learned', 100, 200),
('English Explorer', 'مستكشف الإنجليزية', 'Complete 5 different levels', 'أكمل 5 مستويات مختلفة', 'Globe', 'learning', 'levels_completed', 5, 300),
('Legend', 'أسطورة', 'Maintain a 365-day streak', 'حافظ على سلسلة 365 يوم', 'Crown', 'streak', 'streak_days', 365, 5000)
ON CONFLICT DO NOTHING;

-- Roleplay Scenarios
INSERT INTO roleplay_scenarios (title_en, title_ar, description_en, description_ar, icon, ai_prompt, category, difficulty) VALUES
('Restaurant Ordering', 'طلب في المطعم', 'Practice ordering food at a restaurant', 'تمرن على طلب الطعام في مطعم', 'UtensilsCrossed', 'You are a friendly waiter at a restaurant. Greet the customer, offer the menu, take their order, and handle any special requests. Be patient and helpful. Respond in simple English.', 'restaurant', 2),
('Hotel Check-in', 'تسجيل دخول الفندق', 'Check into a hotel and request services', 'سجل دخول فندق واطلب خدمات', 'Hotel', 'You are a hotel receptionist. Help the guest check in, explain room features, and answer questions about hotel amenities. Be professional and courteous.', 'hotel', 2),
('Airport Security', 'أمن المطار', 'Go through airport security and boarding', 'مر عبر أمن المطار والصعود', 'Building2', 'You are an airport security officer and then a gate agent. Ask the traveler standard security questions, check their boarding pass, and guide them to their gate.', 'airport', 3),
('Job Interview', 'مقابلة عمل', 'Practice a job interview scenario', 'تمرن على سيناريو مقابلة عمل', 'FileText', 'You are a hiring manager conducting a job interview. Ask standard interview questions about experience, strengths, weaknesses, and why they want the job. Be professional but encouraging.', 'business', 4),
('Shopping Mall', 'مركز تسوق', 'Shop for clothes and ask about prices', 'تسوق للملابب واسأل عن الأسعار', 'ShoppingBag', 'You are a store clerk at a clothing shop. Help the customer find what they are looking for, suggest sizes and colors, and handle payment questions.', 'shopping', 2),
('Business Meeting', 'اجتماع عمل', 'Participate in a business meeting', 'شارك في اجتماع عمل', 'Briefcase', 'You are a colleague in a business meeting. Discuss project updates, share ideas, and ask for input. Use professional language but keep it accessible.', 'business', 4),
('Coffee Shop', 'مقهى', 'Order coffee and chat at a coffee shop', 'اطلب قهوة وتحدث في مقهى', 'Coffee', 'You are a barista at a coffee shop. Take the customers order, suggest drinks, make small talk, and be friendly and casual.', 'daily_life', 1),
('Hospital Visit', 'زيارة المستشفى', 'Visit a doctor and describe symptoms', 'زر طبيبا وصف الأعراض', 'Heart', 'You are a doctor. Ask the patient about their symptoms, medical history, and how they are feeling. Give simple medical advice and be caring and patient.', 'daily_life', 3),
('Tourist Guide', 'دليل سياحي', 'Ask a tourist guide for recommendations', 'اسأل دليل سياحي عن توصيات', 'Map', 'You are a tourist guide in a major city. Help the tourist with directions, recommend places to visit, and share interesting facts. Be enthusiastic and helpful.', 'travel', 2)
ON CONFLICT DO NOTHING;
