import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, XCircle, RefreshCw, Star, ArrowRight, HelpCircle, AlertCircle, Bookmark } from 'lucide-react';
import { Question, BlankAnswerConfig, PracticeRecord } from '../types';

interface PracticeViewProps {
  questions: Question[];
  onAddRecord: (record: PracticeRecord) => void;
}

export default function PracticeView({ questions, onAddRecord }: PracticeViewProps) {
  const activeQuestions = questions.filter(q => q.enabled);

  // Available questions filtering
  const [selectedLanguage, setSelectedLanguage] = useState<string>('全部');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('全部');
  const [selectedType, setSelectedType] = useState<string>('全部');

  // Currently practicing question
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // User input answers state
  // For blanks: { "填空1": "user_typed_val", "填空2": "..." }
  // For single selection: { "choice": "B" }
  // For multi selection: { "selected": ["B", "D"] }
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [submitted, setSubmitted] = useState(false);
  const [evalResult, setEvalResult] = useState<{
    isCorrect: boolean;
    score: number;
    correctCount: number;
    totalCount: number;
    details: { [key: string]: { isCorrect: boolean; acceptable: string[] } };
  } | null>(null);

  // Pick first question on load
  useEffect(() => {
    if (activeQuestions.length > 0 && !currentQuestion) {
      setCurrentQuestion(activeQuestions[0]);
    }
  }, [activeQuestions, currentQuestion]);

  // Reset inputs when question changes
  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setEvalResult(null);
  }, [currentQuestion]);

  // Filter lists
  const filteredActiveQuestions = activeQuestions.filter(q => {
    const matchesLanguage = selectedLanguage === '全部' || q.language === selectedLanguage;
    const matchesDifficulty = selectedDifficulty === '全部' || q.difficulty === selectedDifficulty;
    const matchesType = selectedType === '全部' || q.type === selectedType;
    return matchesLanguage && matchesDifficulty && matchesType;
  });

  // Basic HTML underline tags string formatter
  const renderPartText = (text: string) => {
    if (!text) return '';
    if (!text.includes('<u>')) {
      return text;
    }
    const subParts = text.split(/(<u>.*?<\/u>)/g);
    return subParts.map((sub, idx) => {
      if (sub.startsWith('<u>') && sub.endsWith('</u>')) {
        const inner = sub.substring(3, sub.length - 4);
        return (
          <u key={idx} className="underline font-semibold decoration-sky-600 decoration-2 bg-sky-50 px-1 rounded-sm">
            {inner}
          </u>
        );
      }
      return sub;
    });
  };

  // Dynamic reading blank text parser
  const renderArticleWithInputs = (articleText: string, blankConfigs: BlankAnswerConfig[]) => {
    if (!articleText) return null;

    // Split text by blank brackets [填空1], [填空2], etc.
    const parts = articleText.split(/(\[填空\d+\])/g);

    return (
      <p className="leading-relaxed text-gray-800 text-sm md:text-base selection:bg-blue-100 whitespace-pre-wrap">
        {parts.map((part, index) => {
          const isBlankRef = /^\[填空\d+\]$/.test(part);

          if (isBlankRef) {
            const blankId = part.replace('[', '').replace(']', '');
            const config = blankConfigs.find(b => b.id === blankId);

            if (!config) {
              return <span key={index} className="text-red-500 font-mono font-bold">{part}</span>;
            }

            const currentVal = (answers[blankId] as string) || '';
            const isCorrect = evalResult?.details[blankId]?.isCorrect;

            return (
              <span key={index} className="inline-block mx-1.5 my-1 relative align-baseline">
                <input
                  type="text"
                  value={currentVal}
                  disabled={submitted}
                  onChange={(e) => {
                    setAnswers(prev => ({
                      ...prev,
                      [blankId]: e.target.value
                    }));
                  }}
                  placeholder={config.placeholder || `请输入...`}
                  className={`px-3 py-1 text-sm rounded-lg border font-semibold outline-none transition-all shadow-3xs w-36 text-center ${
                    submitted
                      ? isCorrect
                        ? 'bg-emerald-50 text-emerald-805 border-emerald-400 ring-2 ring-emerald-200'
                        : 'bg-rose-50 text-rose-805 border-rose-400 ring-2 ring-rose-200'
                      : 'bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-900'
                  }`}
                />
                {submitted && (
                  <span className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 text-[10px] font-bold">
                    {isCorrect ? (
                      <span className="text-emerald-600 bg-emerald-150 px-1.5 rounded shadow-2xs">✓ 对</span>
                    ) : (
                      <span className="text-rose-600 bg-rose-150 px-1.5 rounded shadow-2xs">✗ 错</span>
                    )}
                  </span>
                )}
              </span>
            );
          }

          // Otherwise parse regular text
          return <span key={index}>{renderPartText(part)}</span>;
        })}
      </p>
    );
  };

  // Similar parsing for question descriptors
  const renderQuestionWithInputs = (text: string, blankConfigs: BlankAnswerConfig[]) => {
    if (!text) return null;
    const parts = text.split(/(\[填空\d+\])/g);
    return (
      <span className="text-sm font-semibold text-gray-800 leading-relaxed">
        {parts.map((part, index) => {
          const isBlankRef = /^\[填空\d+\]$/.test(part);
          if (isBlankRef) {
            const blankId = part.replace('[', '').replace(']', '');
            const config = blankConfigs.find(b => b.id === blankId);
            if (!config) return <span key={index} className="text-red-500">{part}</span>;

            const currentVal = (answers[blankId] as string) || '';
            const isCorrect = evalResult?.details[blankId]?.isCorrect;

            return (
              <span key={index} className="inline-block mx-1 relative">
                <input
                  type="text"
                  value={currentVal}
                  disabled={submitted}
                  onChange={(e) => {
                    setAnswers(prev => ({
                      ...prev,
                      [blankId]: e.target.value
                    }));
                  }}
                  placeholder={config.placeholder || `请输入...`}
                  className={`px-2 py-0.5 max-w-28 text-xs border rounded text-center font-bold ${
                    submitted
                      ? isCorrect
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                        : 'bg-rose-50 text-rose-800 border-rose-400'
                      : 'bg-white border-gray-300 focus:border-blue-500'
                  }`}
                />
              </span>
            );
          }
          return <span key={index}>{renderPartText(part)}</span>;
        })}
      </span>
    );
  };

  // Core answer validation matching the user request:
  // "只要用户的输入内容和任意一个答案一致，则可以对" (As long as users input matches any of correct answers, it's correct)
  const handleSubmitAnswers = () => {
    if (!currentQuestion) return;

    let isCorrectOverall = true;
    let score = 0;
    let correctCount = 0;
    let totalCount = 1;
    const detailsMap: { [key: string]: { isCorrect: boolean; acceptable: string[] } } = {};

    if (currentQuestion.type === '填空') {
      const blanks = currentQuestion.blankAnswers || [];
      totalCount = blanks.length;

      blanks.forEach(b => {
        const userInput = (answers[b.id] || '').trim();
        // Compares ignoring case and outer spacing
        const isMatch = b.acceptableAnswers.some(
          ans => ans.trim().toLowerCase() === userInput.toLowerCase()
        );

        if (isMatch) {
          correctCount++;
        } else {
          isCorrectOverall = false;
        }

        detailsMap[b.id] = {
          isCorrect: isMatch,
          acceptable: b.acceptableAnswers
        };
      });

      score = Math.round((correctCount / totalCount) * 100);
    } else if (currentQuestion.type === '单选') {
      const selected = answers['choice'] || '';
      const isMatch = selected === currentQuestion.correctOption;
      if (isMatch) {
        correctCount = 1;
        score = 100;
      } else {
        isCorrectOverall = false;
        score = 0;
      }
      detailsMap['choice'] = {
        isCorrect: isMatch,
        acceptable: [currentQuestion.correctOption as string]
      };
    } else if (currentQuestion.type === '多选') {
      const selectedList: string[] = answers['selected'] || [];
      const correctList: string[] = (currentQuestion.correctOption as string[]) || [];

      // Sort and compare arrays
      const sortedSelected = [...selectedList].sort().join(',');
      const sortedCorrect = [...correctList].sort().join(',');

      const isMatch = sortedSelected === sortedCorrect;
      if (isMatch) {
        correctCount = 1;
        score = 100;
      } else {
        isCorrectOverall = false;
        score = 0;
      }
      detailsMap['selected'] = {
        isCorrect: isMatch,
        acceptable: correctList
      };
    }

    setEvalResult({
      isCorrect: isCorrectOverall,
      score,
      correctCount,
      totalCount,
      details: detailsMap
    });

    setSubmitted(true);

    // Save history record
    const record: PracticeRecord = {
      id: `rec_${Date.now()}`,
      questionId: currentQuestion.id,
      questionTitle: currentQuestion.originalQuestion || currentQuestion.questionContent.substring(0, 40),
      questionType: currentQuestion.type,
      userAnswers: currentQuestion.type === '填空'
        ? answers
        : currentQuestion.type === '单选'
          ? { choice: answers['choice'] }
          : { selected: answers['selected']?.join(',') },
      isCorrect: isCorrectOverall,
      score,
      timeSpentSeconds: Math.floor(Math.random() * 45) + 15, // Mock timer
      createdAt: new Date().toISOString()
    };

    onAddRecord(record);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setEvalResult(null);
  };

  const selectAnotherQuestion = (q: Question) => {
    setCurrentQuestion(q);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Sidebar selection list */}
      <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-gray-150 shadow-2xs space-y-4">
        <div className="border-b border-gray-100 pb-2.5">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            📚 在线词句练习库
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">选择下方已启用的试题卡展开评测练手</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded font-medium text-gray-700"
            >
              <option value="全部">全部语种</option>
              <option value="英语">英语</option>
              <option value="中文">中文</option>
              <option value="日语">日语</option>
            </select>
          </div>
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded font-medium text-gray-700"
            >
              <option value="全部">全部难度</option>
              <option value="简单">简单</option>
              <option value="中等">中等</option>
              <option value="困难">困难</option>
            </select>
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {filteredActiveQuestions.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              暂无匹配的可做测验习题
            </div>
          ) : (
            filteredActiveQuestions.map(q => {
              const isSelected = currentQuestion?.id === q.id;
              const hasBlanks = q.type === '填空';

              return (
                <button
                  key={q.id}
                  onClick={() => selectAnotherQuestion(q)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-100'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-500 font-mono">#{q.id}</span>
                    <div className="flex items-center gap-1">
                      <span className="bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded scale-90">
                        {q.language}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        hasBlanks ? 'bg-teal-50 text-teal-700 border border-teal-250' : 'bg-indigo-50 text-indigo-750'
                      }`}>
                        {q.type === '填空' ? '阅读填空' : q.type}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-gray-800 line-clamp-2">
                    {q.originalQuestion || q.questionContent || '暂无题目描述'}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>考点: {q.dimension}</span>
                    <span className={`font-bold ${
                      q.difficulty === '简单' ? 'text-emerald-600' : q.difficulty === '中等' ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main question workbook */}
      <div className="lg:col-span-8 space-y-6">
        {!currentQuestion ? (
          <div className="bg-white p-12 rounded-xl border border-gray-150 text-center text-gray-400">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-sm">暂无选定题目，请在左侧列表点击一道题目开始作答评测。</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-150 shadow-2xs overflow-hidden">
            {/* Banner card */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-300 bg-blue-900/40 px-2 py-0.5 rounded-full border border-blue-800 uppercase tracking-wider">
                  在线练习区 • {currentQuestion.type}题
                </span>
                <h1 className="text-base font-bold text-white tracking-wide">
                  {currentQuestion.language}阅读理解检测（考察点：{currentQuestion.dimension}）
                </h1>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium bg-white/10 px-2.5 py-1 rounded">
                  难度级别: <strong className="text-amber-300">{currentQuestion.difficulty}</strong>
                </span>
              </div>
            </div>

            {/* Layout divided inside */}
            <div className="p-6 space-y-6">
              {/* Question illustration if any */}
              {currentQuestion.imageUrl && (
                <div className="max-w-md mx-auto aspect-video max-h-48 overflow-hidden rounded-xl border border-gray-100 shadow-3xs bg-gray-50">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Reading illustrative visual"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* READING ARTICLE (Notebook themed container) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <BookOpen size={13} className="text-blue-500" />
                  阅读文章 (Reading Article)：
                </span>

                <div className="bg-[#faf9f6] border border-gray-200 rounded-xl p-5 md:p-6 shadow-3xs relative overflow-hidden">
                  {/* Decorative lined notebooks pattern */}
                  <div className="absolute top-0 bottom-0 left-4 w-[1px] bg-red-100"></div>

                  <div className="pl-4 prose prose-slate">
                    {currentQuestion.type === '填空' ? (
                      renderArticleWithInputs(
                        currentQuestion.articleContent,
                        currentQuestion.blankAnswers || []
                      )
                    ) : (
                      <p className="leading-relaxed text-gray-800 text-sm md:text-base whitespace-pre-wrap">
                        {renderPartText(currentQuestion.articleContent)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* QUESTION BODY (Question prompts and input configurations) */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase tracking-wider">
                  <HelpCircle size={14} className="text-blue-500" />
                  题目问题与作答：
                </div>

                <div className="pl-1">
                  {currentQuestion.type === '填空' ? (
                    renderQuestionWithInputs(
                      currentQuestion.questionContent,
                      currentQuestion.blankAnswers || []
                    )
                  ) : (
                    <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                      {renderPartText(currentQuestion.questionContent)}
                    </p>
                  )}
                </div>

                {/* 1. Choice Options Selector (for choice type) */}
                {currentQuestion.type !== '填空' && currentQuestion.options && (
                  <div className="space-y-3 pt-2">
                    {currentQuestion.options.map((opt) => {
                      // Extract option letter like 'A', 'B' etc.
                      const letter = opt.includes(')') ? opt.split(')')[0].trim() : opt[0];
                      const isSingle = currentQuestion.type === '单选';

                      const isSelected = isSingle
                        ? answers['choice'] === letter
                        : (answers['selected'] || []).includes(letter);

                      const opTextOnly = opt.includes(')') ? opt.split(')').slice(1).join(')').trim() : opt;

                      return (
                        <button
                          key={letter}
                          type="button"
                          disabled={submitted}
                          onClick={() => {
                            if (isSingle) {
                              setAnswers({ choice: letter });
                            } else {
                              const currentSelected = answers['selected'] || [];
                              if (currentSelected.includes(letter)) {
                                setAnswers({ selected: currentSelected.filter((l: string) => l !== letter) });
                              } else {
                                setAnswers({ selected: [...currentSelected, letter].sort() });
                              }
                            }
                          }}
                          className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3.5 shadow-3xs transition-all cursor-pointer ${
                            submitted
                              ? isSelected
                                ? evalResult?.isCorrect
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                                  : 'bg-rose-50 border-rose-400 text-rose-800'
                                : 'bg-white text-gray-700'
                              : isSelected
                                ? 'bg-blue-50/70 border-blue-400 text-blue-800 font-semibold ring-1 ring-blue-100'
                                : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {/* Circle prefix indicator */}
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {letter}
                          </div>

                          <span className="flex-1 text-sm font-medium">{opTextOnly}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SUBMISSION / STATUS RESULTS REPORT */}
              {evalResult && (
                <div className={`p-4 rounded-xl border flex gap-3.5 items-start animate-fade-in ${
                  evalResult.isCorrect
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                    : 'bg-amber-50 border-amber-100 text-amber-800'
                }`}>
                  {evalResult.isCorrect ? (
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                  ) : (
                    <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                  )}

                  <div className="space-y-1 flex-1">
                    <h3 className="text-sm font-bold">
                      {evalResult.isCorrect ? (
                        <span>🎉 判定通过！全部作答正确！</span>
                      ) : (
                        <span>⚠️ 评测完成（正确率：{evalResult.score}%）</span>
                      )}
                    </h3>

                    <div className="text-xs space-y-1 bg-white/40 p-2.5 rounded border border-black/5 leading-relaxed">
                      <p>
                        在总共 {evalResult.totalCount} 个题目考查点中，您正确回答了{' '}
                        <strong className="text-indigo-800 font-extrabold">{evalResult.correctCount}</strong> 个。
                      </p>

                      {/* Display correct solution hints specifically for Fill-in-the-blank */}
                      {currentQuestion.type === '填空' && (
                        <div className="mt-1.5 space-y-1">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">正确答案对照数据库：</span>
                          {currentQuestion.blankAnswers?.map(b => {
                            const userAns = (answers[b.id] || '').trim();
                            const isIndividualCorrect = evalResult.details[b.id]?.isCorrect;
                            return (
                              <div key={b.id} className="text-[11px] flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold underline">{b.id}：</span>
                                <span className={`px-1 rounded-sm text-[10px] ${isIndividualCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                  您的答案: "{userAns || '未填'}"
                                </span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-600 font-bold">
                                  认可的答案池: [{b.acceptableAnswers.join(' / ')}]
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION FOOTER */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-150">
                {submitted ? (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-2 hover:bg-gray-100 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-3xs"
                  >
                    <RefreshCw size={14} className="animate-spin-hover" />
                    再试一遍 (Re-try)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitAnswers}
                    disabled={Object.keys(answers).length === 0}
                    className="px-6 py-2 hover:bg-blue-700 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-45 disabled:pointer-events-none"
                  >
                    <span>提交答案评测</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
