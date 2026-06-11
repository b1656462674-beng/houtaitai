import React from 'react';
import { Award, Clock, HelpCircle, FileText, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { PracticeRecord } from '../types';

interface RecordsViewProps {
  records: PracticeRecord[];
  onClearRecords: () => void;
}

export default function RecordsView({ records, onClearRecords }: RecordsViewProps) {
  // Stats
  const totalAttempts = records.length;
  const correctCount = records.filter(r => r.isCorrect).length;
  const avgAccuracy = totalAttempts > 0
    ? Math.round(records.reduce((acc, r) => acc + r.score, 0) / totalAttempts)
    : 0;

  return (
    <div className="space-y-6">
      {/* Cards Statistics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total attempts */}
        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <FileText size={22} />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-400 font-medium tracking-wide block uppercase">完成测验总数</span>
            <span className="text-2xl font-black text-gray-900 font-mono">{totalAttempts} <span className="text-xs font-normal text-gray-400">次</span></span>
          </div>
        </div>

        {/* Global Accuracy Rate */}
        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <Award size={22} />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-400 font-medium tracking-wide block uppercase">平均正确率得点</span>
            <span className="text-2xl font-black text-emerald-600 font-mono">{avgAccuracy}%</span>
          </div>
        </div>

        {/* Completed correct rate */}
        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <CheckCircle size={22} />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs text-gray-400 font-medium tracking-wide block uppercase">全部答对次数</span>
            <span className="text-2xl font-black text-indigo-600 font-mono">
              {correctCount} <span className="text-xs font-normal text-gray-400">/ {totalAttempts} 次</span>
            </span>
          </div>
        </div>
      </div>

      {/* Attempts log table card */}
      <div className="bg-white rounded-xl border border-gray-150 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-150 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-800">📋 作答测评历史记录流水</h2>
            <p className="text-[11px] text-gray-450 mt-0.5">记录每一次在工作台向系统点击“提交答案评测”的详细得分记录</p>
          </div>

          {records.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('确认清空所有历史测评记录吗？此操作无法恢复。')) {
                  onClearRecords();
                }
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              <Trash2 size={12} />
              清空记录
            </button>
          )}
        </div>

        {/* List Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-150 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-4 w-12 text-center">序号</th>
                <th className="py-2.5 px-4 w-28">测验类型</th>
                <th className="py-2.5 px-4">知识点题目缩影</th>
                <th className="py-2.5 px-4 w-24 text-center">系统打分</th>
                <th className="py-2.5 px-4 w-24 text-center">判定</th>
                <th className="py-2.5 px-4 w-28">作答耗时</th>
                <th className="py-2.5 px-4 w-36">录入时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-650">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <div className="space-y-1.5 flex flex-col items-center">
                      <Clock size={24} className="text-gray-300" />
                      <p className="font-semibold text-sm">暂无任何历史测评记录</p>
                      <p className="text-xs text-gray-405">请切回 “工作台” 选择题目录入答案并提交评测后再来进行观察！</p>
                    </div>
                  </td>
                </tr>
              ) : (
                [...records].reverse().map((rec, index) => {
                  return (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-gray-400">
                        {records.length - index}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-xs">
                        <span className={`inline-block px-1.5 py-0.2 rounded border ${
                          rec.questionType === '填空'
                            ? 'bg-teal-50 text-teal-700 border-teal-150'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-150'
                        }`}>
                          {rec.questionType === '填空' ? '📝 阅读填空' : rec.questionType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-gray-800 max-w-xs md:max-w-md truncate">
                        {rec.questionTitle}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold font-mono">
                        <span className={rec.score === 100 ? 'text-emerald-600' : rec.score > 0 ? 'text-amber-600' : 'text-rose-500'}>
                          {rec.score} 分
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {rec.isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-605 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                            全部正确
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-605 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                            有空填错
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center text-xs font-mono text-gray-500">
                        {rec.timeSpentSeconds} 秒
                      </td>

                      <td className="py-3.5 px-4 text-xs font-mono text-gray-450">
                        {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}{' '}
                        ({new Date(rec.createdAt).toLocaleDateString()})
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
