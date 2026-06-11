import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, CheckCircle, XCircle, Copy, AlertTriangle } from 'lucide-react';
import { Question, Language, QuestionType, Difficulty, Dimension } from '../types';

interface QuestionTableProps {
  questions: Question[];
  onAddQuestion: () => void;
  onEditQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function QuestionTable({
  questions,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onToggleStatus
}: QuestionTableProps) {
  // --- Interface Filters ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('全部');
  const [selectedType, setSelectedType] = useState<string>('全部');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('全部');
  const [selectedDimension, setSelectedDimension] = useState<string>('全部');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter computation
  const filteredQuestions = questions.filter(q => {
    const matchesSearch =
      q.originalArticle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.originalQuestion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.articleContent.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLanguage = selectedLanguage === '全部' || q.language === selectedLanguage;
    const matchesType = selectedType === '全部' || q.type === selectedType;
    const matchesDifficulty = selectedDifficulty === '全部' || q.difficulty === selectedDifficulty;
    const matchesDimension = selectedDimension === '全部' || q.dimension === selectedDimension;

    return matchesSearch && matchesLanguage && matchesType && matchesDifficulty && matchesDimension;
  });

  // Paginated Questions
  const totalCount = filteredQuestions.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + pageSize);

  // Difficulty badge colors
  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case '简单':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '中等':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case '困难':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-250';
    }
  };

  // Type badge colors
  const getTypeBadge = (t: QuestionType) => {
    switch (t) {
      case '单选':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case '多选':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case '填空':
        return 'bg-teal-50 text-teal-800 border-teal-200 font-semibold';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Strip */}
      <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-2xs space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Text Search */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="搜索文章原文、题目描述等..."
              className="w-full pl-9 pr-4 py-1.5 hover:border-gray-300 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 shadow-none focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans"
            />
          </div>

          {/* Language filter */}
          <div>
            <select
              value={selectedLanguage}
              onChange={(e) => { setSelectedLanguage(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 hover:border-gray-300 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans"
            >
              <option value="全部">语种：全部</option>
              <option value="英语">英语</option>
              <option value="中文">中文</option>
              <option value="日语">日语</option>
              <option value="韩语">韩语</option>
              <option value="法语">法语</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 hover:border-gray-300 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans font-medium"
            >
              <option value="全部">类型：全部</option>
              <option value="单选">单选</option>
              <option value="多选">多选</option>
              <option value="填空">📖 阅读填空 (新设)</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => { setSelectedDifficulty(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 hover:border-gray-300 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans"
            >
              <option value="全部">难度：全部</option>
              <option value="简单">简单</option>
              <option value="中等">中等</option>
              <option value="困难">困难</option>
            </select>
          </div>
        </div>

        {/* Quick details strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1">
              🔍 过滤结果：<strong className="text-gray-800 font-bold">{totalCount}</strong> 题
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <span>
              填空题数量：<strong className="text-teal-700 font-bold">{questions.filter(q => q.type === '填空').length}</strong> 题
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear Filters helper */}
            {(searchTerm || selectedLanguage !== '全部' || selectedType !== '全部' || selectedDifficulty !== '全部') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLanguage('全部');
                  setSelectedType('全部');
                  setSelectedDifficulty('全部');
                  setSelectedDimension('全部');
                }}
                className="text-xs text-gray-500 hover:text-blue-600 transition-colors cursor-pointer mr-1.5"
              >
                重置过滤参数
              </button>
            )}

            <button
              onClick={onAddQuestion}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all cursor-pointer shadow-xs hover:shadow-sm"
            >
              <Plus size={14} />
              新增题目
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-150 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-gray-200 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">序号</th>
                <th className="py-3 px-4 w-20">语种</th>
                <th className="py-3 px-4 w-24 text-center">题型</th>
                <th className="py-3 px-4 w-18 text-center">难度</th>
                <th className="py-3 px-4 w-20">维度</th>
                <th className="py-3 px-4">文章缩略 / 题目描述</th>
                <th className="py-3 px-4 w-24 text-center">答案数/项</th>
                <th className="py-3 px-4 w-18 text-center">状态</th>
                <th className="py-3 px-4 w-28 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {paginatedQuestions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertTriangle size={24} className="text-amber-500" />
                      <p className="font-medium text-sm">未能找到符合检索条件的题目数据</p>
                      <p className="text-xs text-gray-400">请修正过滤输入或点击右上角“新增题目”录入一道新题目</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedQuestions.map((q, index) => {
                  const globalIndex = startIndex + index + 1;
                  // Calculate blanks number or choice number
                  const answerCount = q.type === '填空'
                    ? (q.blankAnswers?.length || 0)
                    : Array.isArray(q.correctOption) ? q.correctOption.length : 1;

                  return (
                    <tr
                      key={q.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Index / ID */}
                      <td className="py-3 px-4 text-center font-mono text-xs text-gray-500">
                        {globalIndex}
                      </td>

                      {/* Language */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800">{q.language}</span>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border ${getTypeBadge(q.type)}`}>
                          {q.type === '填空' ? '📝 阅读填空' : q.type}
                        </span>
                      </td>

                      {/* Difficulty Badge */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-sm border ${getDifficultyBadge(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                      </td>

                      {/* Dimension / Skill */}
                      <td className="py-3 px-4 text-gray-600 font-medium">
                        {q.dimension}
                      </td>

                      {/* Content Description */}
                      <td className="py-3 px-4 max-w-xs md:max-w-md lg:max-w-lg">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400 truncate max-w-full italic font-mono">
                            文章: {q.originalArticle || '（无）'}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-full">
                            {q.originalQuestion || q.questionContent || '暂无题目说明'}
                          </p>
                          {q.imageUrl && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-medium">
                              🖼️ 附带插画
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Answer count details */}
                      <td className="py-3 px-4 text-center">
                        {q.type === '填空' ? (
                          <div className="space-y-1">
                            <span className="inline-block bg-emerald-50 text-emerald-800 border-emerald-100 border px-2 py-0.5 rounded-md text-xs font-bold">
                              {answerCount} 空
                            </span>
                            {/* Display correct words summary */}
                            <p className="text-[10px] text-gray-400 truncate max-w-[120px] mx-auto font-mono" title={
                              q.blankAnswers?.map(b => `${b.id}: [${b.acceptableAnswers.join('/')}]`).join(', ')
                            }>
                              {q.blankAnswers?.map(b => b.acceptableAnswers[0]).join(', ')}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-block bg-blue-50 text-blue-800 border-blue-100 border px-2 py-0.5 rounded-md text-xs font-bold">
                            {q.type === '单选' ? `单选: ${q.correctOption}` : `多选: ${(q.correctOption as string[])?.join(',')}`}
                          </span>
                        )}
                      </td>

                      {/* Enabled Status toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onToggleStatus(q.id)}
                          className="focus:outline-none cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
                          title="点击切换启用/禁用状态"
                        >
                          {q.enabled ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              启用中
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                              已禁用
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEditQuestion(q)}
                            className="p-1 text-gray-550 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                            title="修改题目"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              const proceed = window.confirm(`确认要删除此题目吗？此操作不可撤销。\n${q.originalQuestion.substring(0, 40)}`);
                              if (proceed) {
                                onDeleteQuestion(q.id);
                              }
                            }}
                            className="p-1 text-gray-550 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="彻底删除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Customized Pagination matching the mock screenshot */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-gray-55 border-t border-gray-150 text-xs text-gray-500 font-medium select-none">
          <div>
            共 <strong className="text-gray-900 font-bold">{totalCount}</strong> 条数据
          </div>

          <div className="flex items-center gap-3">
            {/* Rows count selector */}
            <div className="flex items-center gap-1">
              <span>每页</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 hover:border-gray-400 bg-white border border-gray-300 rounded font-bold text-gray-700 focus:outline-none"
              >
                <option value={5}>5 条</option>
                <option value={10}>10 条</option>
                <option value={20}>20 条</option>
                <option value={50}>50 条</option>
              </select>
            </div>

            {/* Buttons list */}
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-2 py-1 hover:border-gray-400 bg-white border border-gray-300 rounded text-gray-800 disabled:opacity-45 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                上一页
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                    page === currentPage
                      ? 'bg-blue-600 text-white border-blue-600 font-black'
                      : 'bg-white border border-gray-300 hover:border-gray-400 text-gray-750'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-2 py-1 hover:border-gray-400 bg-white border border-gray-300 rounded text-gray-800 disabled:opacity-45 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
