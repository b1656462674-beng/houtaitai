import React, { useState, useEffect, useRef } from 'react';
import { X, Undo, Redo, Underline, PlusCircle, AlertCircle, Trash2, Plus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, QuestionType, Language, Difficulty, Dimension, BlankAnswerConfig } from '../types';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
  questionToEdit: Question | null;
}

const LANGUAGES: Language[] = ['英语', '中文', '日语', '韩语', '法语'];
const TYPES: QuestionType[] = ['单选', '多选', '填空'];
const DIFFICULTIES: Difficulty[] = ['简单', '中等', '困难'];
const DIMENSIONS: Dimension[] = ['词汇', '语法', '阅读', '听力'];

export default function AddQuestionModal({
  isOpen,
  onClose,
  onSave,
  questionToEdit
}: AddQuestionModalProps) {
  // --- Form States ---
  const [language, setLanguage] = useState<Language>('英语');
  const [type, setType] = useState<QuestionType>('单选');
  const [difficulty, setDifficulty] = useState<Difficulty>('中等');
  const [dimension, setDimension] = useState<Dimension>('阅读');
  const [originalArticle, setOriginalArticle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [originalQuestion, setOriginalQuestion] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [enabled, setEnabled] = useState(true);

  // Single/Multi Choice States
  const [options, setOptions] = useState<string[]>(['A) 选项 A', 'B) 选项 B', 'C) 选项 C', 'D) 选项 D']);
  const [correctOption, setCorrectOption] = useState<string>('A'); // e.g. "A" for choice
  const [correctOptionMulti, setCorrectOptionMulti] = useState<string[]>(['A']); // array for multi-choice

  // Fill in the Blank States
  const [blankAnswers, setBlankAnswers] = useState<BlankAnswerConfig[]>([]);
  const [newAnswerText, setNewAnswerText] = useState<{ [blankId: string]: string }>({});

  // History buffer for article content Undo/Redo
  const [articleHistory, setArticleHistory] = useState<string[]>([]);
  const [articleHistoryIndex, setArticleHistoryIndex] = useState(-1);

  const articleRef = useRef<HTMLTextAreaElement>(null);
  const questionContentRef = useRef<HTMLTextAreaElement>(null);

  // Initialize/Reset form when modal opens or question changes
  useEffect(() => {
    if (isOpen) {
      if (questionToEdit) {
        setLanguage(questionToEdit.language);
        setType(questionToEdit.type);
        setDifficulty(questionToEdit.difficulty);
        setDimension(questionToEdit.dimension);
        setOriginalArticle(questionToEdit.originalArticle);
        setArticleContent(questionToEdit.articleContent);
        setOriginalQuestion(questionToEdit.originalQuestion);
        setQuestionContent(questionToEdit.questionContent);
        setImageUrl(questionToEdit.imageUrl || '');
        setEnabled(questionToEdit.enabled);

        if (questionToEdit.type === '单选' && typeof questionToEdit.correctOption === 'string') {
          setOptions(questionToEdit.options || ['A) 选项 A', 'B) 选项 B', 'C) 选项 C', 'D) 选项 D']);
          setCorrectOption(questionToEdit.correctOption);
        } else if (questionToEdit.type === '多选' && Array.isArray(questionToEdit.correctOption)) {
          setOptions(questionToEdit.options || ['A) 选项 A', 'B) 选项 B', 'C) 选项 C', 'D) 选项 D']);
          setCorrectOptionMulti(questionToEdit.correctOption);
        } else if (questionToEdit.type === '填空') {
          setBlankAnswers(questionToEdit.blankAnswers || []);
        }

        setArticleHistory([questionToEdit.articleContent]);
        setArticleHistoryIndex(0);
      } else {
        // Reset to default
        setLanguage('英语');
        setType('单选');
        setDifficulty('中等');
        setDimension('阅读');
        setOriginalArticle('');
        setArticleContent('');
        setOriginalQuestion('');
        setQuestionContent('');
        setImageUrl('');
        setEnabled(true);
        setOptions(['A) 选项 A', 'B) 选项 B', 'C) 选项 C', 'D) 选项 D']);
        setCorrectOption('A');
        setCorrectOptionMulti(['A']);
        setBlankAnswers([]);
        setArticleHistory(['']);
        setArticleHistoryIndex(0);
      }
    }
  }, [isOpen, questionToEdit]);

  // Keep history for Article Content
  const updateArticleContentWithHistory = (newVal: string) => {
    setArticleContent(newVal);
    const updatedHistory = articleHistory.slice(0, articleHistoryIndex + 1);
    updatedHistory.push(newVal);
    setArticleHistory(updatedHistory);
    setArticleHistoryIndex(updatedHistory.length - 1);
  };

  const handleUndo = () => {
    if (articleHistoryIndex > 0) {
      const prevIndex = articleHistoryIndex - 1;
      setArticleHistoryIndex(prevIndex);
      setArticleContent(articleHistory[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (articleHistoryIndex < articleHistory.length - 1) {
      const nextIndex = articleHistoryIndex + 1;
      setArticleHistoryIndex(nextIndex);
      setArticleContent(articleHistory[nextIndex]);
    }
  };

  // Scan text and detect custom blanks e.g., [填空1], [填空2] or [blank1]
  // We'll scan both articleContent and questionContent
  useEffect(() => {
    if (type !== '填空') return;

    const regex = /\[填空(\d+)\]/g;
    const detectedBlanks: string[] = [];
    let match;

    // Scan article
    while ((match = regex.exec(articleContent)) !== null) {
      const blankId = `填空${match[1]}`;
      if (!detectedBlanks.includes(blankId)) {
        detectedBlanks.push(blankId);
      }
    }

    // Scan question content
    const qRegex = /\[填空(\d+)\]/g;
    while ((match = qRegex.exec(questionContent)) !== null) {
      const blankId = `填空${match[1]}`;
      if (!detectedBlanks.includes(blankId)) {
        detectedBlanks.push(blankId);
      }
    }

    // Sort detected blanks numerically e.g. 填空1, 填空2
    detectedBlanks.sort((a, b) => {
      const numA = parseInt(a.replace('填空', ''), 10);
      const numB = parseInt(b.replace('填空', ''), 10);
      return numA - numB;
    });

    // Merge with current state configs to keep existing answers
    setBlankAnswers(prev => {
      const updated = detectedBlanks.map(id => {
        const existing = prev.find(config => config.id === id);
        if (existing) {
          return existing;
        }
        return {
          id,
          label: `填空 ${id.replace('填空', '')}`,
          acceptableAnswers: [],
          placeholder: '请输入正确答案'
        };
      });
      return updated;
    });
  }, [articleContent, questionContent, type]);

  // Insert [填空X] helper
  const handleInsertBlank = (textareaRef: React.RefObject<HTMLTextAreaElement | null>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = textarea.value;

    // Determine next blank index
    const regex = /\[填空(\d+)\]/g;
    let maxIndex = 0;
    let match;
    while ((match = regex.exec(articleContent)) !== null) {
      const idx = parseInt(match[1], 10);
      if (idx > maxIndex) maxIndex = idx;
    }
    while ((match = regex.exec(questionContent)) !== null) {
      const idx = parseInt(match[1], 10);
      if (idx > maxIndex) maxIndex = idx;
    }
    const nextIndex = maxIndex + 1;
    const placeholder = `[填空${nextIndex}]`;

    const nextText = text.substring(0, startPos) + placeholder + text.substring(endPos);

    if (textareaRef === articleRef) {
      updateArticleContentWithHistory(nextText);
    } else {
      setQuestionContent(nextText);
    }

    // Retain focus
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = startPos + placeholder.length;
      textarea.selectionEnd = startPos + placeholder.length;
    }, 0);
  };

  // Style selected text as underlined
  const handleUnderlineSelectedText = (textareaRef: React.RefObject<HTMLTextAreaElement | null>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = textarea.value;

    if (startPos === endPos) {
      alert('请先选择要画下划线的文本！');
      return;
    }

    const selectedText = text.substring(startPos, endPos);
    const underlinedText = `<u>${selectedText}</u>`;

    const nextText = text.substring(0, startPos) + underlinedText + text.substring(endPos);

    if (textareaRef === articleRef) {
      updateArticleContentWithHistory(nextText);
    } else {
      setQuestionContent(nextText);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = startPos + underlinedText.length;
      textarea.selectionEnd = startPos + underlinedText.length;
    }, 0);
  };

  // Add acceptable answer to a blank
  const handleAddAcceptableAnswer = (blankId: string) => {
    const text = newAnswerText[blankId]?.trim();
    if (!text) return;

    setBlankAnswers(prev =>
      prev.map(config => {
        if (config.id === blankId) {
          if (config.acceptableAnswers.includes(text)) return config; // no duplicates
          return {
            ...config,
            acceptableAnswers: [...config.acceptableAnswers, text]
          };
        }
        return config;
      })
    );

    setNewAnswerText(prev => ({
      ...prev,
      [blankId]: ''
    }));
  };

  // Remove acceptable answer from blank
  const handleRemoveAcceptableAnswer = (blankId: string, idxToRemove: number) => {
    setBlankAnswers(prev =>
      prev.map(config => {
        if (config.id === blankId) {
          return {
            ...config,
            acceptableAnswers: config.acceptableAnswers.filter((_, idx) => idx !== idxToRemove)
          };
        }
        return config;
      })
    );
  };

  // Choice Options Helpers
  const handleAddOption = () => {
    const nextLetter = String.fromCharCode(65 + options.length); // E, F, G...
    setOptions([...options, `${nextLetter}) 新选项`]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      alert('单选/多选题至少需要 2 个选项！');
      return;
    }
    const filtered = options.filter((_, i) => i !== index);
    // Renormalize letters
    const reordered = filtered.map((opt, i) => {
      const letter = String.fromCharCode(65 + i);
      const textOnly = opt.includes(')') ? opt.split(')').slice(1).join(')').trim() : opt;
      return `${letter}) ${textOnly}`;
    });
    setOptions(reordered);
  };

  const handleUpdateOptionText = (index: number, newText: string) => {
    const letter = String.fromCharCode(65 + index);
    const updated = [...options];
    updated[index] = `${letter}) ${newText}`;
    setOptions(updated);
  };

  // Form Save
  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();

    if (!articleContent.trim()) {
      alert('请输入文章内容！');
      return;
    }

    if (type === '填空') {
      if (blankAnswers.length === 0) {
        alert('请在文章内容或题目内容中，通过插入 [填空1] 格式插入至少一个填空位置！');
        return;
      }
      // Check if all blanks have at least one acceptable answer
      const emptyBlank = blankAnswers.find(b => b.acceptableAnswers.length === 0);
      if (emptyBlank) {
        alert(`请为【${emptyBlank.label}】设置至少一个正确答案！`);
        return;
      }
    }

    const payload: Question = {
      id: questionToEdit?.id || `q_${Date.now()}`,
      language,
      type,
      difficulty,
      dimension,
      originalArticle,
      articleContent,
      originalQuestion,
      questionContent,
      imageUrl: imageUrl.trim() || undefined,
      enabled,
      createdAt: questionToEdit?.createdAt || new Date().toISOString(),
      ...(type === '单选' && {
        options,
        correctOption
      }),
      ...(type === '多选' && {
        options,
        correctOption: correctOptionMulti
      }),
      ...(type === '填空' && {
        blankAnswers
      })
    };

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1e293b] text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <h2 className="text-lg font-semibold tracking-wide">
              {questionToEdit ? '编辑题目' : '新增题目'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-gray-300 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <form onSubmit={handleSaveClick} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
            {/* Language & Type */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <span className="text-red-500 font-bold">*</span> 语种：
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full px-3.5 py-2 hover:border-gray-400 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="text-red-500 font-bold">*</span> 类型：
                </label>
                <div className="flex items-center gap-4 py-1">
                  {TYPES.map(t => (
                    <label key={t} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="questionType"
                        checked={type === t}
                        onChange={() => setType(t)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={type === t ? 'font-medium text-blue-600' : ''}>
                        {t === '填空' ? '📖 阅读填空 (新设)' : t}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Difficulty & Skill/Dimension */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="text-red-500 font-bold">*</span> 难度：
                </label>
                <div className="flex items-center gap-4 py-1">
                  {DIFFICULTIES.map(diff => (
                    <label key={diff} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="difficulty"
                        checked={difficulty === diff}
                        onChange={() => setDifficulty(diff)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={difficulty === diff ? 'font-medium text-blue-600' : ''}>{diff}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="text-red-500 font-bold">*</span> 维度：
                </label>
                <div className="flex items-center gap-4 py-1">
                  {DIMENSIONS.map(dim => (
                    <label key={dim} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="dimension"
                        checked={dimension === dim}
                        onChange={() => setDimension(dim)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={dimension === dim ? 'font-medium text-blue-600' : ''}>{dim}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Article Original text */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              <span className="text-red-500 font-bold">*</span> 文章原文：
            </label>
            <textarea
              value={originalArticle}
              onChange={(e) => setOriginalArticle(e.target.value)}
              placeholder="请输入文章原文，不含任何HTML标签或占位符..."
              className="w-full h-18 px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all resize-y"
            />
          </div>

          {/* Article Content with Editor controls */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <span className="text-red-500 font-bold">*</span> 文章内容：
                {type === '填空' && (
                  <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Info size={12} />
                    提示：在要挖空的地方点击【插入填空】按钮
                  </span>
                )}
              </label>

              {/* Editor Toolbar */}
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={articleHistoryIndex <= 0}
                  className="p-1 hover:bg-gray-200 text-gray-600 rounded disabled:opacity-40 transition-colors cursor-pointer"
                  title="撤销 (Undo)"
                >
                  <Undo size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={articleHistoryIndex >= articleHistory.length - 1}
                  className="p-1 hover:bg-gray-200 text-gray-600 rounded disabled:opacity-40 transition-colors cursor-pointer"
                  title="重做 (Redo)"
                >
                  <Redo size={14} />
                </button>
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  onClick={() => handleUnderlineSelectedText(articleRef)}
                  className="p-1 hover:bg-gray-200 text-gray-600 rounded flex items-center gap-0.5 text-xs transition-colors cursor-pointer"
                  title="选中后画下划线"
                >
                  <Underline size={14} />
                  <span className="text-[10px] text-gray-500 font-medium">下划线</span>
                </button>

                {type === '填空' && (
                  <>
                    <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => handleInsertBlank(articleRef)}
                      className="px-2 py-0.5 hover:bg-emerald-100 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-1 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                      title="在光标处插入填空项"
                    >
                      <PlusCircle size={13} />
                      <span>插入填空 [____]</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <textarea
              ref={articleRef}
              value={articleContent}
              onChange={(e) => updateArticleContentWithHistory(e.target.value)}
              placeholder={
                type === '填空'
                  ? '请输入文章内容。点击上方的 “插入填空” 按钮在特定位置安插 [填空1]、[填空2] 占位符。'
                  : '请输入文章内容。您可以选择特定文本，点击 “下划线” 为其添加 <u>标签'
              }
              className="w-full h-32 px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all resize-y font-mono"
            />
          </div>

          {/* Question original text & content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                <span className="text-red-500 font-bold">*</span> 题目原文：
              </label>
              <textarea
                value={originalQuestion}
                onChange={(e) => setOriginalQuestion(e.target.value)}
                placeholder="请输入题目问句或填空说明的纯文本..."
                className="w-full h-24 px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500 font-bold">*</span> 题目内容：
                </label>

                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleUnderlineSelectedText(questionContentRef)}
                    className="p-1 hover:bg-gray-200 text-gray-600 rounded flex items-center gap-0.5 text-xs cursor-pointer"
                    title="选中后画下划线"
                  >
                    <Underline size={13} />
                    <span className="text-[10px] text-gray-500">下划线</span>
                  </button>
                  {type === '填空' && (
                    <button
                      type="button"
                      onClick={() => handleInsertBlank(questionContentRef)}
                      className="px-1.5 py-0.5 hover:bg-emerald-100 text-emerald-700 rounded flex items-center gap-0.5 text-xs font-semibold cursor-pointer"
                      title="插入填空项"
                    >
                      <PlusCircle size={12} />
                      <span>插填空</span>
                    </button>
                  )}
                </div>
              </div>
              <textarea
                ref={questionContentRef}
                value={questionContent}
                onChange={(e) => setQuestionContent(e.target.value)}
                placeholder="请输入题目详细描述。如有需要也可以选择文本画下划线或插入填空。"
                className="w-full h-24 px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all resize-y font-mono"
              />
            </div>
          </div>

          {/* Image URL with Preview support */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              图片URL：
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="请输入配图的URL地址 (如 https://example.com/image.jpg)..."
                className="flex-1 px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  // Pre-fill a beautiful stock educational image
                  const randomImages = [
                    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80'
                  ];
                  const randIndex = Math.floor(Math.random() * randomImages.length);
                  setImageUrl(randomImages[randIndex]);
                }}
                className="px-4 py-2 hover:bg-gray-100 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-xs hover:border-gray-400 cursor-pointer"
              >
                🔮 随机配图
              </button>
            </div>
            {imageUrl.trim() && (
              <div className="mt-2 text-center bg-gray-50 border border-dashed border-gray-200 p-2.5 rounded-lg max-w-sm">
                <span className="text-[11px] font-medium text-gray-500 block mb-1">图片预览：</span>
                <img
                  src={imageUrl}
                  alt="Avatar preview"
                  referrerPolicy="no-referrer"
                  className="max-h-24 mx-auto rounded object-cover shadow-2xs border border-gray-100"
                  onError={() => {}}
                />
              </div>
            )}
          </div>

          {/* Interactive Block Based on Question Type */}
          <AnimatePresence mode="wait">
            {/* 1. If Choice Questons (单选 / 多选) */}
            {type !== '填空' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
                  <span className="text-sm font-semibold text-blue-800 flex items-center gap-1.5">
                    ⚙️ 选项与正确答案配置 ({type === '单选' ? '单选题' : '多选题'})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs font-semibold px-2.5 py-1 hover:bg-blue-600 bg-blue-500 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-3xs"
                  >
                    <Plus size={13} />
                    追加选项
                  </button>
                </div>

                <div className="space-y-3">
                  {options.map((opt, index) => {
                    const letter = String.fromCharCode(65 + index);
                    const isChecked = type === '单选'
                      ? correctOption === letter
                      : correctOptionMulti.includes(letter);

                    // Extract actual text inside the option (strip e.g., "A) ")
                    const optText = opt.includes(')') ? opt.split(')').slice(1).join(')').trim() : opt;

                    return (
                      <div key={index} className="flex items-center gap-3 bg-white p-2 border border-gray-200 rounded-lg shadow-3xs">
                        {/* Selector indicator */}
                        <div className="flex items-center justify-center">
                          {type === '单选' ? (
                            <input
                              type="radio"
                              name="correctOptionRadio"
                              checked={isChecked}
                              onChange={() => setCorrectOption(letter)}
                              className="w-4 h-4 text-blue-600 cursor-pointer"
                              title="设为正确答案"
                            />
                          ) : (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (correctOptionMulti.includes(letter)) {
                                  setCorrectOptionMulti(correctOptionMulti.filter(l => l !== letter));
                                } else {
                                  setCorrectOptionMulti([...correctOptionMulti, letter].sort());
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                              title="勾选设为正确答案"
                            />
                          )}
                        </div>

                        {/* Letter indicator */}
                        <span className="text-sm font-bold w-6 text-gray-500">{letter}.</span>

                        {/* Text edit field */}
                        <input
                          type="text"
                          value={optText}
                          onChange={(e) => handleUpdateOptionText(index, e.target.value)}
                          placeholder={`请输入选项 ${letter} 的文字...`}
                          className="flex-1 px-3 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-800 shadow-none focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                        />

                        {/* Indicator tag if correct */}
                        {isChecked && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                            正确答案
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                          title="删除选项"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Answers Selection summary dropdown as in screenshot */}
                <div className="pt-3 border-t border-blue-100 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <span className="text-red-500 font-bold">*</span> 答案选项：
                  </div>
                  {type === '单选' ? (
                    <select
                      value={correctOption}
                      onChange={(e) => setCorrectOption(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none shadow-3xs"
                    >
                      {options.map((_, i) => {
                        const letter = String.fromCharCode(65 + i);
                        return <option key={letter} value={letter}>选项 {letter}</option>;
                      })}
                    </select>
                  ) : (
                    <div className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-3xs">
                      已选多选答案：{correctOptionMulti.join(', ')}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 2. If Fill in the Blank (填空) - This is our NEW interactive feature! */}
            {type === '填空' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-4"
              >
                <div className="border-b border-emerald-100 pb-2.5">
                  <span className="text-sm font-semibold text-emerald-800 flex items-center gap-1.5">
                    🎯 填空题正确答案池设置
                  </span>
                  <p className="text-xs text-emerald-600 mt-1 font-medium">
                    您可以在前方的文章或题目内容中，随时书写 <code className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-mono">[填空1]</code>、<code className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-mono">[填空2]</code> 等占位符。系统已自动为您匹配到以下输入项：
                  </p>
                </div>

                {blankAnswers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-lg">
                    <AlertCircle size={32} className="text-gray-300 mb-2" />
                    <p className="text-sm font-medium">尚未匹配到任何填空项</p>
                    <p className="text-xs text-gray-400 mt-0.5 max-w-sm px-6">
                      请在上方的“文章内容”或“题目内容”中输入/插入 <code className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded font-mono">[填空1]</code> 格式的代码来声明一个填空。
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blankAnswers.map((config) => {
                      const blankId = config.id;
                      const acceptableList = config.acceptableAnswers;

                      return (
                        <div key={blankId} className="bg-white border border-gray-200 rounded-xl p-4 shadow-3xs space-y-3">
                          {/* Inner list title */}
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                              {blankId} ({config.label.replace('填空', '填空 ')})
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">
                              已录入正确答案：<strong className="text-emerald-600 font-bold">{acceptableList.length}</strong> 个
                            </span>
                          </div>

                          {/* Horizontal chips of current acceptable answers */}
                          <div className="flex flex-wrap gap-1.5 p-1">
                            {acceptableList.length === 0 ? (
                              <span className="text-xs text-red-500 ml-1 flex items-center gap-1 font-semibold animate-pulse">
                                ⚠️ 警告：请必须录入至少一个可匹配正确答案！
                              </span>
                            ) : (
                              acceptableList.map((ans, aIdx) => (
                                <span
                                  key={aIdx}
                                  className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-bold rounded-lg border border-emerald-200 group hover:border-emerald-300 hover:bg-emerald-100/50 transition-all shadow-3xs"
                                >
                                  {ans}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAcceptableAnswer(blankId, aIdx)}
                                    className="p-0.5 hover:bg-emerald-200 rounded text-emerald-600 group-hover:text-emerald-800 cursor-pointer"
                                    title="删除此正确选项"
                                  >
                                    <X size={10} />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>

                          {/* Text input to append extra answers */}
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={newAnswerText[blankId] || ''}
                                onChange={(e) =>
                                  setNewAnswerText(prev => ({ ...prev, [blankId]: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddAcceptableAnswer(blankId);
                                  }
                                }}
                                placeholder="输入正确答案，按回车(Enter)或点击【追加答案】..."
                                className="w-full px-3 py-1.5 hover:border-gray-300 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 shadow-none focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddAcceptableAnswer(blankId)}
                              className="px-3.5 py-1.5 hover:bg-emerald-600 bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-3xs"
                            >
                              追加答案
                            </button>
                          </div>
                          <span className="text-[10px] text-gray-400 block ml-0.5 leading-relaxed font-medium">
                            💡 只要学生的填空答案与您设置的上述任意一个选项拼写相同即判定为正确（匹配时自动会去除前后空格，亦自动忽略大小写）。例如您可同时添加 "USA" 与 "America"、"United States" 两个词。
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enabled Switch State */}
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">启用状态：</h3>
              <p className="text-xs text-gray-500 mt-0.5">控制该题目是否可在前台工作台中被学生进行检索及日常练习答题</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => setEnabled(!enabled)}
                className="sr-only peer cursor-pointer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-2 text-sm font-bold text-gray-700">
                {enabled ? '启用中' : '禁用中'}
              </span>
            </label>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 hover:bg-gray-200 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleSaveClick}
            type="submit"
            className="px-6 py-2 hover:bg-blue-600 bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-md hover:shadow-lg cursor-pointer flex items-center gap-1.5"
          >
            确认提交
          </button>
        </div>
      </motion.div>
    </div>
  );
}
