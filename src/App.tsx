import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  GraduationCap,
  History,
  FolderLock,
  Globe,
  Search,
  HelpCircle,
  TrendingUp,
  BarChart2,
  PieChart,
  ListCollapse,
  ChevronsRight,
  Info
} from 'lucide-react';
import { Question, PracticeRecord } from './types';
import { INITIAL_QUESTIONS } from './mockData';
import QuestionTable from './components/QuestionTable';
import AddQuestionModal from './components/AddQuestionModal';
import PracticeView from './components/PracticeView';
import RecordsView from './components/RecordsView';

type TabType = '工作台' | '测评记录' | '题目管理' | '题库管理';

export default function App() {
  // --- Selected Tab State ---
  const [activeTab, setActiveTab] = useState<TabType>('题目管理'); // Make '题目管理' active by default to match screenshot state!

  // --- Core States (Questions & Records) ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [records, setRecords] = useState<PracticeRecord[]>([]);

  // ---- Modal Open States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);

  // --- Load and Save to LocalStorage ---
  useEffect(() => {
    const savedQuestions = localStorage.getItem('AISTUDIO_QUESTIONS');
    if (savedQuestions) {
      try {
        setQuestions(JSON.parse(savedQuestions));
      } catch (err) {
        setQuestions(INITIAL_QUESTIONS);
      }
    } else {
      setQuestions(INITIAL_QUESTIONS);
      localStorage.setItem('AISTUDIO_QUESTIONS', JSON.stringify(INITIAL_QUESTIONS));
    }

    const savedRecords = localStorage.getItem('AISTUDIO_RECORDS');
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch (err) {
        setRecords([]);
      }
    }
  }, []);

  const saveQuestionsToStorage = (updatedList: Question[]) => {
    setQuestions(updatedList);
    localStorage.setItem('AISTUDIO_QUESTIONS', JSON.stringify(updatedList));
  };

  const saveRecordsToStorage = (updatedHistory: PracticeRecord[]) => {
    setRecords(updatedHistory);
    localStorage.setItem('AISTUDIO_RECORDS', JSON.stringify(updatedHistory));
  };

  // --- CRUD Handlers ---
  const handleOpenAddModal = () => {
    setQuestionToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q: Question) => {
    setQuestionToEdit(q);
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = questions.filter(q => q.id !== id);
    saveQuestionsToStorage(updated);
  };

  const handleToggleQuestionStatus = (id: string) => {
    const updated = questions.map(q => {
      if (q.id === id) {
        return { ...q, enabled: !q.enabled };
      }
      return q;
    });
    saveQuestionsToStorage(updated);
  };

  const handleSaveQuestion = (q: Question) => {
    const exists = questions.some(item => item.id === q.id);
    let updated: Question[];

    if (exists) {
      updated = questions.map(item => item.id === q.id ? q : item);
    } else {
      updated = [...questions, q];
    }

    saveQuestionsToStorage(updated);
    setIsModalOpen(false);
    setQuestionToEdit(null);
  };

  const handleAddRecord = (record: PracticeRecord) => {
    const updated = [...records, record];
    saveRecordsToStorage(updated);
  };

  const handleClearRecords = () => {
    saveRecordsToStorage([]);
  };

  // --- Dynamic Dashboard computations for the "题库管理" Tab ---
  const fillQuestions = questions.filter(q => q.type === '填空');
  const choiceQuestions = questions.filter(q => q.type === '单选' || q.type === '多选');
  const totalQuestions = questions.length;
  const enabledQuestions = questions.filter(q => q.enabled).length;

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 flex flex-col font-sans select-none antialiased">
      {/* 1. TOP HEADER (Mimics the high fidelity user screenshot) */}
      <header className="bg-[#1e293b] text-white shrink-0 border-b border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-14">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              A
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-wide">智能教学测评 & 题库管理平台</h1>
              <p className="text-[10px] text-gray-400">Smart Language Assessment Suite</p>
            </div>
          </div>

          {/* Interactive Navigation Tags (matching screenshot) */}
          <nav className="flex items-center gap-1.5 md:gap-3 px-4 flex-1 justify-center md:justify-start md:ml-10">
            {(['工作台', '测评记录', '题目管理', '题库管理'] as TabType[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab === '工作台' && '✏️ '}
                  {tab === '测评记录' && '📊 '}
                  {tab === '题目管理' && '⚙️ '}
                  {tab === '题库管理' && '🗂️ '}
                  {tab}
                  {tab === '题目管理' && (
                    <span className="ml-1 px-1 bg-emerald-500 text-white rounded-[4px] text-[9px] font-bold">
                      {questions.length}
                    </span>
                  )}
                  {tab === '工作台' && fillQuestions.length > 0 && (
                    <span className="ml-1 px-1 bg-teal-500 text-white rounded-[4px] text-[9px] font-bold animate-pulse">
                      填空
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Account / Settings profile on far right */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Environment select indicator */}
            <div className="hidden md:flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 transition-colors px-2.5 py-1 rounded-md border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
              <span className="text-gray-300">环境：</span>
              <span className="text-white font-semibold">测试环境 ▾</span>
            </div>

            {/* Quick tool icons */}
            <div className="hidden lg:flex items-center gap-2 text-slate-400">
              <button className="p-1 hover:text-white transition-colors" title="语种选择">
                <Globe size={15} />
              </button>
              <button className="p-1 hover:text-white transition-colors" title="搜索中心">
                <Search size={15} />
              </button>
              <button className="p-1 hover:text-white transition-colors" title="使用说明">
                <HelpCircle size={15} />
              </button>
            </div>

            {/* User credentials */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-700">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-gray-100">王琪璐 Jasmine</p>
                <p className="text-[10px] text-gray-400">高级管理员</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80"
                alt="Jasmine profile"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-600 shadow-3xs"
              />
            </div>
          </div>

        </div>
      </header>

      {/* 2. SUB-BAR INFO HERO BANNER */}
      <div className="bg-white border-b border-gray-200 py-3.5 px-4 md:px-6 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-extrabold text-slate-800">
                {activeTab === '题目管理' && '🗂️ 题库目录清单 & 系统后台配置'}
                {activeTab === '工作台' && '📖 阅读填空 & 答题测验练习沙盒'}
                {activeTab === '测评记录' && '📈 个人答题评测统计流水'}
                {activeTab === '题库管理' && '⚙️ 智能题库存留总览指标'}
              </h2>
              {activeTab === '工作台' && (
                <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  支持多答案匹配校验 ★
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {activeTab === '题目管理' && '支持新增、修改语言题目。对于新增的【阅读填空题】，您可以在下方录入多个正确答案（答案池），学生的输入匹配任意一个即判断正确！'}
              {activeTab === '工作台' && '学生可以直接在阅读文章中嵌入的输入框内答题。点击下方【提交答案评测】自动比对数据库，实时批改并罗列全部可接受正确答案！'}
              {activeTab === '测评记录' && '自动汇总记录每一次答题耗时、得分以及空缺匹配情况。您可以在此观察所有试题正确率指标。'}
              {activeTab === '题库管理' && '以图形和指标的形式，展示数据库中当前积攒的各类题型、难度和语种数量占比。'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab === '题目管理' && (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                新增题目 +
              </button>
            )}
            {activeTab !== '工作台' && (
              <button
                onClick={() => setActiveTab('工作台')}
                className="px-4 py-2 hover:bg-slate-100 border border-gray-300 bg-white text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-3xs"
              >
                去答题测评练习 ✏️
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. CORE VIEWS BOX */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 overflow-y-auto">
        {/* Dynamic Tab Switcher */}
        {activeTab === '题目管理' && (
          <QuestionTable
            questions={questions}
            onAddQuestion={handleOpenAddModal}
            onEditQuestion={handleOpenEditModal}
            onDeleteQuestion={handleDeleteQuestion}
            onToggleStatus={handleToggleQuestionStatus}
          />
        )}

        {activeTab === '工作台' && (
          <PracticeView
            questions={questions}
            onAddRecord={handleAddRecord}
          />
        )}

        {activeTab === '测评记录' && (
          <RecordsView
            records={records}
            onClearRecords={handleClearRecords}
          />
        )}

        {activeTab === '题库管理' && (
          <div className="space-y-6">
            {/* Top General Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block tracking-wide uppercase">累计试题总和</span>
                <span className="text-3xl font-black text-gray-900 font-mono">{totalQuestions} <span className="text-sm font-normal text-gray-400">道</span></span>
                <p className="text-[10px] text-emerald-600 font-medium">其中包括 {enabledQuestions} 道已启用练习题</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block tracking-wide uppercase">阅读填空题 (重点)</span>
                <span className="text-3xl font-black text-teal-600 font-mono">{fillQuestions.length} <span className="text-sm font-normal text-gray-400">道</span></span>
                <p className="text-[10px] text-gray-500 font-medium">占平台全部题型的 {totalQuestions > 0 ? Math.round((fillQuestions.length / totalQuestions) * 100) : 0}%</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block tracking-wide uppercase">选择类多选/单选</span>
                <span className="text-3xl font-black text-indigo-600 font-mono">{choiceQuestions.length} <span className="text-sm font-normal text-gray-400">道</span></span>
                <p className="text-[10px] text-gray-500 font-medium">包含单项选择及多项合并选择</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-2xs space-y-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wide uppercase">作答流水累计</span>
                  <span className="text-3xl font-black text-amber-500 font-mono">{records.length} <span className="text-sm font-normal text-gray-400">次</span></span>
                </div>
                <button
                  onClick={() => setActiveTab('测评记录')}
                  className="text-[10px] font-bold text-blue-600 hover:underline text-left mt-1"
                >
                  查看历史流水详情 ▾
                </button>
              </div>
            </div>

            {/* Middle detail bento section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left bento: highlights of fill-in the blanks */}
              <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <TrendingUp size={15} className="text-teal-600" />
                  阅读填空题（多答案判定）特色说明
                </h3>

                <ul className="space-y-3.5 text-xs text-gray-600 leading-relaxed font-medium">
                  <li className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 font-bold flex items-center justify-center shrink-0">1</span>
                    <span>
                      <strong>动态挖空机制：</strong>您在题目的“文章内容”或“题目内容”内，可以使用编辑器添加如 <code className="bg-slate-100 border px-1 rounded text-red-600">[填空1]</code> 的标记。系统就会智能识别并将输入框内嵌渲染！
                    </span>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 font-bold flex items-center justify-center shrink-0">2</span>
                    <span>
                      <strong>认可答案池配置：</strong>每个空格支持设定“多候选正确词语”（不限制个数）。只要学生的最终拼写输入和您设定的<b>任意一个</b>词匹配上即判定得满分，无需刻板死抠固定答案。
                    </span>
                  </li>
                  <li className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 font-bold flex items-center justify-center shrink-0">3</span>
                    <span>
                      <strong>容错规则（白名单）：</strong>校验逻辑极其健壮。在评阅比对时，系统会自动修剪首尾冗余空格、并智能忽略中英文或字母大小写的极细微差别。
                    </span>
                  </li>
                </ul>

                <div className="p-3 bg-teal-50 rounded-lg border border-teal-100 text-xs text-teal-850 space-y-1">
                  <span className="font-bold block">💡 练习示例：</span>
                  <p className="leading-relaxed">
                    例如：若某篇英文挖空填入“地球顺序”。您添加的正解为：<code className="bg-white border px-1.5 py-0.2 rounded text-teal-800 font-bold">"third"</code>、<code className="bg-white border px-1.5 py-0.2 rounded text-teal-800 font-bold">"3rd"</code>、<code className="bg-white border px-1.5 py-0.2 rounded text-teal-800 font-bold">"3"</code>。不管同学提交哪一个，都能自动识别对，从而避免误批或漏判！
                  </p>
                </div>
              </div>

              {/* Right bento: Quick practice list shortcut */}
              <div className="bg-white p-6 rounded-xl border border-gray-150 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <BarChart2 size={15} className="text-indigo-600" />
                  当前推荐阅读填空题速通
                </h3>

                {fillQuestions.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs">
                    未录入任何阅读填空题目，请切换到【题目管理】手工新增一道！
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fillQuestions.slice(0, 3).map(q => (
                      <div
                        key={q.id}
                        className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-55/40 hover:bg-indigo-50/20 hover:border-indigo-200 transition-all"
                      >
                        <div className="space-y-1 pr-3">
                          <p className="text-xs font-bold text-gray-800 line-clamp-1">{q.originalQuestion || q.questionContent}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <span>语种：{q.language}</span>
                            <span>难度：{q.difficulty}</span>
                            <span>含 {q.blankAnswers?.length || 0} 个填空项</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setActiveTab('工作台');
                          }}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-0.5 cursor-pointer"
                        >
                          去练习
                          <ChevronsRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. MODAL DRAWER OVERLAY */}
      <AddQuestionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setQuestionToEdit(null);
        }}
        onSave={handleSaveQuestion}
        questionToEdit={questionToEdit}
      />
    </div>
  );
}
