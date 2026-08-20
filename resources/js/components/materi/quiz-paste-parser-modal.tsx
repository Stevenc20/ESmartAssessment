import { router } from '@inertiajs/react';
import {
    CheckCircle2,
    Copy,
    FileSpreadsheet,
    HelpCircle,
    Loader2,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ParsedQuiz = {
    id: string;
    soal: string;
    opsi: string[];
    jawaban_benar: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    materiId: number;
};

const SAMPLE_PASTE_TEXT = `1. Apakah singkatan dari HTML?
A. HyperText Markup Language
B. HighText Machine Language
C. HyperTransfer Mark Language
D. HyperTool Markup Language
Jawaban: A

2. Manakah simbol variabel pada bahasa PHP?
A. #
B. $
C. %
D. &
Jawaban: B`;

export default function QuizPasteParserModal({
    open,
    onOpenChange,
    materiId,
}: Props) {
    const [rawText, setRawText] = useState('');
    const [importing, setImporting] = useState(false);

    // Auto-Parser Algorithm
    const parsedQuestions = useMemo(() => {
        if (!rawText.trim()) return [];

        const lines = rawText.split(/\r?\n/);
        const results: ParsedQuiz[] = [];

        let currentSoal = '';
        let currentOpsi: string[] = [];
        let currentJawaban = '';

        const finalizeCurrent = () => {
            if (currentSoal.trim() && currentOpsi.length >= 2) {
                // If no correct answer was detected, default to first option
                let validJawaban = currentJawaban.trim();
                if (!validJawaban || !currentOpsi.includes(validJawaban)) {
                    validJawaban = currentOpsi[0];
                }

                results.push({
                    id: Math.random().toString(36).substring(2, 9),
                    soal: currentSoal.trim(),
                    opsi: [...currentOpsi],
                    jawaban_benar: validJawaban,
                });
            }
            currentSoal = '';
            currentOpsi = [];
            currentJawaban = '';
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Check if line indicates answer key e.g. "Jawaban: A" or "Kunci: B" or "Jawaban Benar: C"
            const answerMatch = line.match(
                /^(?:jawaban|kunci|key|kunci jawaban)[\s:]+([a-eA-E0-9\.\)\s]+)/i,
            );
            if (answerMatch) {
                const ansKey = answerMatch[1].trim().toUpperCase().replace(/[\.\)]/g, '');
                // Map A, B, C, D to actual option index
                const charCode = ansKey.charCodeAt(0);
                if (charCode >= 65 && charCode <= 69) {
                    const idx = charCode - 65;
                    if (currentOpsi[idx]) {
                        currentJawaban = currentOpsi[idx];
                    }
                } else if (!isNaN(Number(ansKey))) {
                    const idx = Number(ansKey) - 1;
                    if (currentOpsi[idx]) {
                        currentJawaban = currentOpsi[idx];
                    }
                }
                continue;
            }

            // Check if line is a Question start e.g. "1. Question", "Soal 1:", "Q1."
            const questionStartMatch = line.match(/^(?:soal\s*)?(?:q)?(\d+)[\.\)\:\-]\s+(.+)/i);

            if (questionStartMatch) {
                // Finalize previous question block
                finalizeCurrent();
                currentSoal = questionStartMatch[2].trim();
                continue;
            }

            // Check if line is an Option choice e.g. "A. Option", "a) Option", "*A. Option"
            // We only match letters A-H to prevent matching numbered lists if they weren't caught above
            const optionMatch = line.match(/^[\*\-]?\s*([a-hA-H])[\.\)\:\-]\s+(.+)/);
            const isStarredOption = line.startsWith('*');

            if (currentSoal && optionMatch) {
                const optText = optionMatch[2].trim();
                currentOpsi.push(optText);

                if (isStarredOption || line.toLowerCase().includes('(benar)')) {
                    currentJawaban = optText;
                }
                continue;
            }

            if (!currentSoal) {
                // First line without number is treated as Question
                currentSoal = line;
            } else if (currentOpsi.length === 0) {
                // Multiline question continuation
                currentSoal += '\n' + line;
            } else {
                // Multiline option continuation
                currentOpsi[currentOpsi.length - 1] += '\n' + line;
            }
        }

        // Finalize last item
        finalizeCurrent();

        return results;
    }, [rawText]);

    const handleImportSubmit = () => {
        if (parsedQuestions.length === 0) return;

        setImporting(true);

        const payload = {
            items: parsedQuestions.map((q) => ({
                soal: q.soal,
                opsi: q.opsi,
                jawaban_benar: q.jawaban_benar,
            })),
        };

        router.post(`/materi/${materiId}/quiz/batch`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                setRawText('');
            },
            onFinish: () => setImporting(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-6 rounded-2xl">
                <DialogHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-slate-900">
                                Import Soal Massal (Copy-Paste Google Forms)
                            </DialogTitle>
                            <p className="text-xs text-slate-500">
                                Tempelkan teks soal & pilihan A-D dari Word/GForms. Sistem akan mengenali soal secara otomatis.
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4 flex-1 overflow-y-auto min-h-0">
                    {/* Left Column: Textarea input */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700">
                                Tempelkan Teks Soal Di Sini:
                            </label>
                            <button
                                type="button"
                                onClick={() => setRawText(SAMPLE_PASTE_TEXT)}
                                className="text-[11px] font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
                            >
                                <Copy className="h-3 w-3" /> Isi Contoh Teks
                            </button>
                        </div>
                        <textarea
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder={`Contoh Format:\n1. Berapa 2 + 2?\nA. 3\nB. 4\nC. 5\nJawaban: B`}
                            className="flex-1 min-h-[300px] w-full rounded-xl border border-slate-200 p-3.5 text-xs font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none bg-slate-50/50"
                        />
                    </div>

                    {/* Right Column: Parsed Preview list */}
                    <div className="flex flex-col gap-3 min-h-0">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-700">
                                Hasil Deteksi Soal ({parsedQuestions.length} Soal):
                            </h4>
                            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                                Auto-Parsed
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl p-3.5 bg-white space-y-4 max-h-[360px]">
                            {parsedQuestions.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center py-12 text-center text-slate-400 gap-2">
                                    <FileSpreadsheet className="h-8 w-8 text-slate-300" />
                                    <p className="text-xs">
                                        Belum ada soal terdeteksi.<br />Silakan tempelkan teks soal di kolom sebelah kiri.
                                    </p>
                                </div>
                            ) : (
                                parsedQuestions.map((q, idx) => (
                                    <div
                                        key={q.id}
                                        className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2 text-xs"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-bold text-slate-900 leading-snug">
                                                <span className="text-indigo-600 font-extrabold mr-1">
                                                    {idx + 1}.
                                                </span>
                                                {q.soal}
                                            </p>
                                        </div>

                                        <div className="space-y-1 pl-4 border-l-2 border-indigo-200">
                                            {q.opsi.map((opsiText, oIdx) => {
                                                const isCorrect = opsiText === q.jawaban_benar;
                                                return (
                                                    <div
                                                        key={oIdx}
                                                        className={`flex items-center gap-2 py-0.5 px-2 rounded-md ${
                                                            isCorrect
                                                                ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                                                                : 'text-slate-600'
                                                        }`}
                                                    >
                                                        <span className="font-bold text-[10px] w-4">
                                                            {String.fromCharCode(65 + oIdx)}.
                                                        </span>
                                                        <span className="flex-1">{opsiText}</span>
                                                        {isCorrect && (
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl text-xs"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleImportSubmit}
                        disabled={parsedQuestions.length === 0 || importing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold px-5"
                    >
                        {importing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mengimpor Soal...
                            </>
                        ) : (
                            `Impor ${parsedQuestions.length} Soal Ini`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
