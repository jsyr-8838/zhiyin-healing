'use client';

import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import PageContainer from '@/components/layout/PageContainer';
import { useAppStore } from '@/lib/store';
import { getClientUserId } from '@/lib/auth';
import {
  DIVINATION_METHODS_V2,
  type DivinationMethod,
  type DivineResult,
  divine,
  getDailyGanZhi,
} from '@/lib/taibu-adapter';
import { DivinationHeader } from '@/components/divination/DivinationHeader';
import { DivinationHome } from '@/components/divination/DivinationHome';
import { ProfileEditor } from '@/components/divination/ProfileEditor';
import { DivinationSetup } from '@/components/divination/DivinationSetup';
import { DivinationResult } from '@/components/divination/DivinationResult';
import { NEEDS_BIRTH_DATE, NEEDS_NUMBER, type Step } from '@/components/divination/types';

export default function DivinationPage() {
  const { lastProfile, destinee, setDestinee } = useAppStore();
  const [step, setStep] = useState<Step>('home');
  const [selectedMethod, setSelectedMethod] = useState<DivinationMethod>('meihua');
  const [question, setQuestion] = useState('');
  const [inputNumber, setInputNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthHour, setBirthHour] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isLoading, setIsLoading] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [recordId, setRecordId] = useState('');
  const [divineResult, setDivineResult] = useState<DivineResult | null>(null);

  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState<'male' | 'female'>('male');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editBirthHour, setEditBirthHour] = useState('');
  const [editIsLunar, setEditIsLunar] = useState(false);
  const [editIsLeapMonth, setEditIsLeapMonth] = useState(false);
  const [editPhone, setEditPhone] = useState('');

  const [todayGanZhi, setTodayGanZhi] = useState<{
    yearGanZhi: string; monthGanZhi: string;
    dayGanZhi: string; hourGanZhi: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const ganZhi = getDailyGanZhi();
        if (ganZhi) {
          setTodayGanZhi({
            yearGanZhi: ganZhi.year,
            monthGanZhi: ganZhi.month,
            dayGanZhi: ganZhi.day,
            hourGanZhi: ganZhi.hour,
          });
        }
      } catch { /* 静默失败 */ }
    })();
  }, []);

  function handleSelectMethod(method: DivinationMethod) {
    setSelectedMethod(method);
    if (destinee && NEEDS_BIRTH_DATE.includes(method)) {
      setBirthDate(destinee.birthDate);
      setBirthHour(String(destinee.birthHour));
      setGender(destinee.gender);
    } else if (destinee) {
      setGender(destinee.gender);
    }
    setStep('setup');
  }

  function openProfileEditor() {
    setEditName(destinee?.name || '');
    setEditGender(destinee?.gender || 'male');
    setEditBirthDate(destinee?.birthDate || '');
    setEditBirthHour(destinee ? String(destinee.birthHour) : '');
    setEditIsLunar(destinee?.isLunar || false);
    setEditIsLeapMonth(destinee?.isLeapMonth || false);
    setEditPhone(destinee?.phone || '');
    setStep('profile');
  }

  function saveProfile() {
    setDestinee({
      name: editName.trim(),
      gender: editGender,
      birthDate: editBirthDate,
      birthHour: editBirthHour ? parseInt(editBirthHour) : 12,
      isLunar: editIsLunar,
      isLeapMonth: editIsLeapMonth,
      phone: editPhone.trim(),
    });
    setStep('home');
  }

  async function handleDivine() {
    if (!question.trim()) return;
    setIsLoading(true);

    try {
      const input = {
        method: selectedMethod,
        question: question.trim(),
        number: NEEDS_NUMBER.includes(selectedMethod) && inputNumber ? parseInt(inputNumber) : undefined,
        birthDate: NEEDS_BIRTH_DATE.includes(selectedMethod) ? (birthDate || undefined) : undefined,
        birthHour: NEEDS_BIRTH_DATE.includes(selectedMethod) && birthHour ? parseInt(birthHour) : undefined,
        gender,
        seed: Date.now(),
      };
      const result = await divine(input);
      setDivineResult(result);
    } catch {
      setDivineResult(null);
    }

    try {
      const userId = getClientUserId();
      const inputParams: Record<string, string | number | undefined> = {};
      if (NEEDS_NUMBER.includes(selectedMethod) && inputNumber) inputParams.number = parseInt(inputNumber);
      if (NEEDS_BIRTH_DATE.includes(selectedMethod)) {
        inputParams.birthDate = birthDate || undefined;
        inputParams.birthHour = birthHour ? parseInt(birthHour) : undefined;
      }

      const res = await fetch('/api/divination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, method: selectedMethod, question: question.trim(), inputParams, profile: lastProfile,
          destinee: destinee ? {
            name: destinee.name,
            gender: destinee.gender,
            birthDate: destinee.birthDate,
            birthHour: destinee.birthHour,
            isLunar: destinee.isLunar,
          } : undefined,
          divineResult: divineResult || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiContent(data.content);
        setRecordId(data.recordId || '');
      } else {
        setAiContent('知几解读生成失败，请重试。');
      }
    } catch {
      setAiContent('网络异常，请重试。');
    }

    setIsLoading(false);
    setStep('result');
  }

  async function handleFeedback(feedback: number) {
    if (!recordId) return;
    try {
      await fetch('/api/divination', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recordId, userId: getClientUserId(), feedback }),
      });
    } catch {}
  }

  function handleReset() {
    setStep('home');
    setQuestion('');
    setInputNumber('');
    setDivineResult(null);
    setAiContent('');
    setRecordId('');
  }

  return (
    <PageContainer theme="divination" className="pattern-hexagram pb-24">
      <DivinationHeader step={step} onGoHome={handleReset} todayGanZhi={todayGanZhi} />

      <div className="px-4 pt-5 space-y-4">
        {step === 'home' && (
          <DivinationHome
            destinee={destinee}
            onSelectMethod={handleSelectMethod}
            onOpenProfileEditor={openProfileEditor}
          />
        )}

        {step === 'profile' && (
          <ProfileEditor
            editName={editName} editGender={editGender}
            editBirthDate={editBirthDate} editBirthHour={editBirthHour}
            editIsLunar={editIsLunar} editIsLeapMonth={editIsLeapMonth}
            editPhone={editPhone}
            setEditName={setEditName} setEditGender={setEditGender}
            setEditBirthDate={setEditBirthDate} setEditBirthHour={setEditBirthHour}
            setEditIsLunar={setEditIsLunar} setEditIsLeapMonth={setEditIsLeapMonth}
            setEditPhone={setEditPhone}
            onCancel={() => setStep('home')}
            onSave={saveProfile}
          />
        )}

        {step === 'setup' && (
          <DivinationSetup
            selectedMethod={selectedMethod}
            destinee={destinee}
            question={question} inputNumber={inputNumber}
            birthDate={birthDate} birthHour={birthHour} gender={gender}
            isLoading={isLoading}
            setQuestion={setQuestion} setInputNumber={setInputNumber}
            setBirthDate={setBirthDate} setBirthHour={setBirthHour}
            setGender={setGender}
            onDivine={handleDivine}
            onOpenProfileEditor={openProfileEditor}
          />
        )}

        {step === 'result' && (
          <DivinationResult
            divineResult={divineResult}
            aiContent={aiContent}
            recordId={recordId}
            onFeedback={handleFeedback}
            onReset={handleReset}
          />
        )}

        <div className="text-center text-xs text-gray-500 py-4">
          知几为传统文化智慧，仅供参考娱乐，不作为决策依据
        </div>
      </div>

      <BottomNav />
    </PageContainer>
  );
}
