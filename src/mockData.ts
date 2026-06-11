import { Question } from './types';

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    language: '英语',
    type: '填空',
    difficulty: '中等',
    dimension: '阅读',
    originalArticle: 'We live on a beautiful planet called Earth. It is the third planet from the Sun. Earth is the only known astronomical object to harbor life.',
    articleContent: 'We live on a beautiful planet called Earth. It is the [填空1] planet from the Sun. Earth is the only known astronomical object to harbor [填空2].',
    originalQuestion: 'Complete the reading passage above.',
    questionContent: 'Enter the position of Earth and what is unique about it.',
    imageUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=600&q=80',
    enabled: true,
    blankAnswers: [
      {
        id: '填空1',
        label: '填空 1 (地球是第几行星)',
        acceptableAnswers: ['third', '3rd', '3', '第三'],
        placeholder: 'e.g., third'
      },
      {
        id: '填空2',
        label: '填空 2 (地球孕育了什么)',
        acceptableAnswers: ['life', 'lives', 'living things', 'living organisms', '生命'],
        placeholder: 'e.g., life'
      }
    ],
    createdAt: '2026-06-10T10:00:00Z'
  },
  {
    id: 'q2',
    language: '英语',
    type: '单选',
    difficulty: '简单',
    dimension: '词汇',
    originalArticle: 'A dictionary is a book that lists the words of a language in alphabetical order and gives their meaning.',
    articleContent: 'A dictionary is a book that lists the words of a language in alphabetical order and gives their meaning.',
    originalQuestion: 'What does a dictionary list?',
    questionContent: 'What does a dictionary list in alphabetical order?',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    options: ['A) Pictures', 'B) Words', 'C) Numbers', 'D) Formulas'],
    correctOption: 'B',
    enabled: true,
    createdAt: '2026-06-09T08:30:00Z'
  },
  {
    id: 'q3',
    language: '中文',
    type: '填空',
    difficulty: '简单',
    dimension: '阅读',
    originalArticle: '静夜思\n床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
    articleContent: '静夜思\n床前明月光，疑是地上霜。\n[填空1]望明月，[填空2]思故乡。',
    originalQuestion: '补全唐诗《静夜思》最后两句。',
    questionContent: '请填入《静夜思》中空缺的两个动作/词语。',
    enabled: true,
    blankAnswers: [
      {
        id: '填空1',
        label: '填空 1 (第三句前两个字)',
        acceptableAnswers: ['举头', '抬头'],
        placeholder: '请输入：举头/抬头'
      },
      {
        id: '填空2',
        label: '填空 2 (第四句前两个字)',
        acceptableAnswers: ['低头', '俯首'],
        placeholder: '请输入：低头'
      }
    ],
    createdAt: '2026-06-08T14:15:00Z'
  },
  {
    id: 'q4',
    language: '英语',
    type: '多选',
    difficulty: '困难',
    dimension: '语法',
    originalArticle: 'Although both steel and concrete are durable building materials, stainless steel offers significantly better resistance to corrosion than carbon steel under marine environments.',
    articleContent: 'Although both steel and concrete are durable building materials, stainless steel offers significantly better resistance to corrosion than carbon steel under marine environments.',
    originalQuestion: 'Which of the following statement are true according to the passage?',
    questionContent: 'Select all accurate qualities mentioned:',
    options: [
      'A) Concrete is not a durable building material.',
      'B) Stainless steel resists corrosion better than carbon steel in marine environments.',
      'C) Carbon steel is better in marine environments.',
      'D) Both steel and concrete are durable.'
    ],
    correctOption: ['B', 'D'],
    enabled: true,
    createdAt: '2026-06-07T11:20:00Z'
  }
];
