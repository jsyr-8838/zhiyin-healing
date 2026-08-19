import { Save, Phone } from 'lucide-react';

interface ProfileEditorProps {
  editName: string;
  editGender: 'male' | 'female';
  editBirthDate: string;
  editBirthHour: string;
  editIsLunar: boolean;
  editIsLeapMonth: boolean;
  editPhone: string;
  setEditName: (v: string) => void;
  setEditGender: (v: 'male' | 'female') => void;
  setEditBirthDate: (v: string) => void;
  setEditBirthHour: (v: string) => void;
  setEditIsLunar: (v: boolean) => void;
  setEditIsLeapMonth: (v: boolean) => void;
  setEditPhone: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function ProfileEditor({
  editName, editGender, editBirthDate, editBirthHour,
  editIsLunar, editIsLeapMonth, editPhone,
  setEditName, setEditGender, setEditBirthDate, setEditBirthHour,
  setEditIsLunar, setEditIsLeapMonth, setEditPhone,
  onCancel, onSave,
}: ProfileEditorProps) {
  return (
    <div className="space-y-4">
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
        <h4 className="font-bold text-purple-800 mb-1">命主档案</h4>
        <p className="text-xs text-purple-500">填写后所有术数解读将更加精准个性化</p>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <label className="text-sm text-gray-700 mb-2 block font-bold">姓名</label>
        <input
          type="text" maxLength={20}
          value={editName}
          onChange={e => setEditName(e.target.value)}
          placeholder="输入姓名"
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <label className="text-sm text-gray-700 mb-2 block font-bold">性别</label>
        <div className="flex gap-3">
          {[
            { v: 'male' as const, l: '男', icon: '♂' },
            { v: 'female' as const, l: '女', icon: '♀' },
          ].map(g => (
            <button key={g.v} onClick={() => setEditGender(g.v)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
                editGender === g.v
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              <span className="text-lg">{g.icon}</span> {g.l}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
        <div>
          <label className="text-sm text-gray-700 mb-2 block font-bold">出生日期（公历）</label>
          <input type="date" value={editBirthDate} onChange={e => setEditBirthDate(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-purple-400 focus:outline-none" />
        </div>
        <div>
          <label className="text-sm text-gray-700 mb-2 block font-bold">出生时辰（0-23时）</label>
          <input type="number" min={0} max={23} value={editBirthHour} onChange={e => setEditBirthHour(e.target.value)}
            placeholder="如：8"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:outline-none" />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={editIsLunar} onChange={e => setEditIsLunar(e.target.checked)}
              className="w-4 h-4 accent-purple-600" />
            <span className="text-sm text-gray-700">农历</span>
          </label>
          {editIsLunar && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editIsLeapMonth} onChange={e => setEditIsLeapMonth(e.target.checked)}
                className="w-4 h-4 accent-purple-600" />
              <span className="text-sm text-gray-700">闰月</span>
            </label>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <label className="text-sm text-gray-700 mb-2 block font-bold">
          <span className="flex items-center gap-1"><Phone size={14} /> 手机号（选填）</span>
        </label>
        <input
          type="tel" maxLength={11}
          value={editPhone}
          onChange={e => setEditPhone(e.target.value.replace(/\D/g, ''))}
          placeholder="用于接收运势提醒"
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:outline-none"
        />
        <p className="text-[10px] text-gray-400 mt-1">仅存储在本地，不会上传到服务器</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
        >
          取消
        </button>
        <button
          onClick={onSave}
          disabled={!editName.trim()}
          className="flex-1 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          <Save size={16} /> 保存档案
        </button>
      </div>
    </div>
  );
}
